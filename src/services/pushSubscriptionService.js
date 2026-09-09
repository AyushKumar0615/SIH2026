import { supabase } from './supabaseClient';

// applicationServerKey must be a Uint8Array, but env vars/JSON only carry
// strings — PushManager.subscribe() itself requires this exact conversion
// from the VAPID public key's URL-safe base64 form.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Registers this device for Web Push and persists the subscription against
// the authenticated user — the piece that lets send-reminder-push (a
// Supabase Edge Function, see supabase/functions/send-reminder-push) reach
// this device even when SmritiSetu isn't open. Reuses the service worker
// already registered by usePwaUpdate.js rather than registering a second
// one; only ever called from a real user action (see
// NotificationPermissionBanner.jsx), never on page load.
export const PushSubscriptionService = {
  isSupported() {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;
  },

  async subscribe(userId) {
    if (!this.isSupported() || !userId) return { ok: false, error: 'unsupported' };
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      const json = subscription.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          last_seen_at: new Date().toISOString()
        },
        { onConflict: 'endpoint' }
      );
      if (error) return { ok: false, error: 'persist_failed' };
      return { ok: true };
    } catch {
      return { ok: false, error: 'subscribe_failed' };
    }
  },

  // Keeps a subscription's row alive/replaced if the browser ever rotates
  // it (see the pushsubscriptionchange handler in public/sw.js) — same
  // upsert path as subscribe(), just triggered by the browser instead of a
  // user click.
  async replace(userId, oldEndpoint, subscription) {
    const json = subscription.toJSON();
    if (oldEndpoint && oldEndpoint !== json.endpoint) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', oldEndpoint);
    }
    await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        last_seen_at: new Date().toISOString()
      },
      { onConflict: 'endpoint' }
    );
  },

  async unsubscribe() {
    if (!this.isSupported()) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    } catch {
      // Best-effort — an unreachable subscription is already effectively gone.
    }
  }
};
