export const AudioService = {
  speak(text, lang = 'en', onEnd) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.86;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  playChime(type = 'success') {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = type === 'success' ? 660 : 330;
    gain.gain.value = 0.035;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  }
};
