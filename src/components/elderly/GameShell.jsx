import React, { useState } from 'react';
import MemoryPairsGame from '../games/MemoryPairsGame';
import FaceRelationGame from '../games/FaceRelationGame';
import TargetSelectGame from '../games/TargetSelectGame';
import OrientationGame from '../games/OrientationGame';
import { CognitiveEngine } from '../../services/cognitiveEngine';
import { ArrowLeft, Brain, Sparkles, Award, RotateCcw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GameShell({ stateName = 'Assam', onBack }) {
  const [activeGameKey, setActiveGameKey] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const gameOptions = [
    { id: 'pairs', title: 'Bihu Memory Pairs', domain: 'Memory', icon: '🧠', desc: 'Match traditional Assamese crafts, Jaapi, Pepa & tea leaves.', level: 'Medium' },
    { id: 'face', title: 'Face & Relation Match', domain: 'Memory', icon: '👨‍👩‍👧', desc: 'Identify granddaughter Ananya, Priya & Rahul.', level: 'Medium' },
    { id: 'target', title: 'NER Craft Focus', domain: 'Attention', icon: '🎯', desc: 'Find target tea leaf among distracting items.', level: 'Medium' },
    { id: 'orientation', title: 'Date & Festival Orientation', domain: 'Orientation', icon: '🗓️', desc: 'Recognize Bihu seasons & tea garden times.', level: 'Easy' }
  ];

  const handleFinishGame = (sessionData) => {
    const score = CognitiveEngine.calculateSessionScore(sessionData.accuracy, sessionData.responseTimeSec, sessionData.mistakes);
    const rec = CognitiveEngine.getAdaptiveRecommendation(
      sessionData.domain.toLowerCase(),
      sessionData.accuracy,
      sessionData.responseTimeSec,
      sessionData.difficulty
    );

    const fullResult = {
      ...sessionData,
      score,
      date: new Date().toLocaleDateString()
    };

    setCompletedSession(fullResult);
    setRecommendation(rec);
    try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }); } catch (e) {}
  };

  if (completedSession) {
    return (
      <div className="max-w-3xl mx-auto p-4 animate-fade-in">
        <div className="glass-card p-8 border-2 border-teal-500/50 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 mx-auto">
            <Award className="w-12 h-12" />
          </div>

          <div>
            <span className="badge badge-teal mb-2">Session Completed</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">{completedSession.gameName}</h2>
            <p className="text-sm text-slate-300 font-medium">Domain: {completedSession.domain}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">ACCURACY</span>
              <span className="text-2xl font-black text-teal-400">{completedSession.accuracy}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">TIME</span>
              <span className="text-2xl font-black text-amber-400">{completedSession.responseTimeSec}s</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">AI SCORE</span>
              <span className="text-2xl font-black text-rose-400">{completedSession.score}</span>
            </div>
          </div>

          {recommendation && (
            <div className="bg-slate-900/90 border border-teal-500/40 p-5 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-400" /> AI Adaptive Recommendation:
              </div>
              <p className="text-slate-200 font-semibold text-base">
                Level Recommendation: <strong className="text-amber-300">{recommendation.newLevel}</strong>
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Rationale: {recommendation.reason}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={() => {
                setCompletedSession(null);
                setActiveGameKey(null);
              }}
              className="btn-secondary py-3.5 px-6 font-bold"
            >
              <RotateCcw className="w-5 h-5" /> Choose Another Game
            </button>
            <button onClick={onBack} className="btn-primary py-3.5 px-8 font-extrabold">
              Back to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeGameKey === 'pairs') {
    return <MemoryPairsGame stateName={stateName} difficulty="Medium" onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  }
  if (activeGameKey === 'face') {
    return <FaceRelationGame onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  }
  if (activeGameKey === 'target') {
    return <TargetSelectGame onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  }
  if (activeGameKey === 'orientation') {
    return <OrientationGame onFinishGame={handleFinishGame} onBack={() => setActiveGameKey(null)} />;
  }

  return (
    <div className="elder-games-hub animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="badge badge-teal mb-3">
            <Brain className="w-4 h-4" /> Short activities
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Games</h2>
          <p className="supporting-text text-lg mt-2 max-w-xl">
            Gentle cognitive activities to play at your own pace. Choose one card and tap Play.
          </p>
        </div>
        <button type="button" onClick={onBack} className="btn-secondary py-3 px-5 text-lg shrink-0">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>

      <button
        type="button"
        onClick={() => setActiveGameKey(gameOptions[0].id)}
        className="elder-game-featured"
      >
        <div className="elder-game-featured-icon" aria-hidden="true">{gameOptions[0].icon}</div>
        <div className="elder-game-featured-copy">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge badge-amber">Recommended</span>
            <span className="badge badge-teal">{gameOptions[0].domain}</span>
            <span className="badge badge-amber">Level: {gameOptions[0].level}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{gameOptions[0].title}</h3>
          <p className="supporting-text text-lg mt-2">{gameOptions[0].desc}</p>
        </div>
        <span className="btn-primary btn-gold py-3 px-7 text-xl pointer-events-none">
          <Play className="w-6 h-6" /> Play
        </span>
      </button>

      <div className="elder-games-grid">
        {gameOptions.slice(1).map((g) => (
          <button
            type="button"
            key={g.id}
            onClick={() => setActiveGameKey(g.id)}
            className="elder-game-card"
          >
            <div className="elder-game-card-icon" aria-hidden="true">{g.icon}</div>
            <div className="elder-game-card-copy">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-teal">{g.domain}</span>
                <span className="badge badge-amber">Level: {g.level}</span>
              </div>
              <h3 className="elderly-card-title">{g.title}</h3>
              <p className="elderly-card-subtitle">{g.desc}</p>
            </div>
            <span className="btn-primary py-3 px-6 text-lg pointer-events-none">
              <Play className="w-5 h-5" /> Play
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
