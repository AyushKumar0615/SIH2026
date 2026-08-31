import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Mic, Check } from 'lucide-react';
import Waveform from '../common/Waveform';

export default function VoiceOrb({ size = 'lg', speaking = false, onActivate }) {
  const [isListening, setIsListening] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const wasSpeaking = useRef(false);
  const wrapRef = useRef(null);
  const proximity = useMotionValue(0);
  const proximitySpring = useSpring(proximity, { stiffness: 120, damping: 20 });

  useEffect(() => {
    if (wasSpeaking.current && !speaking) {
      setJustCompleted(true);
      const t = window.setTimeout(() => setJustCompleted(false), 900);
      wasSpeaking.current = speaking;
      return () => window.clearTimeout(t);
    }
    wasSpeaking.current = speaking;
  }, [speaking]);

  const phase = speaking ? 'speaking' : justCompleted ? 'completed' : isListening ? 'listening' : 'idle';
  const dims = size === 'lg' ? 'w-24 h-24 md:w-28 md:h-28' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'w-9 h-9 md:w-10 md:h-10' : 'w-6 h-6';

  useEffect(() => {
    const handleMove = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const radius = 340;
      proximity.set(Math.max(0, 1 - dist / radius));
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [proximity]);

  const handleClick = () => {
    if (isListening) return;
    setIsListening(true);
    window.setTimeout(() => {
      setIsListening(false);
      onActivate?.();
    }, 900);
  };

  const tone = phase === 'speaking' || phase === 'completed' ? 'var(--jade)' : 'var(--ember)';

  return (
    <div ref={wrapRef} className="orb-wrap">
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 60px 10px ${phase === 'speaking' ? 'rgba(79,174,142,0.35)' : 'rgba(226,112,58,0.35)'}`,
          opacity: proximitySpring
        }}
      />
      <span className={`orb-ring ${phase !== 'idle' ? 'is-active' : ''}`} style={{ borderColor: tone }} />
      <span className={`orb-ring delay-1 ${phase !== 'idle' ? 'is-active' : ''}`} style={{ borderColor: tone }} />
      {phase === 'idle' && <span className="orb-ring delay-2" style={{ borderColor: tone }} />}

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={phase === 'listening' ? 'Listening…' : phase === 'speaking' ? 'Speaking…' : phase === 'completed' ? 'Finished speaking' : 'Open voice companion'}
        className={`relative overflow-hidden ${dims} rounded-full grid place-items-center`}
        style={{ background: tone, boxShadow: phase === 'speaking' || phase === 'completed' ? 'var(--shadow-jade, 0 18px 44px -16px rgba(79,174,142,0.5))' : 'var(--shadow-ember)' }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        animate={
          phase === 'listening'
            ? { scale: [1, 1.06, 1] }
            : phase === 'speaking'
            ? { scale: [1, 1.03, 1] }
            : phase === 'completed'
            ? { scale: [1, 1.14, 1] }
            : { scale: [1, 1.015, 1] }
        }
        transition={
          phase === 'listening'
            ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
            : phase === 'speaking'
            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            : phase === 'completed'
            ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
            : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'conic-gradient(from 0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 6%, rgba(255,255,255,0) 18%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />
        <AnimatePresence mode="wait">
          {phase === 'idle' ? (
            <motion.span key="mic" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
              <Mic className={iconSize} style={{ color: '#1a0f08' }} />
            </motion.span>
          ) : phase === 'completed' ? (
            <motion.span key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.2, ease: [0.34, 1.4, 0.4, 1] }}>
              <Check className={iconSize} style={{ color: '#0c1a15' }} />
            </motion.span>
          ) : (
            <motion.span key="wave" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
              <Waveform active />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
