import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

export default function ConfirmDialog({ isOpen, title, message, confirmLabel, isDanger = true, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="overlay-scrim"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={onCancel}
        >
          <div className="rail-pad flex items-start justify-center pt-[22vh] pb-10">
            <motion.div
              className="modal-panel p-7 sm:p-8"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl font-medium">{title}</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(23,20,15,0.65)' }}>{message}</p>
              <div className="flex justify-end gap-3 mt-7">
                <button type="button" onClick={onCancel} className="btn btn-line" style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-line)' }}>
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="btn"
                  style={isDanger
                    ? { background: 'var(--alert)', color: '#fff' }
                    : { background: 'var(--paper-ink)', color: 'var(--paper)' }}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
