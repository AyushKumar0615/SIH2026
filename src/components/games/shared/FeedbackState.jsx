import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

// Correct/incorrect feedback that never relies on color alone — an icon and
// a text label always accompany the tone.
export default function FeedbackState({ state, correctText = 'Correct', incorrectText = 'Try again' }) {
  if (!state) return null;
  const isCorrect = state === 'correct';
  return (
    <AnimatePresence>
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2 text-sm font-semibold"
        style={{ color: isCorrect ? 'var(--jade)' : 'var(--alert)' }}
        role="status"
      >
        {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        {isCorrect ? correctText : incorrectText}
      </motion.div>
    </AnimatePresence>
  );
}
