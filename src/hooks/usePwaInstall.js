import { useCallback, useEffect, useRef, useState } from 'react';

// Centralized "is this already installed?" check — covers the classic
// standalone media feature, the newer display modes a browser may report for
// an installed PWA, and iOS Safari's own non-standard navigator flag.
export function isStandaloneDisplay() {
  try {
    const isDisplayMode = (mode) => window.matchMedia(`(display-mode: ${mode})`).matches;
    return (
      isDisplayMode('standalone') ||
      isDisplayMode('fullscreen') ||
      isDisplayMode('window-controls-overlay') ||
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

// True only for actual Safari on iOS/iPadOS. Every other iOS browser (Chrome,
// Firefox, Edge, in-app webviews) is also WebKit under Apple's rules and
// still carries "Safari" in its UA string, but tags itself with its own
// token too — and, install-relevant, none of them can produce a genuine
// standalone-mode PWA the way Safari's own "Add to Home Screen" can.
export function isIosSafari() {
  if (!isIosDevice()) return false;
  try {
    const ua = window.navigator.userAgent;
    const isOtherIosBrowser = /crios|fxios|edgios|opios|mercury|gsa|duckduckgo|instagram|fban|fbav|line\//i.test(ua);
    return /safari/i.test(ua) && !isOtherIosBrowser;
  } catch {
    return false;
  }
}

// Single source of truth for which install experience applies:
// - 'standalone'  already installed/running as an app — never show anything
// - 'native'      Android/Chromium/desktop — driven by beforeinstallprompt
// - 'ios-safari'  iPhone/iPad in actual Safari — full Share/Add-to-Home-Screen steps
// - 'ios-other'   iPhone/iPad in a non-Safari browser — points them to Safari
export function getInstallPlatform() {
  if (isStandaloneDisplay()) return 'standalone';
  if (isIosDevice()) return isIosSafari() ? 'ios-safari' : 'ios-other';
  return 'native';
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
