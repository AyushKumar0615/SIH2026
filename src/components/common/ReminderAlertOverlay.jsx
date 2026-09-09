import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, VolumeX, AlarmClockCheck } from 'lucide-react';
import { formatTime12h } from '../../services/reminderService';
import { ReminderSoundService } from '../../services/reminderSoundService';
import { SNOOZE_OPTIONS_MINUTES, REMINDER_RING_INTERVAL_MS } from '../../services/reminderAlertEngine';
import { useTranslation } from '../../hooks/useTranslation';

// Full-screen "this is due right now" alert for both Elder and Caregiver —
// rendered via a portal straight into document.body (same reasoning as
// games/shared/Countdown.jsx: an animated ancestor's transform/filter would
// otherwise break position:fixed centering) so it always sits above every
// other surface in the app regardless of where the reminder became due.
//
// Deliberately has no backdrop-click-to-close and no Escape handler: the
// brief calls for the alert to "continue alerting until acknowledged," so
// the only ways out are the two explicit actions below. Tab/Shift+Tab still
// cycles normally between them for keyboard users.
export default function ReminderAlertOverlay({ alert, onComplete, onSnooze }) {
  const { t } = useTranslation();
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const cardRef = useRef(null);
  const doneButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!alert) {
      ReminderSoundService.stopRinging();
      return undefined;
    }
    ReminderSoundService.startRinging(REMINDER_RING_INTERVAL_MS, (played) => setSoundBlocked(!played));
    return () => ReminderSoundService.stopRinging();
  }, [alert?.id]);

  useEffect(() => {
    if (!alert) return undefined;
    setSnoozeOpen(false);
    previousFocusRef.current = document.activeElement;
    const raf = requestAnimationFrame(() => doneButtonRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key !== 'Tab' || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll('button');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) previousFocusRef.current.focus();
    };
  }, [alert?.id]);

  const icon = alert?.icon || '🔔';

  return createPortal(
    <AnimatePresence>
      {alert && (
        <motion.div
          className="reminder-alert-backdrop"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reminder-alert-title"
          aria-describedby="reminder-alert-time"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={cardRef}
            className="reminder-alert-card"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="reminder-alert-icon-ring" aria-hidden="true">{icon}</span>

            <p className="reminder-alert-eyebrow">{t('reminderAlertEyebrow')}</p>
            <h2 id="reminder-alert-title" className="reminder-alert-title">{alert.title}</h2>
            {alert.notes && <p className="reminder-alert-notes">{alert.notes}</p>}

            <p id="reminder-alert-time" className="reminder-alert-time">
              <Clock3 className="w-5 h-5 shrink-0" aria-hidden="true" /> {formatTime12h(alert.time)}
            </p>

            {alert.ownerName && (
              <p className="reminder-alert-owner">{t('reminderAlertForLabel').replace('{name}', alert.ownerName)}</p>
            )}

            <div className="reminder-alert-actions">
              <button
                ref={doneButtonRef}
                type="button"
                className="reminder-alert-btn reminder-alert-btn-done"
                onClick={onComplete}
              >
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" /> {t('reminderAlertDoneButton')}
              </button>

              {!snoozeOpen ? (
                <button
                  type="button"
                  className="reminder-alert-btn reminder-alert-btn-snooze"
                  onClick={() => setSnoozeOpen(true)}
                >
                  <AlarmClockCheck className="w-5 h-5" aria-hidden="true" /> {t('reminderAlertSnoozeButton')}
                </button>
              ) : (
                <div className="reminder-alert-snooze-options" role="group" aria-label={t('reminderAlertSnoozeButton')}>
                  {SNOOZE_OPTIONS_MINUTES.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      className="reminder-alert-snooze-chip"
                      onClick={() => onSnooze(minutes)}
                    >
                      {t('reminderAlertSnoozeMinutes').replace('{minutes}', minutes)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {soundBlocked && (
              <button
                type="button"
                className="reminder-alert-sound-hint"
                onClick={() => {
                  ReminderSoundService.unlockAndPlay();
                  setSoundBlocked(false);
                }}
              >
                <VolumeX className="w-4 h-4" aria-hidden="true" /> {t('reminderAlertEnableSound')}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
