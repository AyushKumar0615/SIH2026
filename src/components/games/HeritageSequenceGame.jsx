import React, { useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { HERITAGE_SEQUENCES, difficultyLabelKey } from '../../data/culturalContent';
import { computeRoundScore, computeAccuracy, nextDifficultyLevel } from '../../services/gameScoring';
import GameHeader from './shared/GameHeader';
import FeedbackState from './shared/FeedbackState';
import { useTranslation } from '../../hooks/useTranslation';

const TOTAL_ROUNDS = 3;
const LEVEL_CONFIG = {
  1: { timeSec: 90, showNotes: true },
  2: { timeSec: 75, showNotes: true },
  3: { timeSec: 60, showNotes: false },
  4: { timeSec: 45, showNotes: false },
  5: { timeSec: 35, showNotes: false }
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickSequence(usedIds) {
  const available = HERITAGE_SEQUENCES.filter((s) => !usedIds.has(s.id));
  const pool = available.length > 0 ? available : HERITAGE_SEQUENCES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function HeritageSequenceGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [usedIds, setUsedIds] = useState(() => new Set());
  const [sequenceSet, setSequenceSet] = useState(() => {
    const s = pickSequence(new Set());
    return s;
  });
  const [items, setItems] = useState(() => shuffle(sequenceSet.steps));
  const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG[1].timeSec);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [accuracySum, setAccuracySum] = useState(0);
  const startedAt = useMemo(() => Date.now(), [round]);

  const config = LEVEL_CONFIG[level];

  React.useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) { checkOrder(); return; }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, locked]);

  const checkOrder = () => {
    if (locked) return;
    setLocked(true);
    const correctCount = items.filter((item, idx) => item.id === sequenceSet.steps[idx].id).length;
    const roundAccuracy = computeAccuracy(correctCount, sequenceSet.steps.length);
    const isRoundCorrect = roundAccuracy === 100;
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);
    const nextStreak = isRoundCorrect ? streak + 1 : 0;
    const roundScore = computeRoundScore({ correct: isRoundCorrect, difficultyLevel: level, timeTakenSec: timeTaken, timeLimitSec: config.timeSec, streak: nextStreak });

    setScore((s) => s + roundScore);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setAccuracySum((a) => a + roundAccuracy);
    setFeedback(isRoundCorrect ? 'correct' : 'incorrect');

    window.setTimeout(() => {
      setFeedback(null);
      if (round >= TOTAL_ROUNDS) {
        const finalAccuracy = Math.round((accuracySum + roundAccuracy) / TOTAL_ROUNDS);
        onFinishGame({
          gameNameKey: 'gameSequenceTitle', domain: 'Orientation', skillKey: 'gameSequenceSkill',
          score: score + roundScore, accuracy: finalAccuracy, bestStreak: Math.max(bestStreak, nextStreak), difficultyLevel: level
        });
        return;
      }
      const newLevel = nextDifficultyLevel(level, roundAccuracy);
      const nextUsed = new Set(usedIds).add(sequenceSet.id);
      const nextSequence = pickSequence(nextUsed);
      setUsedIds(nextUsed);
      setLevel(newLevel);
      setRound((r) => r + 1);
      setSequenceSet(nextSequence);
      setItems(shuffle(nextSequence.steps));
      setTimeLeft(LEVEL_CONFIG[newLevel].timeSec);
      setLocked(false);
    }, 1300);
  };

  return (
    <div className="page max-w-2xl">
      <GameHeader title={t('gameSequenceTitle')} level={level} progress={`${t('roundLabel')} ${round}/${TOTAL_ROUNDS}`} score={score} onExit={onBack} />

      <div className="text-center mb-8">
        <span className="eyebrow justify-center">{t(sequenceSet.titleKey)}</span>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: 'var(--ink-faint)' }}>{t(sequenceSet.promptKey)}</p>
        <p className="text-xs font-semibold mt-3" style={{ color: 'var(--ink-faint)' }}>{timeLeft}{t('secondsUnit')} {t('remainingLabel')} · {t('dragToReorderHint')}</p>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3" as="div">
        {items.map((item, idx) => {
          const isCorrectPos = locked && item.id === sequenceSet.steps[idx].id;
          const isWrongPos = locked && !isCorrectPos;
          return (
            <Reorder.Item
              key={item.id}
              value={item}
              drag={!locked}
              className="seq-card"
              style={isCorrectPos ? { borderColor: 'var(--jade)', background: 'var(--jade-soft)' } : isWrongPos ? { borderColor: 'var(--alert)', background: 'var(--alert-soft)' } : {}}
              whileDrag={{ scale: 1.03, boxShadow: 'var(--shadow-md)' }}
            >
              <GripVertical className="w-4 h-4 shrink-0" style={{ color: 'var(--ink-faint)' }} />
              <span className="font-mono text-xs shrink-0" style={{ color: 'var(--ink-faint)' }}>0{idx + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{t(item.labelKey)}</span>
                {config.showNotes && item.noteKey && !locked && <span className="text-xs block mt-0.5" style={{ color: 'var(--ink-faint)' }}>{t(item.noteKey)}</span>}
              </span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <div className="flex flex-col items-center gap-3 mt-8">
        <button type="button" onClick={checkOrder} disabled={locked} className="btn btn-ember">{t('checkOrderLabel')}</button>
        <FeedbackState state={feedback} correctText={t('perfectOrderFeedback')} incorrectText={t('cardsOutOfPlaceFeedback')} />
      </div>

      <p className="text-center text-xs font-semibold mt-8" style={{ color: 'var(--ink-faint)' }}>{t(difficultyLabelKey(level))} · {t('levelLabel')} {level}</p>
    </div>
  );
}
