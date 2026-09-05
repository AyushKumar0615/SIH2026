import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MemoryTrailGame from '../games/MemoryTrailGame';
import CulturalGridGame from '../games/CulturalGridGame';
import MemoryMarketGame from '../games/MemoryMarketGame';
import HeritageSequenceGame from '../games/HeritageSequenceGame';
import WhatChangedGame from '../games/WhatChangedGame';
import GameIntro from '../games/shared/GameIntro';
import GameResult from '../games/shared/GameResult';
import CategoryFilter from '../games/shared/CategoryFilter';
import GameCard, { FeaturedGameCard } from '../games/shared/GameCard';
import { pageTransition } from '../common/pageTransition';
import { useTranslation } from '../../hooks/useTranslation';
import confetti from 'canvas-confetti';

const GAME_DEFS = [
  {
    id: 'trail', title: 'Memory Trail', category: 'Memory', icon: '🛤️',
    skill: 'Working memory', difficultyText: 'Adaptive · 5 levels', estimatedMinutes: 5,
    description: 'Study a trail of Indian cultural landmarks, art forms and festivals, then recreate the sequence from memory.',
    howItWorks: [
      'Watch a short trail of cultural cards appear in sequence.',
      'When the trail disappears, rebuild it by tapping the cards in order.',
      'Sequences grow longer as you improve.'
    ],
    Component: MemoryTrailGame
  },
  {
    id: 'grid', title: 'Cultural Grid', category: 'Attention', icon: '🔎',
    skill: 'Selective attention', difficultyText: 'Adaptive · 5 levels', estimatedMinutes: 4,
    description: "Scan a grid of cultural objects and quickly spot the ones that match the instruction, before time runs out.",
    howItWorks: [
      'Read the instruction at the top of the grid.',
      'Tap every card that matches it, then submit before the timer ends.',
      'Grids get larger and distractors more similar as you progress.'
    ],
    Component: CulturalGridGame
  },
  {
    id: 'market', title: 'Memory Market', category: 'Memory', icon: '🛍️',
    skill: 'Visual & spatial memory', difficultyText: 'Adaptive · 5 levels', estimatedMinutes: 5,
    description: "Browse a bustling Indian marketplace, then recall exactly what changed after it's rearranged.",
    howItWorks: [
      'Observe every stall in the market for a few seconds.',
      'The market changes — an item may vanish, move, or appear.',
      'Answer what changed from the options shown.'
    ],
    Component: MemoryMarketGame
  },
  {
    id: 'sequence', title: 'Heritage Sequence', category: 'Orientation', icon: '📜',
    skill: 'Sequencing & reasoning', difficultyText: 'Adaptive · 5 levels', estimatedMinutes: 5,
    description: 'Drag cultural events, festivals and craft traditions into their correct order.',
    howItWorks: [
      'Read the prompt describing what needs ordering.',
      'Drag the cards up or down until they are in the right order.',
      'Submit your order to see how many are correctly placed.'
    ],
    Component: HeritageSequenceGame
  },
  {
    id: 'changed', title: 'What Changed?', category: 'Attention', icon: '👁️',
    skill: 'Attention & change detection', difficultyText: 'Adaptive · 5 levels', estimatedMinutes: 4,
    description: "Study a cultural scene, then spot every detail that changes when you look again.",
    howItWorks: [
      'Study the scene carefully for a few seconds.',
      'The scene changes — items may move, disappear or appear.',
      'Tap every position that looks different from before.'
    ],
    Component: WhatChangedGame
  }
];

export default function GameShell({ onBack }) {
  const { t } = useTranslation();
  const [view, setView] = useState('library'); // library | intro | playing | result
  const [activeGameId, setActiveGameId] = useState(null);
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...new Set(GAME_DEFS.map((g) => g.category))];
  const visibleGames = activeCategory === 'all' ? GAME_DEFS : GAME_DEFS.filter((g) => g.category === activeCategory);
  const featured = visibleGames[0];
  const restGames = visibleGames.slice(1);
  const activeGame = GAME_DEFS.find((g) => g.id === activeGameId);

  const openIntro = (game) => { setActiveGameId(game.id); setView('intro'); };
  const startGame = () => setView('playing');
  const exitToLibrary = () => { setActiveGameId(null); setResult(null); setView('library'); };

  const handleFinishGame = (sessionData) => {
    setResult(sessionData);
    setView('result');
    try { confetti({ particleCount: 90, spread: 75, origin: { y: 0.5 }, colors: ['#E2703A', '#4FAE8E', '#F4EFE7'] }); } catch (e) {}
  };

  let content;

  if (view === 'result' && result) {
    content = (
      <GameResult
        gameName={result.gameName}
        skill={result.skill}
        score={result.score}
        accuracy={result.accuracy}
        bestStreak={result.bestStreak}
        difficultyLevel={result.difficultyLevel}
        onPlayAgain={() => setView('intro')}
        onBackToGames={exitToLibrary}
      />
    );
  } else if (view === 'intro' && activeGame) {
    content = (
      <GameIntro
        gameId={activeGame.id}
        icon={activeGame.icon}
        title={activeGame.title}
        skill={activeGame.skill}
        howItWorks={activeGame.howItWorks}
        difficultyText={activeGame.difficultyText}
        estimatedMinutes={activeGame.estimatedMinutes}
        onStart={startGame}
        onBack={exitToLibrary}
      />
    );
  } else if (view === 'playing' && activeGame) {
    const GameComponent = activeGame.Component;
    content = <GameComponent onFinishGame={handleFinishGame} onBack={exitToLibrary} />;
  } else {
    content = (
      <div className="page">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-10">
            <div>
              <span className="eyebrow">{t('cognitiveExercises')}</span>
              <h2 className="font-display text-4xl md:text-5xl font-medium mt-3 leading-[0.98] max-w-xl">{t('gameLibraryHeading')}</h2>
              <p className="text-sm mt-3 max-w-md" style={{ color: 'var(--ink-faint)' }}>{t('gameLibrarySubtext')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:justify-end shrink-0">
              <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
              <button type="button" onClick={onBack} className="btn btn-quiet shrink-0">{t('back')}</button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {featured && (
              <div className="mb-10">
                <FeaturedGameCard game={featured} onPlay={openIntro} />
              </div>
            )}

            {restGames.length > 0 && (
              <div>
                <span className="eyebrow">{t('exploreExercisesLabel')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {restGames.map((game, idx) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + idx * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <GameCard game={{ ...game, number: idx + 2 }} onPlay={openIntro} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const viewKey = view === 'library' ? 'library' : `${view}-${activeGameId}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={viewKey} {...pageTransition}>
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
