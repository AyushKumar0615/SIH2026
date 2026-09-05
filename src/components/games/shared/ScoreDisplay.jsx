import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function ScoreDisplay({ score, accuracy, streak }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-8 text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
      <span>{t('scoreLabel')} <strong style={{ color: 'var(--jade)' }}>{score}</strong></span>
      <span>{t('accuracyLabel')} <strong style={{ color: 'var(--ember)' }}>{accuracy}%</strong></span>
      {typeof streak === 'number' && <span>{t('streakLabel')} <strong style={{ color: 'var(--ink)' }}>{streak}</strong></span>}
    </div>
  );
}
