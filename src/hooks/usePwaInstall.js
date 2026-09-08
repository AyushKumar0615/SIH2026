import { useCallback, useEffect, useRef, useState } from 'react';

export function isStandaloneDisplay() {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  } catch {
    return false;
  }
}

export function isIosDevice() {
  try {
    const ua = window.navigator.userAgent;
    // iPadOS 13+ reports "MacIntel" in the user agent by default (Apple made
    // iPad Safari masquerade as desktop Safari), so a plain UA regex misses
    // every modern iPad. Multi-touch is the reliable signal that a
    // "MacIntel" device is actually an iPad, since real Macs report 0.
    const isModernIpad = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
    return (/iphone|ipad|ipod/i.test(ua) || isModernIpad) && !window.MSStream;
  } catch {
    return false;
  }
}

// Single source of truth for PWA installability/installed state. Listens for
// the browser's native beforeinstallprompt/appinstalled events exactly once
// (module-scope guard) so remounts never register duplicate listeners.
let listenersAttached = false;
let sharedDeferredPrompt = null;
const subscribers = new Set();

function notify() {
  subscribers.forEach((fn) => fn());
}

function attachListenersOnce() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    sharedDeferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    sharedDeferredPrompt = null;
    notify();
  });
}

attachListenersOnce();

export function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState(Boolean(sharedDeferredPrompt));
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const sync = () => {
      if (!mountedRef.current) return;
      setIsInstallable(Boolean(sharedDeferredPrompt));
      if (!sharedDeferredPrompt) setIsInstalled(isStandaloneDisplay());
    };
    subscribers.add(sync);
    sync();
    return () => {
      mountedRef.current = false;
      subscribers.delete(sync);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!sharedDeferredPrompt) return 'unavailable';
    sharedDeferredPrompt.prompt();
    let outcome = 'dismissed';
    try {
      ({ outcome } = await sharedDeferredPrompt.userChoice);
    } catch {
      outcome = 'dismissed';
    }
    sharedDeferredPrompt = null;
    notify();
    return outcome;
  }, []);

  return { isInstallable, isInstalled, promptInstall };
}
