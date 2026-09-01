import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const adminEmails = new Set((Deno.env.get('ADMIN_EMAILS') ?? '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean));
const corsHeaders = { 'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Origin': '*' };

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'GET' && request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  const authorization = request.headers.get('authorization');
  if (!authorization) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user?.email || !adminEmails.has(user.email.toLowerCase())) return new Response('Forbidden', { status: 403, headers: corsHeaders });

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const [{ data: authUsers, error: authError }, { data: profiles, error: profilesError }] = await Promise.all([
    serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 }),
    serviceClient.from('profiles').select('id, full_name, avatar_url, invite_code, streak_days'),
  ]);
  if (authError || profilesError) return Response.json({ error: authError?.message || profilesError?.message }, { status: 500, headers: corsHeaders });

  const profileById = new Map((profiles ?? []).map(profile => [profile.id, profile]));
  const users = (authUsers.users ?? []).map(authUser => ({
    id: authUser.id,
    email: authUser.email,
    created_at: authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at,
    ...profileById.get(authUser.id),
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return Response.json(users, { headers: corsHeaders });
});
