// Thin wrapper around the browser Geolocation API — deliberately the ONLY
// file in this app that touches `navigator.geolocation` directly. A native
// mobile build (React Native / Capacitor) can later swap this module for
// one backed by a background-location plugin without any caller (the
// tracking hook, the elder/caregiver/admin UI) needing to change, since
// they only depend on this shape: isSupported / checkPermission /
// getCurrentPosition / watchPosition / clearWatch.
//
// This module cannot and does not claim to track location while the
// browser tab is closed or the OS has suspended it — that guarantee only
// exists with a native background-location implementation.

export const GeolocationProvider = {
  isSupported() {
    return typeof navigator !== 'undefined' && !!navigator.geolocation;
  },

  // Returns 'granted' | 'denied' | 'prompt' | 'unavailable'.
  // The Permissions API isn't universally supported (older Safari lacks a
  // 'geolocation' descriptor) — callers should treat 'prompt' from here as
  // "unknown ahead of time, try requesting" rather than a hard signal.
  async checkPermission() {
    if (!this.isSupported()) return 'unavailable';
    if (!navigator.permissions?.query) return 'prompt';
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state;
    } catch {
      return 'prompt';
    }
  },

  getCurrentPosition(options = {}) {
    if (!this.isSupported()) return Promise.reject({ code: 0, message: 'unavailable' });
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
        ...options
      });
    });
  },

  // Returns a watch handle usable with clearWatch, or null if geolocation
  // isn't supported in this environment.
  watchPosition(onPosition, onError, options = {}) {
    if (!this.isSupported()) return null;
    return navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 30000,
      ...options
    });
  },

  clearWatch(watchHandle) {
    if (watchHandle != null && this.isSupported()) {
      navigator.geolocation.clearWatch(watchHandle);
    }
  }
};

// GeolocationPositionError codes, named for readability at call sites.
export const GEO_ERROR = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
