import { useCallback, useEffect, useRef, useState } from 'react';
import { ReminderService } from '../services/reminderService';
import { CaregiverConnectionService } from '../services/caregiverConnectionService';
import { NotificationPermissionService } from '../services/notificationPermissionService';
import { getDueReminders, isSnoozed, setSnoozedUntil, broadcastReminderCompleted } from '../services/reminderAlertEngine';

const POLL_INTERVAL_MS = 20000;
const LOCAL_TICK_MS = 5000;

// Mounted once per session in App.jsx (elderly/caregiver only), exactly
// like useElderLocationTracking — so it survives in-app navigation and only
// tears down on logout, instead of resetting every time the user switches
// pages.
//
// The `reminders` table isn't in the Supabase realtime publication (only
// elder_locations is — see supabase/schema.sql), so this polls instead of
// subscribing. That's not a workaround: even with realtime wired up, this
// job still fundamentally has to notice "the clock reached a stored time",
// which a DB row-change event can't tell it — a periodic check is required
// regardless. Polling Supabase on top of that (rather than only checking
// the clock against a stale cache) is what makes edits/deletes/completions
// made elsewhere reflected within one poll interval.
//
// role -> what's monitored:
//   elderly   -> the elder's own reminders
//   caregiver -> every accepted connected elder's reminders (read access is
//                already granted by the "caregiver select connected elder
//                reminders" RLS policy — this reuses that, not a new grant)
//   admin     -> nothing (admins don't own or monitor reminders)
export function useReminderAlerts(session) {
  const role = session?.role;
  const isElder = role === 'elderly';
  const isCaregiver = role === 'caregiver';
  const enabled = isElder || isCaregiver;

  const [queue, setQueue] = useState([]);
  const remindersCacheRef = useRef(new Map()); // subject userId -> reminders[]
  const subjectsRef = useRef([]); // [{ userId, ownerName }]
  const isFetchingRef = useRef(false);
  const sessionIdRef = useRef(session?.id);
  sessionIdRef.current = session?.id;

  const recomputeQueue = useCallback(() => {
    const now = new Date();
    const nextDue = [];
    const seen = new Set();
    subjectsRef.current.forEach((subject) => {
      const reminders = remindersCacheRef.current.get(subject.userId) || [];
      getDueReminders(reminders, now).forEach((reminder) => {
        if (seen.has(reminder.id) || isSnoozed(reminder.id, now.getTime())) return;
        seen.add(reminder.id);
        nextDue.push({ ...reminder, ownerId: subject.userId, ownerName: subject.ownerName });
      });
    });

    setQueue((prevQueue) => {
      // Keep whatever's already queued/showing in its existing order (so the
      // visible alert never swaps out from under the user), then append any
      // newly-due reminders after it.
      const stillDue = prevQueue.filter((item) => seen.has(item.id));
      const stillDueIds = new Set(stillDue.map((item) => item.id));
      const additions = nextDue.filter((item) => !stillDueIds.has(item.id));
      if (stillDue.length === prevQueue.length && additions.length === 0) return prevQueue;
      return [...stillDue, ...additions];
    });
  }, []);

  const fetchAll = useCallback(async () => {
    if (!enabled || !sessionIdRef.current || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      if (isElder) {
        subjectsRef.current = [{ userId: sessionIdRef.current, ownerName: null }];
      } else {
        const result = await CaregiverConnectionService.listEldersForCaregiver(sessionIdRef.current);
        subjectsRef.current = result.ok
          ? result.connections
              .filter((connection) => connection.status === 'accepted' && connection.elder)
              .map((connection) => ({ userId: connection.elder.id, ownerName: connection.elder.fullName }))
          : [];
      }

      await Promise.all(
        subjectsRef.current.map(async (subject) => {
          const result = await ReminderService.listReminders(subject.userId);
          if (result.ok) remindersCacheRef.current.set(subject.userId, result.reminders);
        })
      );

      const validSubjectIds = new Set(subjectsRef.current.map((subject) => subject.userId));
      for (const cachedId of remindersCacheRef.current.keys()) {
        if (!validSubjectIds.has(cachedId)) remindersCacheRef.current.delete(cachedId);
      }

      recomputeQueue();
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled, isElder, recomputeQueue]);

  // Network refresh: on mount, every POLL_INTERVAL_MS, and immediately when
  // the tab/app becomes visible or focused again (covers "away, then came
  // back" without waiting out the rest of the interval).
  useEffect(() => {
    if (!enabled) {
      setQueue([]);
      return undefined;
    }
    fetchAll();
    const pollId = window.setInterval(fetchAll, POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchAll();
    };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', fetchAll);
    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', fetchAll);
    };
  }, [enabled, fetchAll]);

  // Clock check: re-evaluates the already-cached reminders against "now"
  // more often than the network poll, purely locally, so a reminder becomes
  // due within a few seconds of its scheduled minute rather than waiting on
  // the next Supabase round trip.
  useEffect(() => {
    if (!enabled) return undefined;
    const tickId = window.setInterval(recomputeQueue, LOCAL_TICK_MS);
    return () => window.clearInterval(tickId);
  }, [enabled, recomputeQueue]);

  const activeAlert = queue[0] || null;

  // Fires an OS-level notification the moment something becomes due while
  // this tab isn't the focused one (see notificationPermissionService for
  // why that's the only background case this can reach). Tracked by id so
  // it fires once per occurrence, not once per re-render.
  const notifiedIdsRef = useRef(new Set());
  useEffect(() => {
    if (!activeAlert || notifiedIdsRef.current.has(activeAlert.id)) return;
    notifiedIdsRef.current.add(activeAlert.id);
    NotificationPermissionService.notifyIfBackground(activeAlert.title, {
      body: activeAlert.ownerName ? `${activeAlert.ownerName} — ${activeAlert.notes || ''}`.trim() : activeAlert.notes || '',
      tag: `smritisetu-reminder-${activeAlert.id}`
    });
  }, [activeAlert]);

  const completeActive = useCallback(async () => {
    const reminder = activeAlert;
    if (!reminder) return;
    setQueue((prev) => prev.filter((item) => item.id !== reminder.id));
    const cached = remindersCacheRef.current.get(reminder.ownerId) || [];
    remindersCacheRef.current.set(
      reminder.ownerId,
      cached.map((item) => (item.id === reminder.id ? { ...item, isCompleted: true } : item))
    );
    await ReminderService.updateReminder(reminder.id, { isCompleted: true });
    broadcastReminderCompleted(reminder.id, reminder.ownerId);
  }, [activeAlert]);

  const snoozeActive = useCallback(
    (minutes) => {
      const reminder = activeAlert;
      if (!reminder) return;
      setSnoozedUntil(reminder.id, Date.now() + minutes * 60000);
      setQueue((prev) => prev.filter((item) => item.id !== reminder.id));
    },
    [activeAlert]
  );

  return { activeAlert, completeActive, snoozeActive };
}
