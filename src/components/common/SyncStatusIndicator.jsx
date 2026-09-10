import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { WriteQueueService } from '../../services/writeQueueService';
import { LocalizationService } from '../../services/localizationService';

// Mounted as a standalone sibling of <App/>, same as InstallPrompt/UpdateBanner
// — see InstallPrompt.jsx for why lookups pin to 'en' directly at this level.
const t = (key) => LocalizationService.getText(key, 'en');

const COPY = {
  pending: { key: 'syncStatusOffline', Icon: CloudOff },
  syncing: { key: 'syncStatusSyncing', Icon: RefreshCw },
  synced: { key: 'syncStatusSynced', Icon: CheckCircle2 },
  // At least one queued write was definitively rejected (e.g. an RLS
  // denial) and has stopped being retried — see writeQueueService.js. Kept
  // visible (no auto-hide, unlike 'synced') since it needs attention rather
  // than being retried away on its own.
  error: { key: 'syncStatusError', Icon: AlertTriangle }
};

// Tiny, quiet status pill for the offline write queue (Tier 1: creating a
// reminder/memory, completing a reminder; Tier 2: editing/deleting a
// reminder, disconnecting a caregiver connection) — deliberately not tied
// to any one page, since the queue itself isn't either. Renders nothing in
// the common case (queue empty, nothing in flight, nothing failed).
export default function SyncStatusIndicator() {
  const [state, setState] = useState({ status: 'idle', pendingCount: 0, failedCount: 0 });

  useEffect(() => WriteQueueService.subscribe(setState), []);

  const visible = state.status === 'pending' || state.status === 'syncing' || state.status === 'synced' || state.status === 'error';
  const copy = COPY[state.status];

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && copy && (
          <motion.div
            className={`sync-status-pill ${state.status === 'error' ? 'is-error' : ''}`}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            <copy.Icon
              className="w-4 h-4 shrink-0"
              style={{ animation: state.status === 'syncing' ? 'pwa-update-spin 1s linear infinite' : 'none' }}
              aria-hidden="true"
            />
            <span>{t(copy.key)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
