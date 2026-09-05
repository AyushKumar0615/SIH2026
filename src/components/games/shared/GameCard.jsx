import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, Gauge, Sparkles } from 'lucide-react';
import Magnetic from '../../common/Magnetic';
import GamePreview from './GamePreview';
import { useTranslation } from '../../../hooks/useTranslation';

export function FeaturedGameCard({ game, onPlay }) {
  const { t } = useTranslation();
  return (
    <div className="game-card game-card-featured">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center">
        <div>
          <span className="eyebrow eyebrow-jade">{t('featuredExerciseLabel')} · {game.category}</span>
          <h3 className="font-display text-3xl sm:text-4xl font-medium mt-3 leading-[1.05]">{game.title}</h3>
          <p className="text-sm sm:text-[0.95rem] mt-3 leading-relaxed max-w-md" style={{ color: 'var(--ink-faint)' }}>{game.description}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--ember)' }} /> {game.skill}</span>
            <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> {game.difficultyText}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {game.estimatedMinutes} min</span>
          </div>
          <Magnetic strength={0.3}>
            <button type="button" onClick={() => onPlay(game)} className="btn btn-ember mt-7">{t('startExerciseLabel')}</button>
          </Magnetic>
        </div>
        <GamePreview gameId={game.id} size="lg" />
      </div>
    </div>
  );
}

export default function GameCard({ game, onPlay }) {
  return (
    <motion.button
      type="button"
      onClick={() => onPlay(game)}
      className="game-card game-card-grid text-left"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="index-num">0{game.number}</span>
        <Magnetic strength={0.3}>
          <span className="index-arrow" style={{ opacity: 1, color: 'var(--ink)' }}><ArrowUpRight className="w-4.5 h-4.5" /></span>
        </Magnetic>
      </div>

      <span className="font-display text-xl font-medium block mt-3 leading-tight">{game.title}</span>
      <span className="pin flex items-center gap-1.5 mt-1" style={{ color: 'var(--ink-faint)' }}>
        {game.category} <span style={{ color: 'var(--hairline-strong)' }}>·</span> {game.skill}
      </span>
      <span className="text-sm block mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--ink-faint)' }}>{game.description}</span>

      <div className="mt-4">
        <GamePreview gameId={game.id} size="sm" />
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
        <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> {game.difficultyText}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {game.estimatedMinutes} min</span>
      </div>
    </motion.button>
  );
}
