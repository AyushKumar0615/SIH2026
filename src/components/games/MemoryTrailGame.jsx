import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CULTURAL_ITEMS, difficultyLabelKey } from '../../data/culturalContent';
import { computeRoundScore, computeAccuracy, nextDifficultyLevel } from '../../services/gameScoring';
import GameHeader from './shared/GameHeader';
import ProgressBar from './shared/ProgressBar';
import FeedbackState from './shared/FeedbackState';
import { useTranslation } from '../../hooks/useTranslation';

const TOTAL_ROUNDS = 3;
const LEVEL_CONFIG = {
  1: { length: 4, studySec: 6 },
  2: { length: 5, studySec: 5 },
  3: { length: 6, studySec: 5 },
  4: { length: 7, studySec: 4 },
  5: { length: 8, studySec: 4 }
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickSequence(length) {
  return shuffle(CULTURAL_ITEMS).slice(0, length);
}

export default function MemoryTrailGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('study'); // study | recall | feedback
  const [studyLeft, setStudyLeft] = useState(LEVEL_CONFIG[1].studySec);
  const [sequence, setSequence] = useState(() => pickSequence(LEVEL_CONFIG[1].length));
  const [pool, setPool] = useState(() => shuffle(sequence));
  const [placed, setPlaced] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [accuracySum, setAccuracySum] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const startedAt = useMemo(() => Date.now(), [round]);

  React.useEffect(() => {
    if (phase !== 'study') return;
    if (studyLeft <= 0) { setPhase('recall'); return; }
    const id = window.setTimeout(() => setStudyLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, studyLeft]);

  const config = LEVEL_CONFIG[level];

  const choosePoolItem = (item) => {
    if (placed.length >= sequence.length) return;
    setPlaced((p) => [...p, item]);
    setPool((p) => p.filter((i) => i.id !== item.id));
  };

  const undoLast = () => {
    if (placed.length === 0) return;
    const last = placed[placed.length - 1];
    setPlaced((p) => p.slice(0, -1));
    setPool((p) => [...p, last]);
  };

  const checkAnswer = () => {
    const correctCount = placed.filter((item, idx) => item.id === sequence[idx].id).length;
    const roundAccuracy = computeAccuracy(correctCount, sequence.length);
    const isRoundCorrect = roundAccuracy === 100;
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);
    const nextStreak = isRoundCorrect ? streak + 1 : 0;
    const roundScore = computeRoundScore({ correct: isRoundCorrect, difficultyLevel: level, timeTakenSec: timeTaken, timeLimitSec: config.studySec * 3, streak: nextStreak });

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
          gameNameKey: 'gameTrailTitle', domain: 'Memory', skillKey: 'gameTrailResultSkill',
          score: score + roundScore, accuracy: finalAccuracy, bestStreak: Math.max(bestStreak, nextStreak), difficultyLevel: level
        });
        return;
      }
      const newLevel = nextDifficultyLevel(level, roundAccuracy);
      const nextConfig = LEVEL_CONFIG[newLevel];
      setLevel(newLevel);
      setRound((r) => r + 1);
      const nextSeq = pickSequence(nextConfig.length);
      setSequence(nextSeq);
      setPool(shuffle(nextSeq));
      setPlaced([]);
      setStudyLeft(nextConfig.studySec);
      setPhase('study');
    }, 1100);
  };

  return (
    <div className="page max-w-2xl">
      <GameHeader title={t('gameTrailTitle')} level={level} progress={`${t('roundLabel')} ${round}/${TOTAL_ROUNDS}`} score={score} onExit={onBack} />

      {phase === 'study' && (
        <div className="space-y-6">
          <div className="text-center">
            <span className="eyebrow eyebrow-jade justify-center">{t('trailStudyEyebrow')}</span>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>{t('trailStudyHintPrefix')} {studyLeft}{t('secondsUnit')}</p>
          </div>
          <ProgressBar value={(studyLeft / config.studySec) * 100} />
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {sequence.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="cog-slot"
                style={{ width: '5.5rem' }}
              >
                <span className="cog-slot-icon">{item.icon}</span>
                <span className="cog-slot-label">{t(item.nameKey)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(phase === 'recall' || phase === 'feedback') && (
        <div className="space-y-8">
          <div className="text-center">
            <span className="eyebrow justify-center">{t('trailRecallEyebrow')}</span>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>{t('trailRecallHint')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {sequence.map((_, idx) => {
              const item = placed[idx];
              const showResult = phase === 'feedback';
              const isCorrect = item && sequence[idx].id === item.id;
              return (
                <div
                  key={idx}
                  className={`cog-slot ${!item ? 'is-empty' : ''} ${showResult && item ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}`}
                  style={{ width: '5.5rem' }}
                >
                  {item ? (
                    <>
                      <span className="cog-slot-icon">{item.icon}</span>
                      <span className="cog-slot-label">{t(item.nameKey)}</span>
                    </>
                  ) : (
                    <span className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
            {pool.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={phase === 'feedback'}
                onClick={() => choosePoolItem(item)}
                className="cog-slot is-selectable"
                style={{ width: '5.5rem' }}
              >
                <span className="cog-slot-icon">{item.icon}</span>
                <span className="cog-slot-label">{t(item.nameKey)}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={undoLast} disabled={phase === 'feedback' || placed.length === 0} className="btn btn-line">{t('undoLabel')}</button>
            <button type="button" onClick={checkAnswer} disabled={phase === 'feedback' || placed.length < sequence.length} className="btn btn-ember">{t('checkSequenceLabel')}</button>
          </div>

          <div className="flex justify-center"><FeedbackState state={feedback} correctText={t('sequenceCorrectFeedback')} incorrectText={t('notQuiteFeedback')} /></div>
        </div>
      )}

      <p className="text-center text-xs font-semibold mt-8" style={{ color: 'var(--ink-faint)' }}>{t(difficultyLabelKey(level))} · {t('levelLabel')} {level}</p>
    </div>
  );
}
