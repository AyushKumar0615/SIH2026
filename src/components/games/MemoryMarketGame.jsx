import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MARKET_ITEMS, difficultyLabel } from '../../data/culturalContent';
import { computeRoundScore, nextDifficultyLevel } from '../../services/gameScoring';
import GameHeader from './shared/GameHeader';
import ProgressBar from './shared/ProgressBar';
import FeedbackState from './shared/FeedbackState';

const TOTAL_ROUNDS = 3;
const LEVEL_CONFIG = {
  1: { slotCount: 6, itemCount: 5, viewSec: 6, changeCount: 1 },
  2: { slotCount: 8, itemCount: 6, viewSec: 5, changeCount: 1 },
  3: { slotCount: 9, itemCount: 7, viewSec: 5, changeCount: 2 },
  4: { slotCount: 12, itemCount: 8, viewSec: 4, changeCount: 2 },
  5: { slotCount: 12, itemCount: 9, viewSec: 4, changeCount: 3 }
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildRound(config) {
  const chosen = shuffle(MARKET_ITEMS).slice(0, config.itemCount);
  const positions = shuffle([...Array(config.slotCount).keys()]).slice(0, config.itemCount);
  const before = Array(config.slotCount).fill(null);
  positions.forEach((pos, i) => { before[pos] = chosen[i]; });

  const after = [...before];
  const changeLog = [];
  const usedIds = new Set(chosen.map((i) => i.id));

  for (let n = 0; n < config.changeCount; n++) {
    const occupied = after.map((v, i) => (v ? i : -1)).filter((i) => i !== -1);
    const empty = after.map((v, i) => (v ? -1 : i)).filter((i) => i !== -1);
    const roll = Math.random();

    if (roll < 0.34 && occupied.length > 2) {
      const idx = occupied[Math.floor(Math.random() * occupied.length)];
      const item = after[idx];
      after[idx] = null;
      changeLog.push({ type: 'removed', itemName: item.name });
    } else if (roll < 0.67 && empty.length > 0) {
      const unused = MARKET_ITEMS.filter((i) => !usedIds.has(i.id));
      if (unused.length > 0) {
        const item = shuffle(unused)[0];
        usedIds.add(item.id);
        const idx = empty[Math.floor(Math.random() * empty.length)];
        after[idx] = item;
        changeLog.push({ type: 'added', itemName: item.name });
      }
    } else if (occupied.length > 0 && empty.length > 0) {
      const fromIdx = occupied[Math.floor(Math.random() * occupied.length)];
      const toIdx = empty[Math.floor(Math.random() * empty.length)];
      const item = after[fromIdx];
      after[toIdx] = item;
      after[fromIdx] = null;
      changeLog.push({ type: 'moved', itemName: item.name });
    }
  }

  if (changeLog.length === 0) {
    const idx = before.findIndex((v) => v);
    if (idx !== -1) { after[idx] = null; changeLog.push({ type: 'removed', itemName: before[idx].name }); }
  }

  const target = changeLog[Math.floor(Math.random() * changeLog.length)];
  const question = target.type === 'removed' ? 'Which item disappeared from the market?'
    : target.type === 'added' ? 'Which item is new to the market?'
    : 'Which item changed position in the market?';

  const distractorPool = shuffle([...new Set([...chosen.map((i) => i.name), ...MARKET_ITEMS.map((i) => i.name)])].filter((n) => n !== target.itemName));
  const options = shuffle([target.itemName, ...distractorPool.slice(0, 3)]);

  return { before, after, question, correctAnswer: target.itemName, options, slotCount: config.slotCount };
}

export default function MemoryMarketGame({ onFinishGame, onBack }) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('view'); // view | transition | recall | feedback
  const [roundData, setRoundData] = useState(() => buildRound(LEVEL_CONFIG[1]));
  const [viewLeft, setViewLeft] = useState(LEVEL_CONFIG[1].viewSec);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [accuracySum, setAccuracySum] = useState(0);
  const startedAt = useMemo(() => Date.now(), [round]);

  const config = LEVEL_CONFIG[level];

  React.useEffect(() => {
    if (phase !== 'view') return;
    if (viewLeft <= 0) { setPhase('transition'); window.setTimeout(() => setPhase('recall'), 700); return; }
    const id = window.setTimeout(() => setViewLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, viewLeft]);

  const selectAnswer = (option) => {
    if (phase !== 'recall') return;
    setChosenAnswer(option);
    const isCorrect = option === roundData.correctAnswer;
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const roundScore = computeRoundScore({ correct: isCorrect, difficultyLevel: level, timeTakenSec: timeTaken, timeLimitSec: config.viewSec * 4, streak: nextStreak });
    const roundAccuracy = isCorrect ? 100 : 0;

    setScore((s) => s + roundScore);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setAccuracySum((a) => a + roundAccuracy);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setPhase('feedback');

    window.setTimeout(() => {
      setFeedback(null);
      setChosenAnswer(null);
      if (round >= TOTAL_ROUNDS) {
        const finalAccuracy = Math.round((accuracySum + roundAccuracy) / TOTAL_ROUNDS);
        onFinishGame({
          gameName: 'Memory Market', domain: 'Memory', skill: 'Visual memory & change detection',
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
      setPhase('view');
    }, 1300);
  };

  const scene = phase === 'view' ? roundData.before : roundData.after;
  const cols = roundData.slotCount <= 6 ? 3 : 4;

  return (
    <div className="page max-w-2xl">
      <GameHeader title="Memory Market" level={level} progress={`Round ${round}/${TOTAL_ROUNDS}`} score={score} onExit={onBack} />

      {phase === 'view' && (
        <div className="text-center mb-4">
          <span className="eyebrow eyebrow-jade justify-center">Observe the market</span>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>Remember every stall — the market changes in {viewLeft}s</p>
        </div>
      )}
      {phase === 'transition' && (
        <div className="text-center mb-4"><span className="eyebrow justify-center">The market is changing…</span></div>
      )}
      {(phase === 'recall' || phase === 'feedback') && (
        <div className="text-center mb-4">
          <span className="eyebrow justify-center">What changed?</span>
          <h3 className="font-display text-xl sm:text-2xl font-medium mt-2">{roundData.question}</h3>
        </div>
      )}

      {phase === 'view' && <ProgressBar value={(viewLeft / config.viewSec) * 100} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={phase === 'transition' ? 'blank' : phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'transition' ? 0.15 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`grid gap-3 mt-6 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}
        >
          {scene.map((item, idx) => (
            <div key={idx} className={`cog-slot ${!item ? 'is-empty' : ''}`}>
              {item ? (<><span className="cog-slot-icon">{item.icon}</span><span className="cog-slot-label">{item.name}</span></>) : null}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {(phase === 'recall' || phase === 'feedback') && (
        <div className="grid grid-cols-2 gap-3 mt-8">
          {roundData.options.map((opt) => {
            const isChosen = chosenAnswer === opt;
            const showResult = phase === 'feedback';
            const isCorrectOpt = opt === roundData.correctAnswer;
            let style = { color: 'var(--ink)', borderColor: 'var(--hairline-strong)' };
            if (showResult && isCorrectOpt) style = { color: 'var(--jade-deep)', borderColor: 'var(--jade)', background: 'var(--jade-soft)' };
            else if (showResult && isChosen) style = { color: 'var(--alert)', borderColor: 'var(--alert)', background: 'var(--alert-soft)' };
            else if (isChosen) style = { color: 'var(--ember)', borderColor: 'var(--ember)', background: 'var(--ember-soft)' };
            return (
              <button key={opt} type="button" disabled={phase === 'feedback'} onClick={() => selectAnswer(opt)} className="btn btn-line justify-start" style={style}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-center mt-6"><FeedbackState state={feedback} correctText="Correct!" incorrectText={`It was ${roundData.correctAnswer}`} /></div>

      <p className="text-center text-xs font-semibold mt-8" style={{ color: 'var(--ink-faint)' }}>{difficultyLabel(level)} · Level {level}</p>
    </div>
  );
}
