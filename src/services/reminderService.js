import { supabase } from './supabaseClient';
import { OfflineStore, isNetworkError, withTimeout } from './offlineStore';
import { WriteQueueService, registerSyncHandler } from './writeQueueService';

export const REMINDER_CATEGORY_ICONS = { Medication: '💊', Meals: '🍛', Activity: '🔔', Family: '📞' };

export function formatTime12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes || '',
    time: row.time,
    category: row.category,
    icon: row.icon || '🔔',
    repeatFrequency: row.repeat_frequency,
    daysOfWeek: row.days_of_week || [],
    isActive: row.is_active,
    isCompleted: row.is_completed,
    createdAt: row.created_at
  };
}

// ─── Read-cache helpers (Tier 2) ───────────────────────────────────────
// The read-only cache populated by listReminders() is also what a page
// falls back to on reload while offline — so a Tier 2 mutation (edit/
// delete) that only updated in-memory React state would "come back" once
// the page reread the stale cache. These keep that cache honest for the
// one user it was written for; a no-op (silent return) whenever `userId`
// is unknown or nothing has ever been cached for them yet, since caching
// is a bonus, never something a mutation should depend on.
async function getCachedReminders(userId) {
  if (!userId) return null;
  return OfflineStore.get(`reminders:${userId}`);
}

async function setCachedReminder(userId, reminder) {
  if (!userId) return;
  const cached = await getCachedReminders(userId);
  if (!cached) return;
  await OfflineStore.set(`reminders:${userId}`, cached.data.map((r) => (r.id === reminder.id ? reminder : r)));
}

async function removeCachedReminder(userId, reminderId) {
  if (!userId) return;
  const cached = await getCachedReminders(userId);
  if (!cached) return;
  await OfflineStore.set(`reminders:${userId}`, cached.data.filter((r) => r.id !== reminderId));
}

// Returns the optimistic post-edit reminder (merging onto whatever's
// cached, so the view has something reasonable to render immediately) and
// writes it back to the cache in the same pass.
async function mergeCachedReminder(userId, reminderId, updates) {
  const cached = await getCachedReminders(userId);
  const existing = cached?.data.find((r) => r.id === reminderId);
  const merged = { ...(existing || { id: reminderId }), ...updates };
  if (cached) {
    await OfflineStore.set(`reminders:${userId}`, cached.data.map((r) => (r.id === reminderId ? merged : r)));
  }
  return merged;
}

export const ReminderService = {
  async listReminders(userId) {
    const cacheKey = `reminders:${userId}`;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('time', { ascending: true });

    if (error) {
      // Network/Supabase unreachable (e.g. offline) — fall back to the last
      // successful fetch instead of surfacing an empty error state. If
      // nothing has ever been cached for this user, behavior is unchanged
      // from before: the original error is returned as-is.
      const cached = await OfflineStore.get(cacheKey);
      if (cached) return { ok: true, reminders: cached.data, fromCache: true, cachedAt: cached.cachedAt };
      return { ok: false, error: error.message };
    }

    const reminders = (data || []).map(fromRow);
    OfflineStore.set(cacheKey, reminders);
    return { ok: true, reminders, fromCache: false };
  },

  // Generates the row's id client-side (instead of leaving it to the
  // column's default) specifically so this is safe to retry from the
  // offline queue: a retried insert carries the exact same id, so if the
  // original attempt actually made it through before the connection died
  // mid-response, the retry hits the primary-key uniqueness constraint
  // (Postgres error 23505) instead of creating a duplicate reminder — see
  // _syncCreateReminder below. No schema change needed for this: `id` was
  // already a plain `uuid primary key default gen_random_uuid()`, which
  // Postgres only applies when the column is omitted — a client-supplied
  // value here is accepted exactly like a server-generated one, and RLS
  // never constrained what value it could be, only that `user_id` matches
  // the caller.
  async addReminder(userId, payload) {
    const row = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: payload.title.trim(),
      notes: payload.notes?.trim() || null,
      time: payload.time,
      category: payload.category,
      icon: payload.icon || '🔔',
      repeat_frequency: payload.repeatFrequency,
      days_of_week: payload.repeatFrequency === 'Weekly' ? payload.daysOfWeek || [] : [],
      is_active: payload.isActive !== false
    };

    const { data, error } = await withTimeout(supabase.from('reminders').insert(row).select().single());
    if (error) {
      if (isNetworkError(error)) {
        await WriteQueueService.enqueue({ type: 'addReminder', row });
        // The optimistic object already carries the real final id (no
        // "swap fake id for real one" step needed once this syncs), so the
        // calling view's existing add-to-list logic needs no changes.
        return { ok: true, reminder: fromRow(row), queued: true };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, reminder: fromRow(data) };
  },

  // `userId` is optional and used only by the general-edit branch below, to
  // keep the read-cache in sync — the completion-only (Tier 1) branch above
  // it is untouched and ignores it.
  async updateReminder(reminderId, updates, userId) {
    const updateKeys = Object.keys(updates);
    const isCompletionOnly = updateKeys.length === 1 && updateKeys[0] === 'isCompleted';

    // Completion-only path: the one shape used by the reminder-alert popup
    // and the plain checkbox toggle — safe to queue offline (see
    // _syncCompleteReminder: re-applying the same boolean is a no-op
    // either way, so there's no arbitrary-field-edit conflict risk here).
    if (isCompletionOnly) {
      const { data, error } = await withTimeout(
        supabase.from('reminders').update({ is_completed: updates.isCompleted }).eq('id', reminderId).select().single()
      );
      if (error) {
        if (isNetworkError(error)) {
          await WriteQueueService.enqueue({ type: 'completeReminder', reminderId, isCompleted: updates.isCompleted });
          return { ok: true, reminder: null, queued: true };
        }
        return { ok: false, error: error.message };
      }
      return { ok: true, reminder: fromRow(data) };
    }

    // Everything else (title/time/notes/category/repeat/days/isActive
    // edits) — unchanged, never queued offline.
    const row = {};
    if (updates.title !== undefined) row.title = updates.title.trim();
    if (updates.notes !== undefined) row.notes = updates.notes?.trim() || null;
    if (updates.time !== undefined) row.time = updates.time;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.icon !== undefined) row.icon = updates.icon;
    if (updates.repeatFrequency !== undefined) {
      row.repeat_frequency = updates.repeatFrequency;
      row.days_of_week = updates.repeatFrequency === 'Weekly' ? updates.daysOfWeek || [] : [];
    } else if (updates.daysOfWeek !== undefined) {
      row.days_of_week = updates.daysOfWeek;
    }
    if (updates.isActive !== undefined) row.is_active = updates.isActive;
    if (updates.isCompleted !== undefined) row.is_completed = updates.isCompleted;

    // Same isNetworkError/withTimeout treatment as the Tier 1 paths above:
    // a genuine rejection (bad input, RLS) surfaces immediately and
    // unchanged; only a connectivity failure gets queued. Re-sending only
    // the fields actually present in `row` (never a full-row overwrite of
    // untouched columns) is what keeps a queued retry from being able to
    // clobber some *other* field that changed server-side in the meantime
    // — there's nothing here for it to clobber.
    const { data, error } = await withTimeout(
      supabase.from('reminders').update(row).eq('id', reminderId).select().single()
    );
    if (error) {
      if (isNetworkError(error)) {
        await WriteQueueService.enqueue({ type: 'updateReminder', reminderId, row });
        const optimistic = await mergeCachedReminder(userId, reminderId, updates);
        return { ok: true, reminder: optimistic, queued: true };
      }
      return { ok: false, error: error.message };
    }
    const reminder = fromRow(data);
    await setCachedReminder(userId, reminder);
    return { ok: true, reminder };
  },

  async deleteReminder(reminderId, userId) {
    const { error } = await withTimeout(supabase.from('reminders').delete().eq('id', reminderId));
    if (error) {
      if (isNetworkError(error)) {
        // A double-click/optimistic-retry racing the same delete twice
        // would otherwise queue it twice — check first, since the queue
        // itself doesn't dedupe (it's generic and has no idea what a
        // "duplicate" delete would even mean for another entry type).
        const alreadyQueued = await WriteQueueService.hasQueued('deleteReminder', (e) => e.reminderId === reminderId);
        if (!alreadyQueued) await WriteQueueService.enqueue({ type: 'deleteReminder', reminderId });
        await removeCachedReminder(userId, reminderId);
        return { ok: true, queued: true };
      }
      return { ok: false, error: error.message };
    }
    await removeCachedReminder(userId, reminderId);
    return { ok: true };
  },

  // ─── Offline-queue retry handlers — called only by writeQueueService.js ───
  async _syncCreateReminder(row) {
    const { error } = await supabase.from('reminders').insert(row);
    if (!error || error.code === '23505') return { ok: true }; // inserted, or already inserted by a previous attempt
    return { ok: false, retry: isNetworkError(error), message: error.message };
  },

  // Plain update (no .select().single()) so a target that's since been
  // deleted — 0 rows affected — is a silent success: there's nothing left
  // to mark complete, which is a resolved state, not a failure to retry
  // forever.
  async _syncCompleteReminder(reminderId, isCompleted) {
    const { error } = await supabase.from('reminders').update({ is_completed: isCompleted }).eq('id', reminderId);
    if (!error) return { ok: true };
    return { ok: false, retry: isNetworkError(error), message: error.message };
  },

  // Plain update, no .select().single() — same reasoning as
  // _syncCompleteReminder: if the target's since been deleted (0 rows
  // affected), there's nothing left to edit, which is a resolved state,
  // not a failure worth retrying forever.
  async _syncUpdateReminder(reminderId, row) {
    const { error } = await supabase.from('reminders').update(row).eq('id', reminderId);
    if (!error) return { ok: true };
    return { ok: false, retry: isNetworkError(error), message: error.message };
  },

  // Deleting an already-deleted (or never-synced) row affects 0 rows and is
  // not an error — exactly the "already deleted/not found = success"
  // idempotency this needs, with no special-casing required.
  async _syncDeleteReminder(reminderId) {
    const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
    if (!error) return { ok: true };
    return { ok: false, retry: isNetworkError(error), message: error.message };
  }
};

registerSyncHandler('addReminder', (entry) => ReminderService._syncCreateReminder(entry.row));
registerSyncHandler('completeReminder', (entry) => ReminderService._syncCompleteReminder(entry.reminderId, entry.isCompleted));
registerSyncHandler('updateReminder', (entry) => ReminderService._syncUpdateReminder(entry.reminderId, entry.row));
registerSyncHandler('deleteReminder', (entry) => ReminderService._syncDeleteReminder(entry.reminderId));
