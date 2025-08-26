import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getClient() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Server not configured');
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

function getIp(req: Request): string {
  const hdr = req.headers;
  return (
    hdr.get('x-forwarded-for')?.split(',')[0].trim() ||
    hdr.get('cf-connecting-ip') ||
    hdr.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export type AnalyticsPayload =
  | { kind: 'page_view'; path: string; session_id?: string; referrer?: string | null; ua?: string | null; vp?: { w?: number; h?: number } }
  | { kind: 'event'; path: string; session_id?: string; name: string; label?: string | null; value?: number | null; meta?: Record<string, unknown> }
  | { kind: 'vital'; path: string; session_id?: string; name: string; value: number; rating?: string | null };

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = getClient();
    const ip = getIp(req);

    // Try to resolve user id (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    const body = (await req.json()) as AnalyticsPayload | AnalyticsPayload[];
    const payloads = Array.isArray(body) ? body : [body];

    for (const p of payloads) {
      if (p.kind === 'page_view') {
        await supabase.from('analytics_page_views').insert({
          user_id: userId,
          session_id: (p as any).session_id || crypto.randomUUID(),
          path: p.path,
          referrer: p.referrer ?? null,
          user_agent: p.ua ?? null,
          viewport_width: p.vp?.w ?? null,
          viewport_height: p.vp?.h ?? null,
          ip_address: ip,
        });
      } else if (p.kind === 'event') {
        await supabase.from('analytics_events').insert({
          user_id: userId,
          session_id: (p as any).session_id || crypto.randomUUID(),
          path: p.path,
          event_name: p.name,
          event_label: p.label ?? null,
          event_value: p.value ?? null,
          metadata: p.meta ?? {},
          ip_address: ip,
        });
      } else if (p.kind === 'vital') {
        await supabase.from('analytics_web_vitals').insert({
          session_id: crypto.randomUUID(),
          path: p.path,
          name: p.name,
          value: p.value,
          rating: p.rating ?? null,
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('log-analytics error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
