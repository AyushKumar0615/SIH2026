import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function GameHeader({ title, level, totalLevels = 5, progress, score, onExit }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-4 mb-8 pb-5 flex-wrap" style={{ borderBottom: '1px solid var(--hairline)' }}>
      <button type="button" onClick={onExit} className="btn btn-quiet !px-0 shrink-0">
        <ArrowLeft className="w-4 h-4" /> {t('exitLabel')}
      </button>

      <span className="font-display text-lg sm:text-xl font-medium text-center flex-1 min-w-[8rem] truncate" style={{ color: 'var(--ink)' }}>{title}</span>

      <div className="flex items-center gap-4 shrink-0 text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
        <span>{t('levelLabel')} <strong style={{ color: 'var(--ember)' }}>{level}</strong>/{totalLevels}</span>
        {typeof progress === 'string' && <span className="hidden sm:inline">{progress}</span>}
        <span>{t('scoreLabel')} <strong style={{ color: 'var(--jade)' }}>{score}</strong></span>
      </div>
    </div>
  );
}
