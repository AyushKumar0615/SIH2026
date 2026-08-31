import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const PAIRS = ['Jaapi', 'Pepa', 'Muga', 'Tea', 'Bihu', 'Tulsi'];

function shuffleCards() {
  return [...PAIRS, ...PAIRS]
    .map((label, idx) => ({ id: `${label}-${idx}`, label, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function MemoryPairsGame({ difficulty, onFinishGame, onBack }) {
  const [cards, setCards] = useState(() => shuffleCards());
  const [open, setOpen] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [moves, setMoves] = useState(0);
  const start = useMemo(() => Date.now(), []);

  const choose = (card) => {
    if (open.length === 2 || card.matched || open.includes(card.id)) return;
    const nextOpen = [...open, card.id];
    setOpen(nextOpen);

    if (nextOpen.length === 2) {
      setMoves((m) => m + 1);
      const selected = cards.filter((c) => nextOpen.includes(c.id));
      if (selected[0].label === selected[1].label) {
        const nextCards = cards.map((c) => (nextOpen.includes(c.id) ? { ...c, matched: true } : c));
        setCards(nextCards);
        setOpen([]);
        if (nextCards.every((c) => c.matched)) {
          const seconds = Math.max(4, Math.round((Date.now() - start) / 1000));
          onFinishGame({
            gameName: 'Bihu Memory Pairs', domain: 'Memory', difficulty,
            accuracy: Math.max(60, Math.round((PAIRS.length / Math.max(PAIRS.length, moves + 1 + mistakes)) * 100)),
            responseTimeSec: seconds, mistakes
          });
        }
      } else {
        setMistakes((m) => m + 1);
        window.setTimeout(() => setOpen([]), 750);
      }
    }
  };

  return (
    <div className="page max-w-2xl">
      <button type="button" onClick={onBack} className="btn btn-quiet !flex !px-0 mb-8"><ArrowLeft className="w-4 h-4" /> Game Library</button>

      <span className="eyebrow eyebrow-jade">Memory Domain</span>
      <h2 className="font-display text-3xl font-medium mt-2 mb-8">Match Familiar Assam Pairs</h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isOpen = open.includes(card.id) || card.matched;
          return (
            <button
              type="button" key={card.id} onClick={() => choose(card)}
              className="game-tile font-display text-base sm:text-lg font-medium flex items-center justify-center"
              style={isOpen ? { background: 'var(--jade)', color: '#0c1a15', borderColor: 'var(--jade)' } : {}}
            >
              {isOpen ? card.label : '?'}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm font-medium mt-8 pt-5" style={{ borderTop: '1px solid var(--hairline)', color: 'var(--ink-soft)' }}>
        <span>Moves: <strong style={{ color: 'var(--jade)' }}>{moves}</strong></span>
        <span>Mistakes: <strong style={{ color: 'var(--ember)' }}>{mistakes}</strong></span>
      </div>
    </div>
  );
}
