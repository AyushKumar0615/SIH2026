import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CULTURAL_ITEMS, difficultyLabelKey } from '../../data/culturalContent';
import { computeRoundScore, nextDifficultyLevel } from '../../services/gameScoring';
import GameHeader from './shared/GameHeader';
import ProgressBar from './shared/ProgressBar';
import FeedbackState from './shared/FeedbackState';
import { useTranslation } from '../../hooks/useTranslation';

const TOTAL_ROUNDS = 3;
const LEVEL_CONFIG = {
  1: { slotCount: 6, itemCount: 5, viewSec: 5, changeCount: 1 },
  2: { slotCount: 8, itemCount: 6, viewSec: 5, changeCount: 1 },
  3: { slotCount: 9, itemCount: 7, viewSec: 4, changeCount: 2 },
  4: { slotCount: 12, itemCount: 9, viewSec: 4, changeCount: 2 },
  5: { slotCount: 12, itemCount: 10, viewSec: 3, changeCount: 3 }
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildRound(config) {
  const chosen = shuffle(CULTURAL_ITEMS).slice(0, config.itemCount);
  const positions = shuffle([...Array(config.slotCount).keys()]).slice(0, config.itemCount);
  const before = Array(config.slotCount).fill(null);
  positions.forEach((pos, i) => { before[pos] = chosen[i]; });
  const after = [...before];
  const usedIds = new Set(chosen.map((i) => i.id));
  let changesApplied = 0;

  for (let n = 0; n < config.changeCount; n++) {
    const occupied = after.map((v, i) => (v ? i : -1)).filter((i) => i !== -1);
    const empty = after.map((v, i) => (v ? -1 : i)).filter((i) => i !== -1);
    const roll = Math.random();

    if (roll < 0.34 && occupied.length > 2) {
      const idx = occupied[Math.floor(Math.random() * occupied.length)];
      after[idx] = null;
      changesApplied++;
    } else if (roll < 0.67 && empty.length > 0) {
      const unused = CULTURAL_ITEMS.filter((i) => !usedIds.has(i.id));
      if (unused.length > 0) {
        const item = shuffle(unused)[0];
        usedIds.add(item.id);
        const idx = empty[Math.floor(Math.random() * empty.length)];
        after[idx] = item;
        changesApplied++;
      }
    } else if (occupied.length > 0 && empty.length > 0) {
      const fromIdx = occupied[Math.floor(Math.random() * occupied.length)];
      const toIdx = empty[Math.floor(Math.random() * empty.length)];
      after[toIdx] = after[fromIdx];
      after[fromIdx] = null;
      changesApplied += 2;
    }
  }

  if (changesApplied === 0) {
    const idx = before.findIndex((v) => v);
    if (idx !== -1) after[idx] = null;
  }

  const changedIndices = new Set(before.map((v, i) => (v?.id !== after[i]?.id ? i : -1)).filter((i) => i !== -1));
  return { before, after, changedIndices, slotCount: config.slotCount };
}

export default function WhatChangedGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('study'); // study | transition | find | feedback
  const [roundData, setRoundData] = useState(() => buildRound(LEVEL_CONFIG[1]));
  const [viewLeft, setViewLeft] = useState(LEVEL_CONFIG[1].viewSec);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [accuracySum, setAccuracySum] = useState(0);
  const startedAt = useMemo(() => Date.now(), [round]);

  const config = LEVEL_CONFIG[level];

  React.useEffect(() => {
    if (phase !== 'study') return;
    if (viewLeft <= 0) { setPhase('transition'); window.setTimeout(() => setPhase('find'), 600); return; }
    const id = window.setTimeout(() => setViewLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, viewLeft]);

  const toggleSlot = (idx) => {
    if (phase !== 'find') return;
    setSelected((s) => (s.includes(idx) ? s.filter((i) => i !== idx) : [...s, idx]));
  };

  const submit = () => {
    if (phase !== 'find') return;
    const matchCount = selected.filter((i) => roundData.changedIndices.has(i)).length;
    const wrongCount = selected.length - matchCount;
    const totalTargets = roundData.changedIndices.size || 1;
    const roundAccuracy = Math.max(0, Math.min(100, Math.round(((matchCount - wrongCount) / totalTargets) * 100)));
    const isRoundCorrect = roundAccuracy === 100;
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);
    const nextStreak = isRoundCorrect ? streak + 1 : 0;
    const roundScore = computeRoundScore({ correct: isRoundCorrect, difficultyLevel: level, timeTakenSec: timeTaken, timeLimitSec: config.viewSec * 5, streak: nextStreak });

    setScore((s) => s + roundScore);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setAccuracySum((a) => a + roundAccuracy);
    setFeedback(isRoundCorrect ? 'correct' : 'incorrect');
    setPhase('feedback');

    window.setTimeout(() => {
      setFeedback(null);
      if (round >= TOTAL_ROUNDS) {
        const finalAccuracy = Math.round((accuracySum + roundAccuracy) / TOTAL_ROUNDS);
        onFinishGame({
          gameNameKey: 'gameChangedTitle', domain: 'Attention', skillKey: 'gameChangedResultSkill',
          score: score + roundScore, accuracy: finalAccuracy, bestStreak: Math.max(bestStreak, nextStreak), difficultyLevel: level
        });
        return;
      }
      const newLevel = nextDifficultyLevel(level, roundAccuracy);
      const nextConfig = LEVEL_CONFIG[newLevel];
      setLevel(newLevel);
      setRound((r) => r + 1);
      setRoundData(buildRound(nextConfig));
      setViewLeft(nextConfig.viewSec);
      setSelected([]);
      setPhase('study');
    }, 1300);
  };

  const scene = phase === 'study' ? roundData.before : roundData.after;
  const cols = roundData.slotCount <= 6 ? 3 : 4;

  return (
    <div className="page max-w-2xl">
      <GameHeader title={t('gameChangedTitle')} level={level} progress={`${t('roundLabel')} ${round}/${TOTAL_ROUNDS}`} score={score} onExit={onBack} />

      {phase === 'study' && (
        <div className="text-center mb-4">
          <span className="eyebrow eyebrow-jade justify-center">{t('changedStudyEyebrow')}</span>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>{t('changedStudyHintPrefix')} {viewLeft}{t('secondsUnit')}</p>
        </div>
      )}
      {phase === 'transition' && <div className="text-center mb-4"><span className="eyebrow justify-center">{t('changingEllipsisLabel')}</span></div>}
      {(phase === 'find' || phase === 'feedback') && (
        <div className="text-center mb-4">
          <span className="eyebrow justify-center">{t('findWhatChangedEyebrow')}</span>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>{t('findWhatChangedHint')}</p>
        </div>
      )}

      {phase === 'study' && <ProgressBar value={(viewLeft / config.viewSec) * 100} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={phase === 'transition' ? 'blank' : phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'transition' ? 0.15 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={`grid gap-3 mt-6 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}
        >
          {scene.map((item, idx) => {
            const isSelected = selected.includes(idx);
            const isChangedSlot = roundData.changedIndices.has(idx);
            const showResult = phase === 'feedback';
            let stateClass = isSelected ? 'is-selected' : '';
            if (showResult) {
              if (isChangedSlot) stateClass = 'is-correct';
              else if (isSelected) stateClass = 'is-incorrect';
            }
            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => toggleSlot(idx)}
                disabled={phase !== 'find'}
                whileTap={{ scale: 0.94 }}
                className={`cog-slot ${phase === 'find' ? 'is-selectable' : ''} ${!item ? 'is-empty' : ''} ${stateClass}`}
              >
                {item ? (<><span className="cog-slot-icon">{item.icon}</span><span className="cog-slot-label">{t(item.nameKey)}</span></>) : null}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {phase === 'find' && (
        <div className="flex justify-center mt-8">
          <button type="button" onClick={submit} disabled={selected.length === 0} className="btn btn-ember">{t('confirmChangesLabel')}</button>
        </div>
      )}

      <div className="flex justify-center mt-6"><FeedbackState state={feedback} correctText={t('sharpEyesFeedback')} incorrectText={t('changesMissedFeedback')} /></div>

      <p className="text-center text-xs font-semibold mt-8" style={{ color: 'var(--ink-faint)' }}>{t(difficultyLabelKey(level))} · {t('levelLabel')} {level}</p>
    </div>
  );
}
