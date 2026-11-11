import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getClientIp, isRateLimited, logSecurityEvent, inspectFields } from "../_shared/security.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const EP = "submit-registration";

const Schema = z.object({
  event_id: z.string().uuid(),
  company_name: z.string().trim().min(1).max(200),
  contact_person: z.string().trim().min(1).max(200),
  phone_number: z.string().trim().min(1).max(50),
  team_members: z.string().max(2000).nullable().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const ip = getClientIp(req);
    if (await isRateLimited(ip, EP, 5, 600)) {
      await logSecurityEvent(req, EP, "rate_limit", "medium");
      return json({ error: "Too many requests" }, 429);
    }
    const raw = await req.text();
    if (raw.length > 10000) {
      await logSecurityEvent(req, EP, "oversize", "low", { size: raw.length });
      return json({ error: "Invalid request" }, 400);
    }
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch {
      await logSecurityEvent(req, EP, "invalid_input", "low");
      return json({ error: "Invalid request" }, 400);
    }
    // Honeypot / timing (optional fields: older frontends omit them)
    if (typeof body.website === "string" && body.website.length > 0) {
      await logSecurityEvent(req, EP, "honeypot", "medium", { value: body.website });
      return json({ ok: true });
    }
    if (typeof body.rendered_at === "number" && Date.now() - body.rendered_at < 2000) {
      await logSecurityEvent(req, EP, "too_fast", "low", { ms: Date.now() - body.rendered_at });
      return json({ ok: true });
    }
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      await logSecurityEvent(req, EP, "invalid_input", "low", { issues: parsed.error.flatten().fieldErrors });
      return json({ error: "Invalid request" }, 400);
    }
    const hit = inspectFields(parsed.data as Record<string, unknown>);
    if (hit) {
      await logSecurityEvent(req, EP, hit.type, "high", { field: hit.field, value: (parsed.data as any)[hit.field] });
      return json({ error: "Invalid request" }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(auth.slice(7));
      userId = data?.user?.id ?? null;
    }
    // Same rule as the RLS insert policy
    const { data: ev } = await supabase.from("events").select("id,status,registration_form_enabled").eq("id", parsed.data.event_id).maybeSingle();
    if (!ev || ev.status === "cancelled" || ev.registration_form_enabled !== true) return json({ error: "Invalid request" }, 400);

    const { error } = await supabase.from("event_registrations").insert({
      event_id: parsed.data.event_id,
      company_name: parsed.data.company_name,
      contact_person: parsed.data.contact_person,
      phone_number: parsed.data.phone_number,
      team_members: parsed.data.team_members || null,
      user_id: userId,
    });
    if (error) { console.error("insert error", error.message); return json({ error: "Could not save" }, 500); }
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500);
  }
});
