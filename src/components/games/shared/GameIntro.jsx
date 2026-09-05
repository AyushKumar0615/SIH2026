import React from 'react';
import { ArrowLeft, Clock, Gauge, Sparkles } from 'lucide-react';
import GamePreview from './GamePreview';
import { useTranslation } from '../../../hooks/useTranslation';

export default function GameIntro({ gameId, icon, title, skill, howItWorks, difficultyText, estimatedMinutes, onStart, onBack }) {
  const { t } = useTranslation();
  return (
    <div className="page max-w-2xl">
      <button type="button" onClick={onBack} className="btn btn-quiet !flex !px-0 mb-8"><ArrowLeft className="w-4 h-4" /> {t('gameLibrary')}</button>

      <div className="panel-dark p-8 sm:p-10 space-y-7">
        <div className="flex items-start gap-4">
          <span className="text-4xl leading-none">{icon}</span>
          <div>
            <span className="eyebrow">{t('featuredExerciseLabel')}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium mt-2 leading-tight">{title}</h2>
          </div>
        </div>

        {gameId && <GamePreview gameId={gameId} size="lg" />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '1.25rem 0' }}>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--ember)' }} />
            <div>
              <span className="figure-label">{t('whatYoullTrainLabel')}</span>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink)' }}>{skill}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Gauge className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--ember)' }} />
            <div>
              <span className="figure-label">{t('difficultyLabel')}</span>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink)' }}>{difficultyText}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--ember)' }} />
            <div>
              <span className="figure-label">{t('estimatedTimeLabel')}</span>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink)' }}>{estimatedMinutes} {t('minLabel')}</p>
            </div>
          </div>
        </div>

        <div>
          <span className="figure-label">{t('howItWorksLabel')}</span>
          <ul className="mt-2 space-y-1.5">
            {howItWorks.map((step, idx) => (
              <li key={idx} className="text-sm leading-relaxed flex items-start gap-2.5" style={{ color: 'var(--ink-soft)' }}>
                <span className="font-mono text-xs mt-0.5 shrink-0" style={{ color: 'var(--ink-faint)' }}>0{idx + 1}</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" onClick={onStart} className="btn btn-ember w-full">{t('startExerciseLabel')}</button>
      </div>
    </div>
  );
}
