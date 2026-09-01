import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const adminEmails = new Set((Deno.env.get('ADMIN_EMAILS') ?? '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean));
const corsHeaders = { 'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Origin': '*' };

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  const authorization = request.headers.get('authorization');
  if (!authorization) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user?.email || !adminEmails.has(user.email.toLowerCase())) return new Response('Forbidden', { status: 403, headers: corsHeaders });

  const payload = await request.json().catch(() => null) as { user_id?: unknown } | null;
  if (typeof payload?.user_id !== 'string' || !payload.user_id.trim()) return Response.json({ error: 'A user_id is required.' }, { status: 400, headers: corsHeaders });

  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const randomValues = new Uint32Array(16);
  crypto.getRandomValues(randomValues);
  const temporaryPassword = Array.from(randomValues, value => alphabet[value % alphabet.length]).join('');
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await serviceClient.auth.admin.updateUserById(payload.user_id.trim(), { password: temporaryPassword });
  if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });

  return Response.json({ temporary_password: temporaryPassword }, { headers: corsHeaders });
});
