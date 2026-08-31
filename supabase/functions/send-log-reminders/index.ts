import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const cronSecret = Deno.env.get('PUSH_CRON_SECRET');
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

function localDateParts(timezone: string) {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const hourPart = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const valueFor = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((part) => part.type === type)?.value;

  return {
    date: `${valueFor(dateParts, 'year')}-${valueFor(dateParts, 'month')}-${valueFor(dateParts, 'day')}`,
    hour: Number(valueFor(hourPart, 'hour')),
  };
}

Deno.serve(async (request) => {
  if (request.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*');
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const subscription of subscriptions ?? []) {
    const { date, hour } = localDateParts(subscription.timezone);
    if (hour !== subscription.reminder_hour) continue;

    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('user_id', subscription.user_id)
      .eq('date', date)
      .maybeSingle();
    if (existingLog) continue;

    const { error: deliveryError } = await supabase.from('push_deliveries').insert({
      subscription_id: subscription.id,
      notification_type: 'daily_log_reminder',
      reminder_date: date,
    });
    if (deliveryError) continue;

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({
          title: "Log today's progress",
          body: 'Your daily BuddySync check-in is ready when you are.',
          url: '/',
        }),
      );
      sent++;
    } catch (pushError) {
      const statusCode = (pushError as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', subscription.id);
      }
    }
  }

  return Response.json({ sent });
});