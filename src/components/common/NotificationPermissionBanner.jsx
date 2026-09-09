import React, { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { NotificationPermissionService } from '../../services/notificationPermissionService';
import { PushSubscriptionService } from '../../services/pushSubscriptionService';
import { useTranslation } from '../../hooks/useTranslation';

const DISMISSED_UNTIL_KEY = 'smritisetu-notification-prompt-dismissed-until';
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function readDismissedUntil() {
  try {
    return Number(localStorage.getItem(DISMISSED_UNTIL_KEY)) || 0;
  } catch {
    return 0;
  }
}

function persistDismissal() {
  try {
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_COOLDOWN_MS));
  } catch {
    // Private browsing / storage disabled — banner just reappears next visit.
  }
}

// A small, dismissible, purely opt-in nudge shown only where reminders are
// actively being managed (RemindersView for elders, the caregiver's
// Routines tab) — never on page load — so the permission ask happens at the
// moment it's actually relevant, and never repeats once answered or
// dismissed. Only renders anything when there's a real decision left to
// make: unsupported browsers, already-granted, and already-denied
// permission all render nothing (a denied permission can only be changed in
// the browser's own site settings — re-prompting would just be spam).
export default function NotificationPermissionBanner({ session }) {
  const { t } = useTranslation();
  const [permission, setPermission] = useState(() => NotificationPermissionService.getPermission());
  const [dismissed, setDismissed] = useState(() => Date.now() < readDismissedUntil());

  useEffect(() => {
    setPermission(NotificationPermissionService.getPermission());
  }, []);

  if (!NotificationPermissionService.isSupported() || permission !== 'default' || dismissed) return null;

  const handleEnable = async () => {
    const result = await NotificationPermissionService.request();
    setPermission(result);
    if (result !== 'default') persistDismissal();
    // Push registration only makes sense once permission is actually
    // granted — a denied/dismissed result leaves nothing to subscribe.
    // Best-effort: if this fails (unsupported browser, no VAPID key
    // configured), the in-app popup still works exactly as before: this
    // only ever adds background delivery on top of it.
    if (result === 'granted' && session?.id) {
      PushSubscriptionService.subscribe(session.id);
    }
  };

  const handleDismiss = () => {
    persistDismissal();
    setDismissed(true);
  };

  return (
    <div className="notice-box is-ember flex items-start sm:items-center gap-3 mb-6">
      <BellRing className="w-4.5 h-4.5 shrink-0 mt-0.5 sm:mt-0 text-ember" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{t('notificationPermissionTitle')}</p>
        <p className="text-sm mt-0.5 text-ink-soft">{t('notificationPermissionDesc')}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={handleEnable} className="btn btn-ember !min-h-[40px] !py-2 !px-4 text-sm">
          {t('notificationPermissionEnable')}
        </button>
        <button type="button" onClick={handleDismiss} className="btn-icon" aria-label={t('notNowLabel')}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
