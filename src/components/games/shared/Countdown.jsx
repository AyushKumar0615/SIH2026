import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';

// Ticks from `seconds` down to 1, then calls onComplete once.
export default function Countdown({ seconds = 3, label, onComplete }) {
  const { t } = useTranslation();
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onComplete?.();
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 800);
    return () => window.clearTimeout(id);
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      {label && <span className="eyebrow">{label}</span>}
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl font-medium"
          style={{ color: 'var(--ember)' }}
        >
          {count > 0 ? count : t('goLabel')}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
