import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MemoryPairsGame from '../games/MemoryPairsGame';
import FaceRelationGame from '../games/FaceRelationGame';
import TargetSelectGame from '../games/TargetSelectGame';
import OrientationGame from '../games/OrientationGame';
import { CognitiveEngine } from '../../services/cognitiveEngine';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { ArrowLeft, Award, RotateCcw, ArrowUpRight, Sparkles } from 'lucide-react';
import Magnetic from '../common/Magnetic';
import { pageTransition } from '../common/pageTransition';
import { useTranslation } from '../../hooks/useTranslation';
import confetti from 'canvas-confetti';

export default function GameShell({ stateName = 'Assam', onBack }) {
  const { t } = useTranslation();
  const [activeGameKey, setActiveGameKey] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const containerRef = useScrollReveal();

  const gameOptions = [
    { id: 'pairs', title: 'Bihu Memory Pairs', domain: 'Memory', icon: '🧠', desc: 'Match traditional Assamese crafts, Jaapi, Pepa & tea leaves.' },
    { id: 'face', title: 'Face & Relation Match', domain: 'Memory', icon: '👨‍👩‍👧', desc: 'Identify granddaughter Ananya, Priya & Rahul.' },
    { id: 'target', title: 'NER Craft Focus', domain: 'Attention', icon: '🎯', desc: 'Find target tea leaf among distracting items.' },
    { id: 'orientation', title: 'Date & Festival Orientation', domain: 'Orientation', icon: '🗓️', desc: 'Recognize Bihu seasons & tea garden times.' }
  ];

  const handleFinishGame = (sessionData) => {
    const score = CognitiveEngine.calculateSessionScore(sessionData.accuracy, sessionData.responseTimeSec, sessionData.mistakes);
    const rec = CognitiveEngine.getAdaptiveRecommendation(
      sessionData.domain.toLowerCase(), sessionData.accuracy, sessionData.responseTimeSec, sessionData.difficulty
    );
    setCompletedSession({ ...sessionData, score, date: new Date().toLocaleDateString() });
    setRecommendation(rec);
    try { confetti({ particleCount: 90, spread: 75, origin: { y: 0.5 }, colors: ['#E2703A', '#4FAE8E', '#F4EFE7'] }); } catch (e) {}
  };

  let content;

  if (completedSession) {
    content = (
      <div className="page max-w-2xl">
        <div className="panel-light p-9 sm:p-12 text-center space-y-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(79,174,142,0.15)', color: 'var(--jade-deep)' }}>
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="eyebrow eyebrow-jade justify-center">{t('sessionComplete')}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium mt-2">{completedSession.gameName}</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(23,20,15,0.55)' }}>{t('cognitiveDomain')}: {completedSession.domain}</p>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto" style={{ borderTop: '1px solid var(--paper-line)', borderBottom: '1px solid var(--paper-line)', padding: '1.5rem 0' }}>
            <div>
              <span className="figure-label" style={{ color: 'rgba(23,20,15,0.5)' }}>{t('accuracyLabel')}</span>
              <span className="figure-value" style={{ color: 'var(--jade-deep)' }}>{completedSession.accuracy}%</span>
            </div>
            <div>
              <span className="figure-label" style={{ color: 'rgba(23,20,15,0.5)' }}>{t('timeLabel')}</span>
              <span className="figure-value" style={{ color: 'var(--ember-deep)' }}>{completedSession.responseTimeSec}s</span>
            </div>
            <div>
              <span className="figure-label" style={{ color: 'rgba(23,20,15,0.5)' }}>{t('scoreLabel')}</span>
              <span className="figure-value" style={{ color: 'var(--paper-ink)' }}>{completedSession.score}</span>
            </div>
          </div>

          {recommendation && (
            <div className="text-left flex items-start gap-3" style={{ color: 'var(--paper-ink)' }}>
              <Sparkles className="w-4.5 h-4.5 shrink-0 mt-0.5" style={{ color: 'var(--ember-deep)' }} />
              <p className="text-sm leading-relaxed">
                <strong>{t('nextDifficulty')}: {recommendation.newLevel}.</strong> {recommendation.reason}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <button type="button" onClick={() => { setCompletedSession(null); setActiveGameKey(null); }} className="btn btn-line" style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-line)' }}>
              <RotateCcw className="w-4 h-4" /> {t('anotherGame')}
            </button>
            <button type="button" onClick={onBack} className="btn btn-on-light">{t('returnHome')}</button>
          </div>
        </div>
      </div>
    );
  } else if (activeGameKey === 'pairs') {
    content = <MemoryPairsGame stateName={stateName} difficulty="Medium" onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  } else if (activeGameKey === 'face') {
    content = <FaceRelationGame onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  } else if (activeGameKey === 'target') {
    content = <TargetSelectGame onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  } else if (activeGameKey === 'orientation') {
    content = <OrientationGame onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  } else {
    content = (
    <div ref={containerRef} className="page">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <span className="eyebrow">{t('cognitiveExercises')}</span>
          <h2 className="font-display text-4xl md:text-5xl font-medium mt-3 leading-[0.98]">{t('gameLibrary')}</h2>
        </div>
        <button type="button" onClick={onBack} className="btn btn-quiet shrink-0"><ArrowLeft className="w-4 h-4" /> {t('back')}</button>
      </div>

      <div className="index-list scroll-reveal">
        {gameOptions.map((g, idx) => (
          <button type="button" key={g.id} onClick={() => setActiveGameKey(g.id)} className="index-row">
            <span className="index-num">0{idx + 1}</span>
            <span className="index-icon">{g.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2.5">
                <span className="font-display text-xl md:text-2xl font-medium">{g.title}</span>
                <span className="pin hidden sm:inline" style={{ color: 'var(--ink-faint)' }}>· {g.domain}</span>
              </span>
              <span className="text-sm block mt-0.5" style={{ color: 'var(--ink-faint)' }}>{g.desc}</span>
            </span>
            <Magnetic strength={0.3}>
              <span className="index-arrow" style={{ opacity: 1, color: 'var(--ink)' }}><ArrowUpRight className="w-5 h-5" /></span>
            </Magnetic>
          </button>
        ))}
      </div>
    </div>
    );
  }

  const viewKey = completedSession ? 'done' : activeGameKey || 'library';

  return (
    <AnimatePresence mode="wait">
      <motion.div key={viewKey} {...pageTransition}>
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
