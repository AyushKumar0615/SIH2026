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
const CACHE_VERSION = 'v2';
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
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((cached) => cached || caches.match(request)))
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
