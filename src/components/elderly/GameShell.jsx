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
    id: 'trail', titleKey: 'gameTrailTitle', category: 'Memory', icon: '🛤️',
    skillKey: 'gameTrailSkill', estimatedMinutes: 5,
    descriptionKey: 'gameTrailDesc',
    howItWorksKeys: ['gameTrailHow1', 'gameTrailHow2', 'gameTrailHow3'],
    Component: MemoryTrailGame
  },
  {
    id: 'grid', titleKey: 'gameGridTitle', category: 'Attention', icon: '🔎',
    skillKey: 'gameGridSkill', estimatedMinutes: 4,
    descriptionKey: 'gameGridDesc',
    howItWorksKeys: ['gameGridHow1', 'gameGridHow2', 'gameGridHow3'],
    Component: CulturalGridGame
  },
  {
    id: 'market', titleKey: 'gameMarketTitle', category: 'Memory', icon: '🛍️',
    skillKey: 'gameMarketSkill', estimatedMinutes: 5,
    descriptionKey: 'gameMarketDesc',
    howItWorksKeys: ['gameMarketHow1', 'gameMarketHow2', 'gameMarketHow3'],
    Component: MemoryMarketGame
  },
  {
    id: 'sequence', titleKey: 'gameSequenceTitle', category: 'Orientation', icon: '📜',
    skillKey: 'gameSequenceSkill', estimatedMinutes: 5,
    descriptionKey: 'gameSequenceDesc',
    howItWorksKeys: ['gameSequenceHow1', 'gameSequenceHow2', 'gameSequenceHow3'],
    Component: HeritageSequenceGame
  },
  {
    id: 'changed', titleKey: 'gameChangedTitle', category: 'Attention', icon: '👁️',
    skillKey: 'gameChangedSkill', estimatedMinutes: 4,
    descriptionKey: 'gameChangedDesc',
    howItWorksKeys: ['gameChangedHow1', 'gameChangedHow2', 'gameChangedHow3'],
    Component: WhatChangedGame
  }
];

const CATEGORY_LABEL_KEYS = {
  Memory: 'gameCategoryMemory',
  Attention: 'gameCategoryAttention',
  Orientation: 'gameCategoryOrientation'
};

export default function GameShell({ onBack }) {
  const { t } = useTranslation();
  const [view, setView] = useState('library'); // library | intro | playing | result
  const [activeGameId, setActiveGameId] = useState(null);
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const translatedGames = GAME_DEFS.map((g) => ({
    ...g,
    title: t(g.titleKey),
    skill: t(g.skillKey),
    description: t(g.descriptionKey),
    difficultyText: t('adaptiveDifficultyText'),
    howItWorks: g.howItWorksKeys.map((k) => t(k)),
    categoryLabel: t(CATEGORY_LABEL_KEYS[g.category])
  }));

  const categories = ['all', ...new Set(GAME_DEFS.map((g) => g.category))];
  const visibleGames = activeCategory === 'all' ? translatedGames : translatedGames.filter((g) => g.category === activeCategory);
  const featured = visibleGames[0];
  const restGames = visibleGames.slice(1);
  const activeGame = translatedGames.find((g) => g.id === activeGameId);

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
        gameName={t(result.gameNameKey)}
        skill={t(result.skillKey)}
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
