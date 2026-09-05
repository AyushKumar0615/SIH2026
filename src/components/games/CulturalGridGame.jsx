import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CULTURAL_ITEMS, itemsByTag, difficultyLabelKey } from '../../data/culturalContent';
import { computeRoundScore, nextDifficultyLevel } from '../../services/gameScoring';
import GameHeader from './shared/GameHeader';
import ProgressBar from './shared/ProgressBar';
import FeedbackState from './shared/FeedbackState';
import { useTranslation } from '../../hooks/useTranslation';

const ROUND_TYPES = ['festival', 'duplicate', 'odd-one-out'];
const ROUND_INSTRUCTION_KEYS = {
  festival: 'gridInstructionFestival',
  duplicate: 'gridInstructionDuplicate',
  'odd-one-out': 'gridInstructionOddOneOut'
};
const LEVEL_CONFIG = {
  1: { gridSize: 6, timeSec: 22 },
  2: { gridSize: 8, timeSec: 19 },
  3: { gridSize: 10, timeSec: 16 },
  4: { gridSize: 12, timeSec: 14 },
  5: { gridSize: 16, timeSec: 12 }
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildRound(type, gridSize) {
  if (type === 'festival') {
    const festivalItems = shuffle(itemsByTag('Festival'));
    const targetCount = Math.max(2, Math.min(festivalItems.length, Math.round(gridSize / 3)));
    const targets = festivalItems.slice(0, targetCount);
    const distractors = shuffle(CULTURAL_ITEMS.filter((i) => i.tag !== 'Festival')).slice(0, gridSize - targetCount);
    const cells = shuffle([...targets, ...distractors]).map((item, idx) => ({ key: `${item.id}-${idx}`, item }));
    return { instructionKey: ROUND_INSTRUCTION_KEYS.festival, cells, correctKeys: new Set(cells.filter((c) => c.item.tag === 'Festival').map((c) => c.key)) };
  }
  if (type === 'duplicate') {
    const pool = shuffle(CULTURAL_ITEMS).slice(0, Math.min(gridSize - 1, CULTURAL_ITEMS.length - 1));
    const dup = pool[Math.floor(Math.random() * pool.length)];
    const cells = shuffle([...pool, dup]).map((item, idx) => ({ key: `${item.id}-${idx}`, item }));
    return { instructionKey: ROUND_INSTRUCTION_KEYS.duplicate, cells, correctKeys: new Set(cells.filter((c) => c.item.id === dup.id).map((c) => c.key)) };
  }
  const tags = [...new Set(CULTURAL_ITEMS.map((i) => i.tag))];
  const dominantTag = tags[Math.floor(Math.random() * tags.length)];
  const dominantPool = shuffle(itemsByTag(dominantTag));
  const oddItem = shuffle(CULTURAL_ITEMS.filter((i) => i.tag !== dominantTag))[0];
  const dominantItems = dominantPool.slice(0, Math.min(gridSize - 1, dominantPool.length));
  const cells = shuffle([...dominantItems, oddItem]).map((item, idx) => ({ key: `${item.id}-${idx}`, item }));
  return { instructionKey: ROUND_INSTRUCTION_KEYS['odd-one-out'], cells, correctKeys: new Set(cells.filter((c) => c.item.id === oddItem.id).map((c) => c.key)) };
}

export default function CulturalGridGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(() => buildRound(ROUND_TYPES[0], LEVEL_CONFIG[1].gridSize));
  const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG[1].timeSec);
  const [selected, setSelected] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [accuracySum, setAccuracySum] = useState(0);

  const config = LEVEL_CONFIG[level];

  React.useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) { submit(); return; }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, locked]);

  const toggleCell = (key) => {
    if (locked) return;
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  };

  const submit = () => {
    if (locked) return;
    setLocked(true);
    const matchCount = selected.filter((k) => roundData.correctKeys.has(k)).length;
    const wrongCount = selected.length - matchCount;
    const totalTargets = roundData.correctKeys.size || 1;
    const roundAccuracy = Math.max(0, Math.min(100, Math.round(((matchCount - wrongCount) / totalTargets) * 100)));
    const isRoundCorrect = roundAccuracy === 100;
    const nextStreak = isRoundCorrect ? streak + 1 : 0;
    const roundScore = computeRoundScore({ correct: isRoundCorrect, difficultyLevel: level, timeTakenSec: config.timeSec - timeLeft, timeLimitSec: config.timeSec, streak: nextStreak });

    setScore((s) => s + roundScore);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setAccuracySum((a) => a + roundAccuracy);
    setFeedback(isRoundCorrect ? 'correct' : 'incorrect');

    window.setTimeout(() => {
      setFeedback(null);
      if (round >= ROUND_TYPES.length) {
        const finalAccuracy = Math.round((accuracySum + roundAccuracy) / ROUND_TYPES.length);
        onFinishGame({
          gameNameKey: 'gameGridTitle', domain: 'Attention', skillKey: 'gameGridResultSkill',
          score: score + roundScore, accuracy: finalAccuracy, bestStreak: Math.max(bestStreak, nextStreak), difficultyLevel: level
        });
        return;
      }
      const newLevel = nextDifficultyLevel(level, roundAccuracy);
      const nextConfig = LEVEL_CONFIG[newLevel];
      setLevel(newLevel);
      setRound((r) => r + 1);
      setRoundData(buildRound(ROUND_TYPES[round], nextConfig.gridSize));
      setTimeLeft(nextConfig.timeSec);
      setSelected([]);
      setLocked(false);
    }, 1100);
  };

  return (
    <div className="page max-w-2xl">
      <GameHeader title={t('gameGridTitle')} level={level} progress={`${t('roundLabel')} ${round}/${ROUND_TYPES.length}`} score={score} onExit={onBack} />

      <div className="text-center mb-6">
        <span className="eyebrow justify-center">{t('instructionEyebrow')}</span>
        <h3 className="font-display text-2xl font-medium mt-2">{t(roundData.instructionKey)}</h3>
      </div>

      <ProgressBar value={(timeLeft / config.timeSec) * 100} />
      <p className="text-center text-xs font-semibold mt-2 mb-6" style={{ color: 'var(--ink-faint)' }}>{timeLeft}{t('secondsUnit')} {t('remainingLabel')}</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {roundData.cells.map((cell) => {
          const isSelected = selected.includes(cell.key);
          const showResult = locked;
          const isCorrectKey = roundData.correctKeys.has(cell.key);
          let stateClass = isSelected ? 'is-selected' : '';
          if (showResult) {
            if (isCorrectKey) stateClass = 'is-correct';
            else if (isSelected) stateClass = 'is-incorrect';
          }
          return (
            <motion.button
              key={cell.key}
              type="button"
              onClick={() => toggleCell(cell.key)}
              disabled={locked}
              whileTap={{ scale: 0.94 }}
              className={`cog-slot is-selectable ${stateClass}`}
            >
              <span className="cog-slot-icon">{cell.item.icon}</span>
              <span className="cog-slot-label">{t(cell.item.nameKey)}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 mt-8">
        <button type="button" onClick={submit} disabled={locked || selected.length === 0} className="btn btn-ember">{t('submitSelectionLabel')}</button>
        <FeedbackState state={feedback} correctText={t('wellSpottedFeedback')} incorrectText={t('notQuiteFeedback')} />
      </div>

      <p className="text-center text-xs font-semibold mt-8" style={{ color: 'var(--ink-faint)' }}>{t(difficultyLabelKey(level))} · {t('levelLabel')} {level}</p>
    </div>
  );
}
