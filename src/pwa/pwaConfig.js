// Tweak these to change the install-prompt's timing/persistence behavior.
export const INSTALL_PROMPT_SHOW_DELAY_MS = 3000;
export const INSTALL_PROMPT_DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const INSTALL_PROMPT_DISMISSED_UNTIL_KEY = 'smritisetu-pwa-install-dismissed-until';

// How often an already-open tab re-checks the server for a new service
// worker, on top of the automatic check on every navigation/app-resume.
export const SW_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
