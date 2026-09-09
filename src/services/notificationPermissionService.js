// Thin wrapper around the browser's Web Notifications API — NOT push
// notifications. There is no push infrastructure in this app (no service
// worker push handler, no VAPID keys, no server to trigger a send), so this
// can only ever reach the user while this tab's own JS is still running
// (open in the background, or an installed PWA window that's open but not
// focused). It cannot deliver anything once the tab/app is fully closed —
// that would need real Push, which is a separate backend feature and out of
// scope here (see the reminder-alert report for the full breakdown).
export const NotificationPermissionService = {
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission() {
    return this.isSupported() ? Notification.permission : 'unsupported';
  },

  // Must be called from a real user gesture (a click handler) — never on
  // page load, per the brief.
  async request() {
    if (!this.isSupported()) return 'unsupported';
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  },

  // Only meaningful when this tab isn't the active, focused one — while it
  // is, the in-app full-screen alert is already the unmissable surface, and
  // an OS notification on top of it would just be redundant noise.
  notifyIfBackground(title, options) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible' && document.hasFocus()) return;
    try {
      new Notification(title, options);
    } catch {
      // A handful of browsers (notably iOS Safari, even installed as a PWA)
      // don't support the constructor form at all — no-op rather than throw.
    }
  }
};
