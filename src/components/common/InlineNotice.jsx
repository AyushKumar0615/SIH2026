import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const TONE_ICON = { success: CheckCircle2, error: AlertTriangle, info: Info };
const TONE_CLASS = { success: 'is-jade', error: 'is-alert', info: 'is-ember' };
const TONE_COLOR = { success: 'var(--jade)', error: 'var(--alert)', info: 'var(--ember)' };

// Lightweight self-dismissing feedback banner — reuses the app's
// existing notice-box styling instead of a new toast library.
export default function InlineNotice({ tone = 'info', message, onDismiss, autoDismissMs = 5000 }) {
  useEffect(() => {
    if (!message || !autoDismissMs) return;
    const id = window.setTimeout(() => onDismiss?.(), autoDismissMs);
    return () => window.clearTimeout(id);
  }, [message, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role={tone === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: '1.25rem' }}
          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className={`notice-box ${TONE_CLASS[tone] || TONE_CLASS.info} flex items-center gap-3`}>
            {React.createElement(TONE_ICON[tone] || Info, { className: 'w-4.5 h-4.5 shrink-0', style: { color: TONE_COLOR[tone] || TONE_COLOR.info } })}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
