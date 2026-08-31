import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

export const isWebPushConfigured = () => Boolean(isSupabaseConfigured && supabase && vapidPublicKey);

export const isWebPushSupported = () =>
  typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator;

export async function hasPushSubscription() {
  if (!isWebPushSupported()) return false;
  const registration = await navigator.serviceWorker.ready;
  return Boolean(await registration.pushManager.getSubscription());
}

export async function subscribeToPushNotifications(userId: string) {
  if (!isWebPushConfigured()) {
    throw new Error('Push notifications are not configured for this deployment.');
  }
  if (!isWebPushSupported()) {
    throw new Error('This browser does not support push notifications.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
  });
  const subscriptionJson = subscription.toJSON();
  const { error } = await supabase!.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscriptionJson.keys?.p256dh,
      auth: subscriptionJson.keys?.auth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      reminder_hour: 20,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  if (error) {
    await subscription.unsubscribe();
    throw new Error(error.message);
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!isWebPushSupported() || !supabase) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
  if (error) throw new Error(error.message);
  await subscription.unsubscribe();
}