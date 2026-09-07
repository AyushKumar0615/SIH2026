import { useCallback, useEffect, useRef, useState } from 'react';
import { GeolocationProvider, GEO_ERROR } from '../services/geolocationProvider';
import { LocationService } from '../services/locationService';

// Mounted once per elder session (in App.jsx, not inside a page that can
// remount on navigation) so tracking survives in-app navigation and only
// tears down on logout. On mount it reads the elder's saved sharing
// preference and the browser's current permission state, then decides
// whether to silently resume tracking or surface the permission prompt —
// the elder never has to press "Start Tracking" again once they've
// granted it once.
//
// status: 'idle' | 'checking' | 'prompt' | 'granted' | 'denied' | 'unavailable' | 'error'
export function useElderLocationTracking(session) {
  const isElder = session?.role === 'elderly';
  const elderId = session?.id;

  const [status, setStatus] = useState('idle');
  const [sharingEnabled, setSharingEnabled] = useState(false);

  const watchHandleRef = useRef(null);
  const watchActiveRef = useRef(false); // guards against duplicate watchers
  const lastSampleRef = useRef(null);
  const elderIdRef = useRef(elderId);
  elderIdRef.current = elderId;

  const stopWatch = useCallback(() => {
    if (watchHandleRef.current != null) {
      GeolocationProvider.clearWatch(watchHandleRef.current);
      watchHandleRef.current = null;
    }
    watchActiveRef.current = false;
  }, []);

  const handlePosition = useCallback((position) => {
    setStatus('granted');
    const sample = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp || Date.now()
    };
    if (LocationService.shouldPersist(lastSampleRef.current, sample)) {
      lastSampleRef.current = sample;
      LocationService.recordLocation(elderIdRef.current, sample);
    }
  }, []);

  const handleError = useCallback((err) => {
    if (err?.code === GEO_ERROR.PERMISSION_DENIED) {
      setStatus('denied');
      stopWatch();
      LocationService.upsertSettings(elderIdRef.current, { location_permission_status: 'denied' });
    } else {
      // Transient (timeout / position unavailable / no signal) — the
      // watcher keeps running and will recover on its own; the UI just
      // reflects that the last attempt didn't succeed.
      setStatus('error');
    }
  }, [stopWatch]);

  const startWatch = useCallback(() => {
    if (watchActiveRef.current) return;
    if (!GeolocationProvider.isSupported()) { setStatus('unavailable'); return; }
    watchActiveRef.current = true;
    watchHandleRef.current = GeolocationProvider.watchPosition(handlePosition, handleError);
  }, [handlePosition, handleError]);

  const enableSharing = useCallback(async () => {
    setStatus('checking');
    try {
      const position = await GeolocationProvider.getCurrentPosition();
      setSharingEnabled(true);
      await LocationService.upsertSettings(elderIdRef.current, { location_sharing_enabled: true, location_permission_status: 'granted' });
      handlePosition(position);
      startWatch();
    } catch (err) {
      const denied = err?.code === GEO_ERROR.PERMISSION_DENIED;
      setStatus(denied ? 'denied' : 'error');
      await LocationService.upsertSettings(elderIdRef.current, {
        location_sharing_enabled: false,
        location_permission_status: denied ? 'denied' : 'prompt'
      });
    }
  }, [handlePosition, startWatch]);

  const disableSharing = useCallback(async () => {
    stopWatch();
    setSharingEnabled(false);
    setStatus('idle');
    await LocationService.upsertSettings(elderIdRef.current, { location_sharing_enabled: false });
  }, [stopWatch]);

  const dismissPrompt = useCallback(() => setStatus('idle'), []);

  useEffect(() => {
    if (!isElder || !elderId) return undefined;
    let cancelled = false;

    (async () => {
      setStatus('checking');
      const [settingsResult, permission] = await Promise.all([
        LocationService.getSettings(elderId),
        GeolocationProvider.checkPermission()
      ]);
      if (cancelled) return;

      const settings = settingsResult.ok ? settingsResult.settings : null;
      const wasEnabled = settings?.location_sharing_enabled === true;
      setSharingEnabled(wasEnabled);

      if (!GeolocationProvider.isSupported()) {
        setStatus('unavailable');
        return;
      }
      if (permission === 'denied') {
        setStatus('denied');
        if (settings?.location_permission_status !== 'denied') {
          LocationService.upsertSettings(elderId, { location_permission_status: 'denied' });
        }
        return;
      }
      if (wasEnabled && permission === 'granted') {
        // Already decided, already allowed — resume silently, no prompt.
        startWatch();
        return;
      }
      // Either never enabled, or enabled on a browser/device that hasn't
      // (or no longer) records the decision — ask once.
      setStatus('prompt');
    })();

    return () => {
      cancelled = true;
      stopWatch();
    };
  }, [isElder, elderId, startWatch, stopWatch]);

  return { status, sharingEnabled, enableSharing, disableSharing, dismissPrompt };
}
