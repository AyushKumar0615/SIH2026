import React from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

// Small, unobtrusive inline notice — reuses the existing .notice-strip
// pattern already used throughout the app (e.g. the caregiver disclaimer)
// rather than introducing a new visual language. Rendered by a page only
// when its own fetch reported `fromCache: true` (see reminderService.js,
// memoryService.js, caregiverConnectionService.js, locationService.js) —
// i.e. a real network failure actually happened and this is the last
// successfully-cached data, not a guess based on navigator.onLine alone.
export default function OfflineDataNotice({ className = 'my-4' }) {
  const { t } = useTranslation();
  return (
    <div className={`notice-strip is-ember flex items-center gap-2.5 ${className}`} role="status">
      <WifiOff className="w-4 h-4 shrink-0 text-ember" aria-hidden="true" />
      <p className="text-sm text-ink-soft">{t('offlineShowingCachedData')}</p>
    </div>
  );
}
