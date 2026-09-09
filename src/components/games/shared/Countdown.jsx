import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const TICK_MS = 1000;

// Full-screen 3-2-1 countdown shown before every game (re)start. Rendered
// via a portal straight into document.body — GameShell's page-transition
// wrapper animates with transform/filter, which would otherwise turn our
// position:fixed centering into "fixed relative to that wrapper" instead of
// the real viewport. Ticks from `seconds` down to 1, then calls onComplete
// exactly once, after the last number's exit animation finishes (not before
// — so the game only starts once the countdown has visibly finished).
export default function Countdown({ seconds = 3, onComplete }) {
  const [count, setCount] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    if (count <= 0) return undefined;
    const id = window.setTimeout(() => setCount((c) => c - 1), TICK_MS);
    return () => window.clearTimeout(id);
  }, [count]);

  return createPortal(
    <div className="game-countdown-overlay" role="status" aria-live="assertive" aria-label={String(count > 0 ? count : '')}>
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          if (count === 0 && !firedRef.current) {
            firedRef.current = true;
            onComplete?.();
          }
        }}
      >
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="game-countdown-number"
            aria-hidden="true"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
