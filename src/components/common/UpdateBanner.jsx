import React, { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { usePwaUpdate } from '../../hooks/usePwaUpdate';
import { LocalizationService } from '../../services/localizationService';

// Mounted as a standalone sibling of <App/> (outside LanguageProvider), same
// as InstallPrompt — see that file for why lookups pin to 'en'.
const t = (key) => LocalizationService.getText(key, 'en');

export default function UpdateBanner() {
  const { updateAvailable, activateUpdate } = usePwaUpdate();
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const visible = updateAvailable && !dismissed;

  const handleUpdate = () => {
    setUpdating(true);
    activateUpdate();
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="pwa-update-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <RefreshCw
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--ember)', animation: updating ? 'pwa-update-spin 1s linear infinite' : 'none' }}
              aria-hidden="true"
            />
            <p className="text-sm">{updating ? t('pwaUpdateInProgress') : t('pwaUpdateAvailable')}</p>
            <div className="pwa-update-actions">
              <button type="button" onClick={handleUpdate} disabled={updating} className="btn btn-ember">
                {t('pwaUpdateButton')}
              </button>
              {!updating && (
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="pwa-update-close"
                  aria-label={t('pwaUpdateCloseAria')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
