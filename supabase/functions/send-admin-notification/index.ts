import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;
const adminEmails = new Set(
  (Deno.env.get('ADMIN_EMAILS') ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user?.email || !adminEmails.has(user.email.toLowerCase())) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const payload = await request.json().catch(() => null) as {
    title?: unknown;
    body?: unknown;
    url?: unknown;
  } | null;
  const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
  const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
  const url = typeof payload?.url === 'string' ? payload.url.trim() : '/';

  if (!title || !body || title.length > 80 || body.length > 240 || !url.startsWith('/')) {
    return Response.json({ error: 'Provide a title, message, and an in-app path.' }, { status: 400, headers: corsHeaders });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: subscriptions, error } = await serviceClient.from('push_subscriptions').select('*');
  if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });

  let sent = 0;
  let failed = 0;
  for (const subscription of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({ title, body, url }),
      );
      sent++;
    } catch (pushError) {
      failed++;
      const statusCode = (pushError as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await serviceClient.from('push_subscriptions').delete().eq('id', subscription.id);
      }
    }
  }

  return Response.json({ sent, failed }, { headers: corsHeaders });
});