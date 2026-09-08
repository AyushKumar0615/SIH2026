import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Feather, X, Share, SquarePlus } from 'lucide-react';
import { usePwaInstall, isStandaloneDisplay, getInstallPlatform } from '../../hooks/usePwaInstall';
import { LocalizationService } from '../../services/localizationService';
import {
  INSTALL_PROMPT_SHOW_DELAY_MS,
  INSTALL_PROMPT_DISMISS_COOLDOWN_MS,
  INSTALL_PROMPT_DISMISSED_UNTIL_KEY
} from '../../pwa/pwaConfig';

function readDismissedUntil() {
  try {
    return Number(localStorage.getItem(INSTALL_PROMPT_DISMISSED_UNTIL_KEY)) || 0;
  } catch {
    return 0;
  }
}

function persistDismissal() {
  try {
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_UNTIL_KEY, String(Date.now() + INSTALL_PROMPT_DISMISS_COOLDOWN_MS));
  } catch {
    // Private browsing / storage disabled — the popup will just show again
    // next visit within the session, which is an acceptable fallback.
  }
}

// Mounted as a standalone sibling of <App/> (outside LanguageProvider) so it
// stays fully independent of session/business logic; only the English
// dictionary carries these keys today, so lookups pin to 'en' directly.
const t = (key) => LocalizationService.getText(key, 'en');

export default function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  // 'native' (Android/Chromium beforeinstallprompt) | 'ios-safari' (full
  // Share -> Add to Home Screen steps) | 'ios-other' (iOS but not Safari —
  // point them at Safari, since that's the only iOS browser that can
  // produce a genuine standalone-mode install)
  const [mode, setMode] = useState('native');
  const cardRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isInstalled || isStandaloneDisplay()) return undefined;
    if (Date.now() < readDismissedUntil()) return undefined;

    if (isInstallable) {
      const timer = setTimeout(() => {
        setMode('native');
        setVisible(true);
      }, INSTALL_PROMPT_SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }

    const platform = getInstallPlatform();
    if (platform === 'ios-safari' || platform === 'ios-other') {
      const timer = setTimeout(() => {
        setMode(platform);
        setVisible(true);
      }, INSTALL_PROMPT_SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isInstallable, isInstalled]);

  useEffect(() => {
    if (!visible) return undefined;
    previousFocusRef.current = document.activeElement;
    const raf = requestAnimationFrame(() => cardRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    persistDismissal();
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'unavailable') return;
    setVisible(false);
    if (outcome === 'dismissed') persistDismissal();
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <React.Fragment>
            <motion.div
              className="pwa-install-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              ref={cardRef}
              className="pwa-install-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pwa-install-title"
              aria-describedby="pwa-install-body"
              tabIndex={-1}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="pwa-install-close"
                onClick={dismiss}
                aria-label={t('pwaInstallCloseAria')}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3.5 pr-6">
                <span className="mark-glyph shrink-0">
                  <Feather className="w-4 h-4" />
                </span>
                <div>
                  <h2 id="pwa-install-title" className="font-display text-lg font-semibold leading-tight">
                    {t('pwaInstallTitle')}
                  </h2>
                  <p id="pwa-install-body" className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                    {mode === 'ios-safari' && t('pwaInstallIosBody')}
                    {mode === 'ios-other' && t('pwaInstallOtherBrowserBody')}
                    {mode === 'native' && t('pwaInstallBody')}
                  </p>
                </div>
              </div>

              {mode === 'ios-safari' && (
                <ol className="pwa-install-steps">
                  <li className="pwa-install-step">
                    <span className="pwa-install-step-num" aria-hidden="true">1</span>
                    <span className="pwa-install-step-icon"><Share className="w-4 h-4" /></span>
                    <span className="pwa-install-step-text">{t('pwaInstallStepShare')}</span>
                  </li>
                  <li className="pwa-install-step">
                    <span className="pwa-install-step-num" aria-hidden="true">2</span>
                    <span className="pwa-install-step-icon"><SquarePlus className="w-4 h-4" /></span>
                    <span className="pwa-install-step-text">{t('pwaInstallStepAddHome')}</span>
                  </li>
                  <li className="pwa-install-step">
                    <span className="pwa-install-step-num" aria-hidden="true">3</span>
                    <span aria-hidden="true" />
                    <span className="pwa-install-step-text">{t('pwaInstallStepTapAdd')}</span>
                  </li>
                </ol>
              )}

              {(mode === 'ios-safari' || mode === 'ios-other') && (
                <div className="pwa-install-actions">
                  <button type="button" onClick={dismiss} className="btn btn-ember">
                    {t('pwaInstallGotIt')}
                  </button>
                </div>
              )}

              {mode === 'native' && (
                <div className="pwa-install-actions">
                  <button type="button" onClick={handleInstall} className="btn btn-ember">
                    {t('pwaInstallButton')}
                  </button>
                  <button type="button" onClick={dismiss} className="btn btn-quiet">
                    {t('notNowLabel')}
                  </button>
                </div>
              )}
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
