// Read-only offline cache for GET-style app data (reminders, memories,
// connections, last-known location) — a thin IndexedDB key/value wrapper,
// no framework/library. This is intentionally NOT used for anything the
// app writes back to Supabase (see reminderService.js etc. — write methods
// are untouched); it exists purely so a page can show the last
// successfully-fetched data when a live fetch fails, instead of an empty
// error state.
//
// Fails silently (resolves to null / no-op) if IndexedDB is unavailable —
// e.g. some private-browsing modes disable it entirely — so callers can
// treat "no cache" and "cache unavailable" the same way: fall through to
// whatever the caller already does when there's nothing to show.
const DB_NAME = 'smritisetu-offline-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  dbPromise = new Promise((resolve) => {
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  return dbPromise;
}

export const OfflineStore = {
  // Returns { data, cachedAt } for `key`, or null if there's nothing
  // cached (or IndexedDB isn't available at all).
  async get(key) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  },

  // Overwrites whatever was cached for `key` with the latest successful
  // fetch result. Best-effort — a failure here never surfaces to the
  // caller, since caching is a bonus on top of the real network response,
  // not something the online path should ever depend on.
  async set(key, data) {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({ key, data, cachedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
};
