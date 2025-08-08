import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { eventId } = await req.json();
    if (!eventId || !isValidUUID(eventId)) {
      return new Response(JSON.stringify({ error: 'Invalid eventId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Try to identify user from JWT if provided
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        userId = data.user.id;
      }
    }

    // Derive IP and hash it for privacy-preserving rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('cf-connecting-ip') ||
               req.headers.get('x-real-ip') ||
               '0.0.0.0';
    const salt = SERVICE_ROLE_KEY; // Use service key as salt (kept secret server-side)
    const ipHash = await sha256Hex(`${salt}:${ip}`);

    const payload: Record<string, any> = {
      event_id: eventId,
      user_id: userId,
      ip_hash: userId ? null : ipHash,
    };

    const { error: insertError } = await supabase
      .from('event_interests')
      .insert(payload);

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
