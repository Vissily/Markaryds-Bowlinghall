const SOURCE = "https://api.kimsoftbookings.se/h/markaryds-bowlinghall/streaming/overlay";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const r = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await r.text();
    return new Response(JSON.stringify({ html }), { status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
