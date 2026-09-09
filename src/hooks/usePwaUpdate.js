import { useCallback, useEffect, useState } from 'react';
import { SW_UPDATE_CHECK_INTERVAL_MS } from '../pwa/pwaConfig';

// Single source of truth for the service-worker registration + "an update is
// waiting" state. Registers the worker exactly once (module-scope guard) so
// remounts never create a second registration, and re-checks for a new
// version periodically, whenever the tab becomes visible again, and on
// window focus (covers a PWA being resumed from the background/home screen).
let initialized = false;
let registration = null;
let waitingWorker = null;
let reloadTriggered = false;
const subscribers = new Set();

function notify() {
  subscribers.forEach((fn) => fn());
}

function watchInstallingWorker(newWorker) {
  if (!newWorker) return;
  newWorker.addEventListener('statechange', () => {
    // "installed" + an existing controller means this is an *update* (not
    // the very first install, which has no prior controller) — the new
    // worker is ready and waiting for the user to opt in.
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      waitingWorker = newWorker;
      notify();
    }
  });
}

function initServiceWorkerUpdates() {
  if (initialized || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  initialized = true;

  window.addEventListener('load', async () => {
    try {
      // updateViaCache: 'none' means neither this script nor any of its
      // imports may ever be served from the browser's HTTP cache on an
      // update check — belt-and-braces on top of the spec's own default
      // ('imports', which already exempts the main script), since an
      // installed PWA can sit on a persistent disk-cached copy for far
      // longer than a regular browser tab would before this file is
      // fetched fresh.
      registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
    } catch {
      return;
    }

    // A worker may already be sitting in "waiting" if it finished installing
    // while this tab was closed/backgrounded.
    if (registration.waiting && navigator.serviceWorker.controller) {
      waitingWorker = registration.waiting;
      notify();
    }

    registration.addEventListener('updatefound', () => {
      watchInstallingWorker(registration.installing);
    });

    const checkForUpdate = () => registration.update().catch(() => {});
    // Check right away, not just on the next interval/visibility/focus tick.
    // This is the one call that actually matters for an installed Home
    // Screen PWA: on iOS especially, a fully backgrounded app is usually
    // terminated outright, so `load` firing on relaunch is the only
    // reliable moment this app ever gets to ask "is there a new version?" —
    // waiting out the rest of a since-elapsed interval, or a visibility/
    // focus event that may not even fire on a fresh launch, could otherwise
    // delay detection far longer than necessary.
    checkForUpdate();
    setInterval(checkForUpdate, SW_UPDATE_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    });
    window.addEventListener('focus', checkForUpdate);
  });

  // Fires once the newly-activated worker takes control (right after we ask
  // it to skip waiting). Reload exactly once to pick up the new app shell —
  // this never touches localStorage/sessionStorage/IndexedDB/cookies, so
  // auth sessions, preferences, and cached app data all survive it.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadTriggered) return;
    reloadTriggered = true;
    window.location.reload();
  });
}

initServiceWorkerUpdates();

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(Boolean(waitingWorker));

  useEffect(() => {
    const sync = () => setUpdateAvailable(Boolean(waitingWorker));
    subscribers.add(sync);
    sync();
    return () => subscribers.delete(sync);
  }, []);

  const activateUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }, []);

  return { updateAvailable, activateUpdate };
}
