// Pure due-reminder logic — no React, no Supabase calls — so the polling
// hook (useReminderAlerts) stays a thin orchestrator and this stays easy to
// reason about/adjust in isolation.
//
// Reminders store only a wall-clock "HH:MM" (see reminderService.js) and no
// date or timezone of their own — there's no existing timezone system to
// respect here, so "the scheduled time" is simply that HH:MM today in
// whatever local timezone the viewer's own device is in, exactly as the rest
// of the app already treats it (formatTime12h, the <input type="time">
// editor, etc.). That is also already correct for IST users without any
// special-casing, since it's just the browser's own local clock.

// Broadcast whenever the alert marks a reminder complete, so any other
// already-mounted view showing that same reminder (e.g. a caregiver's
// Routines tab open behind the popup) re-runs its own existing fetch
// instead of sitting stale until it happens to remount. There's no
// realtime subscription on the reminders table to do this via Supabase
// (see useReminderAlerts.js), so this in-page event is the lightweight,
// no-new-infrastructure equivalent — every listener just calls a fetch
// function that already existed before this feature.
export const REMINDER_COMPLETED_EVENT = 'smritisetu:reminder-completed';

export function broadcastReminderCompleted(reminderId, ownerId) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(REMINDER_COMPLETED_EVENT, { detail: { reminderId, ownerId } }));
}

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// How long after its scheduled time a reminder is still worth surfacing as
// "missed" if the user was away. Past this, alerting would feel like a
// stale alarm going off for something no longer timely, so it's skipped
// instead of firing indefinitely (explicitly required by the brief).
export const MISSED_REMINDER_GRACE_MS = 2 * 60 * 60 * 1000; // 2 hours

// How often the popup re-plays its chime while unacknowledged.
export const REMINDER_RING_INTERVAL_MS = 4000;

export const SNOOZE_OPTIONS_MINUTES = [5, 10, 15];

export function occursToday(reminder, now = new Date()) {
  if (reminder.repeatFrequency !== 'Weekly') return true;
  return (reminder.daysOfWeek || []).includes(DAY_ABBR[now.getDay()]);
}

// The Date this reminder's time-of-day resolves to today, in local time.
export function getTodayOccurrence(reminder, now = new Date()) {
  const [hours, minutes] = (reminder.time || '00:00').split(':').map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
}

// A reminder marked complete stays complete until the elder/caregiver
// manually unchecks it (see RemindersView/RoutineManager's toggleComplete) —
// there is no per-day completion record in the schema, so a Daily/Weekly
// reminder that's been acknowledged today simply won't alert again until
// it's explicitly reopened. That is existing app behavior (the checklist UI
// already works this way); this just means an alerted-and-completed
// reminder fires exactly once per manual reset, not once every day
// automatically. Preserved as-is rather than inventing a new schema field.
export function isReminderDue(reminder, now = new Date()) {
  if (!reminder.isActive || reminder.isCompleted) return false;
  if (!occursToday(reminder, now)) return false;
  const scheduled = getTodayOccurrence(reminder, now);
  const elapsedMs = now.getTime() - scheduled.getTime();
  return elapsedMs >= 0 && elapsedMs <= MISSED_REMINDER_GRACE_MS;
}

export function getDueReminders(reminders, now = new Date()) {
  return (reminders || []).filter((reminder) => isReminderDue(reminder, now));
}

// ─── Snooze (client-side only, see useReminderAlerts) ────────────────────
// Deliberately NOT persisted to Supabase: a straightforward, no-schema-
// change snooze needs nothing more than "don't re-alert this one for N
// minutes," which sessionStorage covers per browser tab. It does not sync
// across devices/tabs and clears when the tab is closed — an acceptable,
// disclosed limitation for something this lightweight.
const SNOOZE_KEY_PREFIX = 'smritisetu-reminder-snooze::';

export function setSnoozedUntil(reminderId, untilTimestampMs) {
  try {
    sessionStorage.setItem(SNOOZE_KEY_PREFIX + reminderId, String(untilTimestampMs));
  } catch {
    // Storage unavailable (private mode) — the reminder will simply be
    // offered again on the next poll instead of honoring the snooze.
  }
}

export function isSnoozed(reminderId, nowMs = Date.now()) {
  try {
    const raw = sessionStorage.getItem(SNOOZE_KEY_PREFIX + reminderId);
    return raw != null && Number(raw) > nowMs;
  } catch {
    return false;
  }
}
