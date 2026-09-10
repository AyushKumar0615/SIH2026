import { OfflineStore } from './offlineStore';

// Drives the durable offline write queue introduced alongside the Tier 1
// operations: creating a reminder, creating a memory, and completing a
// reminder (see reminderService.js / memoryService.js for where entries
// actually get queued — this module only owns replaying them once
// connectivity returns).
//
// Deliberately generic/orchestration-only: this file has no idea what a
// reminder or memory *is* beyond a `type` string — reminderService.js and
// memoryService.js each register their own sync handler for the entry
// type(s) they own via registerSyncHandler() below (at the bottom of those
// files), rather than this module importing them directly. That's not just
// tidiness: reminderService.js needs WriteQueueService.enqueue(), so a
// direct import here of ReminderService would be circular. Registration
// keeps the dependency one-directional (services depend on the queue, the
// queue never depends on any specific service) and keeps this file
// mechanically reusable if a later tier adds more operation types.
const POLL_INTERVAL_MS = 20000;

let isProcessing = false;
let initialized = false;

// idle -> pending (something queued) -> syncing (actively retrying) ->
// synced (queue just emptied) -> idle again after a short delay, so the UI
// indicator has something to show and then gets out of the way. `error` is
// a separate terminal-ish state: at least one entry has been definitively
// rejected (e.g. RLS/validation) and is no longer being retried — it stays
// visible instead of fading back to idle, since it needs the user's
// attention rather than being silently swallowed.
let status = 'idle';
let pendingCount = 0;
let errorCount = 0;
const subscribers = new Set();

function setStatus(next, count, failedCount) {
  status = next;
  if (count !== undefined) pendingCount = count;
  if (failedCount !== undefined) errorCount = failedCount;
  subscribers.forEach((fn) => fn({ status, pendingCount, failedCount: errorCount }));
}

const SYNC_HANDLERS = new Map();

// Called by each service, once, at module load — see the bottom of
// reminderService.js / memoryService.js.
export function registerSyncHandler(type, handler) {
  SYNC_HANDLERS.set(type, handler);
}

// Every handler returns { ok: true } on success (including "already applied
// last time" — see each service's _sync* method) or { ok: false, retry }
// where `retry` is false for a definitive rejection (e.g. RLS denial) that
// re-attempting won't fix, true for a transient/network failure.
async function processQueue() {
  if (isProcessing) return; // one run at a time — a second trigger while
  // already syncing (e.g. the poll interval firing during a slow retry)
  // just no-ops instead of racing the same entries.
  isProcessing = true;
  try {
    let entries = await OfflineStore.getQueuedWrites();
    if (entries.length === 0) {
      if (status !== 'idle') setStatus('idle', 0, 0);
      return;
    }

    // 'failed' entries already received a definitive, non-network
    // rejection (see the `!result.retry` branch below) — retrying them on
    // every poll tick would just repeat the same rejection forever, which
    // is exactly what "stop retrying permanent errors" rules out. They stay
    // queued (so the user's write/edit/delete isn't silently discarded) but
    // are skipped here rather than replayed.
    const retryable = entries.filter((e) => e.status !== 'failed');
    const failedCountBefore = entries.length - retryable.length;

    if (retryable.length === 0) {
      setStatus('error', 0, failedCountBefore);
      return;
    }

    setStatus('syncing', retryable.length, failedCountBefore);

    for (const entry of retryable) {
      const handler = SYNC_HANDLERS.get(entry.type);
      if (!handler) {
        // Unknown entry type (e.g. left over from a future version) —
        // nothing safe to do with it here; leave it queued rather than
        // silently discarding a write the user made.
        continue;
      }

      let result;
      try {
        result = await handler(entry);
      } catch (err) {
        result = { ok: false, retry: true, message: err?.message };
      }

      if (result.ok) {
        await OfflineStore.removeQueuedWrite(entry.queueId);
        continue;
      }

      if (!result.retry) {
        // A definitive, non-network rejection (e.g. an RLS/permission
        // denial) — no number of retries fixes this, so stop trying
        // automatically, but keep the entry rather than silently dropping
        // a write the user made; a future tier can surface "failed"
        // entries for manual attention. Deliberately NOT time/attempt-
        // capped for network errors: "offline" can validly last hours, and
        // giving up on a perfectly good queued write just because
        // connectivity took a while to return would be wrong — the poll
        // interval (not a tight loop) already keeps repeated attempts cheap.
        await OfflineStore.updateQueuedWrite(entry.queueId, {
          status: 'failed',
          attempts: entry.attempts + 1,
          lastError: result.message || 'sync_failed'
        });
        continue;
      }

      await OfflineStore.updateQueuedWrite(entry.queueId, {
        status: 'pending',
        attempts: entry.attempts + 1,
        lastError: result.message || 'network_error'
      });
      // A transient failure on one entry (e.g. connectivity dropped again
      // mid-run) means later entries will fail the same way right now —
      // stop this pass here rather than burning through the whole queue
      // against a connection that just went away again.
      break;
    }

    entries = await OfflineStore.getQueuedWrites();
    const stillRetryable = entries.filter((e) => e.status !== 'failed');
    const failedCount = entries.length - stillRetryable.length;
    if (entries.length === 0) {
      setStatus('synced', 0, 0);
      setTimeout(() => setStatus('idle', 0, 0), 3000);
    } else if (stillRetryable.length > 0) {
      setStatus('pending', stillRetryable.length, failedCount);
    } else {
      // Everything left is 'failed' — nothing left to retry automatically,
      // but don't fade back to idle: that would silently hide a rejected
      // write from the user instead of surfacing it.
      setStatus('error', 0, failedCount);
    }
  } finally {
    isProcessing = false;
  }
}

// Called once (from App.jsx) to wire up when the queue gets a chance to
// drain: right away (in case entries were queued in a previous session and
// we're already back online by the time the app reopens), on the browser's
// online event, whenever the tab becomes visible again, and a periodic
// backstop for cases neither of those catches (e.g. the network interface
// never dropped but Supabase itself was briefly unreachable).
export function initWriteQueue() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  processQueue();
  window.addEventListener('online', processQueue);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') processQueue();
  });
  setInterval(processQueue, POLL_INTERVAL_MS);
}

export const WriteQueueService = {
  async enqueue(entry) {
    const queueId = await OfflineStore.enqueueWrite({
      ...entry,
      createdAt: new Date().toISOString(),
      status: 'pending',
      attempts: 0,
      lastError: null
    });
    if (queueId != null) {
      const entries = await OfflineStore.getQueuedWrites();
      const retryable = entries.filter((e) => e.status !== 'failed');
      setStatus('pending', retryable.length, entries.length - retryable.length);
    }
    return queueId;
  },

  // Lets the "online" path trigger an immediate drain attempt too (e.g.
  // right after the user's connection visibly comes back inside the app,
  // rather than waiting for the next poll).
  processNow: processQueue,

  // Read-only helper for a service to check whether it's already queued an
  // equivalent operation (e.g. to avoid queuing the same delete twice) —
  // deliberately generic, same as SYNC_HANDLERS dispatch: this file has no
  // idea what `matches` is checking.
  async hasQueued(type, matches) {
    const entries = await OfflineStore.getQueuedWrites();
    return entries.some((e) => e.type === type && matches(e));
  },

  subscribe(fn) {
    subscribers.add(fn);
    fn({ status, pendingCount, failedCount: errorCount });
    return () => subscribers.delete(fn);
  }
};
