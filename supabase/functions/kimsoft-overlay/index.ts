import { getClientIp, isRateLimited, logSecurityEvent, inspectFields } from "../_shared/security.ts";
const SOURCE = "https://api.kimsoftbookings.se/h/markaryds-bowlinghall/streaming/overlay";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (await isRateLimited(getClientIp(req), "kimsoft-overlay", 30, 60)) {
      await logSecurityEvent(req, "kimsoft-overlay", "rate_limit", "medium");
      return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const r = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await r.text();
    return new Response(JSON.stringify({ html }), { status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
