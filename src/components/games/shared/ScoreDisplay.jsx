import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function ScoreDisplay({ score, accuracy, streak }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-8 text-sm font-semibold text-ink-soft">
      <span>{t('scoreLabel')} <strong className="text-jade">{score}</strong></span>
      <span>{t('accuracyLabel')} <strong className="text-ember">{accuracy}%</strong></span>
      {typeof streak === 'number' && <span>{t('streakLabel')} <strong className="text-ink">{streak}</strong></span>}
    </div>
  );
}
