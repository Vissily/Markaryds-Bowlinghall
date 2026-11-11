import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Severity = "low" | "medium" | "high";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const SITE = Deno.env.get("SITE_NAME") ?? "unknown-site";
const WEBHOOK = Deno.env.get("DISCORD_SECURITY_WEBHOOK_URL");

// Best effort: the header is set by the platform's proxy.
export function getClientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "unknown";
}

const PATTERNS: { type: string; re: RegExp }[] = [
  { type: "sqli", re: /\bunion\b[\s\S]{0,40}\bselect\b|'\s*(or|and)\s+['"\d][^=]{0,10}=|;\s*(drop|delete|insert|update|alter)\s|\b(sleep|benchmark|pg_sleep|waitfor\s+delay)\s*\(|information_schema|--\s*$|\/\*[\s\S]*\*\//i },
  { type: "xss", re: /<\s*script|javascript\s*:|\bon(error|load|click|mouseover)\s*=|<\s*iframe/i },
  { type: "path_traversal", re: /\.\.[\/\\]|\/etc\/passwd|(^|[\/\\])\.(env|git|htpasswd)\b/i },
];

// Returns the first matching event type, or null.
export function inspectText(value: string): string | null {
  for (const p of PATTERNS) if (p.re.test(value)) return p.type;
  return null;
}

export function inspectFields(fields: Record<string, unknown>): { type: string; field: string } | null {
  for (const [field, v] of Object.entries(fields)) {
    if (typeof v !== "string") continue;
    const type = inspectText(v);
    if (type) return { type, field };
  }
  return null;
}

// True if the URL must not be fetched server-side.
export function isForbiddenUrl(raw: string): boolean {
  let u: URL;
  try { u = new URL(raw); } catch { return true; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return true;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  if (/^\d+$/.test(h) || /^0x/i.test(h)) return true; // decimal or hex IP forms
  return false;
}

// Records the request and returns true if the IP is over the limit.
export async function isRateLimited(ip: string, endpoint: string, max: number, windowSeconds: number): Promise<boolean> {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  await admin.from("request_log").insert({ ip, endpoint });
  const { count } = await admin
    .from("request_log")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip).eq("endpoint", endpoint).gte("created_at", since);
  return (count ?? 0) > max;
}

function clip(v: unknown, max = 500): string {
  const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export async function logSecurityEvent(
  req: Request,
  endpoint: string,
  eventType: string,
  severity: Severity,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    const ip = getClientIp(req);
    const safeDetail = Object.fromEntries(Object.entries(detail).map(([k, v]) => [k, clip(v)]));
    const { data: row } = await admin.from("security_events").insert({
      site: SITE, ip, endpoint, event_type: eventType, severity,
      user_agent: clip(req.headers.get("user-agent") ?? "", 300),
      detail: safeDetail,
    }).select("id").single();

    if (!WEBHOOK || !row) return;

    const tenMin = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const hour = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    let shouldAlert = severity === "high";
    let recent = 1;
    if (!shouldAlert) {
      const { count } = await admin.from("security_events")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip).gte("created_at", tenMin);
      recent = count ?? 1;
      shouldAlert = recent >= 5;
    }
    if (!shouldAlert) return;

    const { count: alreadyAlerted } = await admin.from("security_events")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip).eq("alerted", true).gte("created_at", hour);
    if ((alreadyAlerted ?? 0) > 0) return;

    const payload = clip(JSON.stringify(safeDetail), 800).replace(/`/g, "'");
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
      body: JSON.stringify({
        allowed_mentions: { parse: [] }, // attacker text must not ping anyone
        embeds: [{
          title: `Security alert: ${eventType} on ${SITE}`,
          color: severity === "high" ? 0xd32f2f : 0xf9a825,
          fields: [
            { name: "Severity", value: severity, inline: true },
            { name: "IP", value: ip, inline: true },
            { name: "Endpoint", value: endpoint, inline: true },
            { name: "Events from this IP (10 min)", value: String(recent), inline: true },
            { name: "Detail", value: "```" + payload + "```" },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    if (res.ok) await admin.from("security_events").update({ alerted: true }).eq("id", row.id);
  } catch (_) {
    // never let logging or alerting break the request
  }
}
