// Web Audio chime for the reminder alert — same AudioContext approach as
// AudioService.playChime, just a repeating two-note pattern instead of a
// single tick, so no new dependency is needed.
//
// Autoplay handling: a browser creates AudioContext in a "suspended" state
// until a real user gesture resumes it — a setInterval/setTimeout callback
// never counts as one, no matter how it's called. So this module also wires
// up a one-time, app-wide gesture listener (see attachGesturePrimer, called
// once from App.jsx) that resumes the shared context the moment the user
// interacts with the app at all, for any reason — by the time a reminder
// actually fires, sound is very often already unlocked. When it isn't
// (e.g. the very first reminder before any interaction), tryPlayOnce()
// simply reports that nothing played, and the alert UI shows an explicit
// "tap to enable sound" affordance whose click handler (unlockAndPlay) is
// itself a real gesture and always works.

let sharedContext = null;
let ringIntervalId = null;
let gesturePrimerAttached = false;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) sharedContext = new AudioContextClass();
  return sharedContext;
}

function playTone(context, frequency, startTime, duration) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.09, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

// A gentle two-note chime — pleasant but unmistakable, not a harsh siren.
function playChimePattern(context) {
  const now = context.currentTime;
  playTone(context, 880, now, 0.22);
  playTone(context, 1108.73, now + 0.26, 0.3);
}

export const ReminderSoundService = {
  attachGesturePrimer() {
    if (gesturePrimerAttached || typeof window === 'undefined') return;
    gesturePrimerAttached = true;
    const prime = () => {
      const context = getContext();
      if (context && context.state === 'suspended') context.resume().catch(() => {});
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
      window.addEventListener(eventName, prime, { passive: true });
    });
  },

  isUnlocked() {
    const context = getContext();
    return !!context && context.state === 'running';
  },

  // Plays only if the context is already running; returns whether it did,
  // so callers can react (e.g. show "tap to enable sound") without ever
  // throwing on a blocked autoplay attempt.
  tryPlayOnce() {
    const context = getContext();
    if (!context || context.state !== 'running') return false;
    playChimePattern(context);
    return true;
  },

  // Only ever called from inside a real click handler, which is itself a
  // user gesture — resume() is guaranteed to succeed here.
  unlockAndPlay() {
    const context = getContext();
    if (!context) return;
    context.resume().then(() => playChimePattern(context)).catch(() => {});
  },

  // Repeats the chime every `intervalMs` until stopRinging() is called.
  // Always stops any previous loop first, so overlapping intervals can
  // never stack up regardless of how many times this is invoked.
  startRinging(intervalMs, onTick) {
    this.stopRinging();
    const attempt = () => onTick?.(this.tryPlayOnce());
    attempt();
    ringIntervalId = window.setInterval(attempt, intervalMs);
  },

  stopRinging() {
    if (ringIntervalId != null) {
      window.clearInterval(ringIntervalId);
      ringIntervalId = null;
    }
  }
};
