// SmritiSetu NER — application shell service worker.
// Strategy: network-first for navigations (always prefer fresh code, fall back
// to the cached shell only when offline); cache-first for static icon/font/
// image assets (rarely change); everything else (hashed JS/CSS bundles, API
// calls) passes straight through so a new deploy is never masked by a stale
// cache.
//
// Update lifecycle: a new service worker installs in the background and then
// waits — it does NOT call skipWaiting() on its own. The page (see
// src/hooks/usePwaUpdate.js) detects the waiting worker, shows an "Update
// Now" prompt, and only sends the SKIP_WAITING message below once the user
// opts in. This is what lets a deploy update every installed user (per-tab,
// on their terms) without ever silently or forcibly reloading someone
// mid-action.
//
// CACHE_VERSION is stamped at build time (see the small plugin in
// vite.config.js that replaces this token in dist/sw.js after the build) so
// this file's bytes — and therefore this cache name — are guaranteed to
// differ on every production build, even one that only changes application
// code under src/ and never touches this file by hand. Without that, the
// browser's service-worker update check is a byte-for-byte comparison of
// this exact file: an unchanged sw.js means the browser correctly concludes
// there's nothing new to install, so `install`/`activate` never re-run, the
// precached shell/icons below never refresh, and the "Update Now" banner
// never has anything to announce — which is the main reason an installed
// Home Screen/PWA copy could keep running old cached shell content across
// deploys that never happened to edit this file. In local `vite dev` this
// token is left unsubstituted (dev doesn't run the build plugin), which is
// harmless — it's just used as a literal cache-name string.
const CACHE_VERSION = '__SW_BUILD_ID__';
const SHELL_CACHE = `smritisetu-shell-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png'
];

const STATIC_ASSET_PATTERN = /\/icons\/|\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
    // Intentionally no self.skipWaiting() here — the new worker installs and
    // then waits until the user (or an unforced natural activation, once no
    // tab holds the old worker) lets it take over.
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// The page sends this once the user clicks "Update Now" — only then does the
// waiting worker activate. See src/hooks/usePwaUpdate.js.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Deliberately re-fetch by URL instead of forwarding `request` as-is:
    // `fetch(request)` would still be free to satisfy itself from the
    // browser's own HTTP cache (which on an installed PWA — especially
    // iOS's persistent WebKit disk cache — can hold a stale index.html
    // across app relaunches), silently defeating "network-first". Passing
    // `cache: 'no-store'` forces an always-fresh fetch. It can't be added to
    // `request` directly: per the Fetch spec, building a new Request from an
    // existing 'navigate'-mode one via an init dict downgrades its mode to
    // 'same-origin', which can break normal document-navigation semantics —
    // fetching a plain URL side-steps that entirely, and event.respondWith()
    // doesn't care how the Response it receives was produced.
    event.respondWith(
      fetch(request.url, { cache: 'no-store', credentials: 'same-origin' })
        .then((response) => {
          // Keep the offline-fallback shell in sync with the freshest HTML
          // actually seen, so a later offline visit serves what this user
          // last really loaded rather than whatever install() saw once.
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/', clone));
          }
          return response;
        })
        .catch(() => caches.match('/').then((cached) => cached || caches.match(request)))
    );
    return;
  }

  if (STATIC_ASSET_PATTERN.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
  // All other same-origin requests (hashed JS/CSS bundles, etc.) are left
  // untouched so the browser's normal HTTP cache/network rules apply.
});

// ─── Reminder push notifications ──────────────────────────────────────
// This is what lets a reminder still reach the user when the PWA is
// backgrounded or fully closed on Android — the in-app popup
// (src/hooks/useReminderAlerts.js) only runs while a tab/window is open, so
// a server-side scheduler (see supabase/functions/send-reminder-push) sends
// a Web Push message at the reminder's scheduled time, and this event is
// what turns that into a visible Android notification. Deliberately kept in
// this same file rather than a second service worker — there is exactly
// one service worker for this app.
self.addEventListener('push', (event) => {
  let payload = { title: 'SmritiSetu Reminder', body: 'You have a reminder.' };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    // Malformed/empty push payload — fall back to the generic text above
    // rather than showing nothing at all.
  }

  const { title, body, icon, badge, tag, data } = payload;
  event.waitUntil(
    self.registration.showNotification(title || 'SmritiSetu Reminder', {
      body: body || '',
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/icon-192.png',
      tag: tag || 'smritisetu-reminder',
      // A reminder is not a passing FYI — require an explicit dismissal on
      // platforms that support it (Android/Chrome) instead of it silently
      // disappearing off the notification shade before it's been seen.
      requireInteraction: true,
      data: data || {}
    })
  );
});

// Tapping the notification: focus an already-open SmritiSetu window if one
// exists, otherwise open a new one. The in-app reminder flow (already-due
// reminder, still not completed) picks itself back up from there via the
// existing polling in useReminderAlerts.js — no special "resume" state is
// needed since the reminder's own is_active/is_completed row is still the
// single source of truth.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// Rare, but browsers can rotate a push subscription's endpoint on their own
// (e.g. an expiring underlying token). The service worker can resubscribe
// without needing the user's auth session, but persisting the replacement
// to Supabase needs an authenticated client, which only an open page has —
// so this hands the new subscription to any open page(s) via postMessage;
// see the pushsubscriptionchange listener wired up in App.jsx.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const oldEndpoint = event.oldSubscription?.endpoint;
      const applicationServerKey = event.oldSubscription?.options?.applicationServerKey;
      if (!applicationServerKey) return;
      try {
        const newSubscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientsList.forEach((client) => {
          client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED', oldEndpoint, subscription: newSubscription.toJSON() });
        });
      } catch {
        // Nothing more this worker can do without a live page — the next
        // time the user opens the app and re-enables notifications (or the
        // app performs its own periodic re-check), a fresh subscription
        // will be created and persisted normally.
      }
    })()
  );
});
