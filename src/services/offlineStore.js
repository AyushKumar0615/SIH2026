// Offline-support infrastructure shared by two independent, deliberately
// separate concerns living in the same IndexedDB database:
//
//  - `cache` (STORE_NAME, v1): read-only GET-style cache for app data
//    (reminders, memories, connections, last-known location). Unrelated to
//    anything the app writes back to Supabase — see each service's read
//    method for how it's populated/consulted. Untouched by this v2 change.
//  - `writeQueue` (QUEUE_STORE_NAME, added in v2): durable queue of writes
//    that couldn't reach Supabase (e.g. offline), to be retried once
//    connectivity returns. See writeQueueService.js for the actual sync
//    logic — this module only stores/retrieves queue entries.
//
// Both fail silently (resolve to null/no-op) if IndexedDB is unavailable —
// e.g. some private-browsing modes disable it entirely — so callers can
// treat "no cache"/"nothing queued" and "unavailable" the same way.
const DB_NAME = 'smritisetu-offline-cache';
const DB_VERSION = 2;
const STORE_NAME = 'cache';
const QUEUE_STORE_NAME = 'writeQueue';

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
      // Upgrading an existing v1 database (just the read cache) preserves
      // its data automatically — this only adds the new store alongside it.
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
        db.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'queueId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  return dbPromise;
}

// A genuine PostgREST/Postgres response always carries a non-empty error
// `code` (e.g. '23505' unique_violation, '42501' insufficient_privilege,
// 'PGRST116' no rows). A request that never reached the server at all
// (offline, DNS failure, connection refused) is caught inside postgrest-js's
// own fetch wrapper and reported with an empty code — that's what
// distinguishes "couldn't reach Supabase" from "Supabase responded and
// rejected this," which matters a lot here: only the former should ever be
// queued for retry, never a real validation/permission rejection.
export function isNetworkError(error) {
  if (!error) return false;
  if (error.code) return false;
  return true;
}

// Wraps a Supabase call with a timeout so a degraded connection (captive
// portal, DNS blackhole — cases where the browser doesn't fail fast the way
// it does for a genuinely disconnected interface) doesn't leave the UI
// waiting indefinitely before falling back to the offline queue. Safe to
// race like this because every operation using it is idempotent (see
// writeQueueService.js) — if the original request turns out to still
// succeed after this "gives up," the eventual queued retry just becomes a
// harmless no-op instead of a duplicate.
export function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve({ data: null, error: { message: 'client_timeout', code: '' } }), ms);
    })
  ]);
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
  },

  // ─── Write queue (see writeQueueService.js for the sync logic) ────────
  // `entry` shape: { type, createdAt, status, attempts, lastError, ...op-specific fields }.
  // Returns the assigned queueId, or null if IndexedDB is unavailable —
  // callers must treat that as "could not queue" and surface the original
  // error rather than silently pretending the write was saved.
  async enqueueWrite(entry) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(QUEUE_STORE_NAME, 'readwrite');
        const request = tx.objectStore(QUEUE_STORE_NAME).add(entry);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  },

  // Every queued entry, oldest first (autoIncrement keys sort naturally in
  // insertion order) — the order operations were made in is the order
  // they're replayed in.
  async getQueuedWrites() {
    const db = await openDB();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(QUEUE_STORE_NAME, 'readonly');
        const request = tx.objectStore(QUEUE_STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  },

  // Merges `patch` into the stored entry (used to bump attempts/lastError
  // after a failed retry, without disturbing the rest of the entry).
  async updateQueuedWrite(queueId, patch) {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(QUEUE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE_NAME);
        const getRequest = store.get(queueId);
        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (existing) store.put({ ...existing, ...patch });
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  },

  // Removes an entry once it's been confirmed synced (or confirmed moot,
  // e.g. its target row no longer exists).
  async removeQueuedWrite(queueId) {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(QUEUE_STORE_NAME, 'readwrite');
        tx.objectStore(QUEUE_STORE_NAME).delete(queueId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
};
