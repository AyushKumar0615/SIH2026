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
        const nextCards = cards.map((c) => nextOpen.includes(c.id) ? { ...c, matched: true } : c);
        setCards(nextCards);
        setOpen([]);
        if (nextCards.every((c) => c.matched)) {
          const seconds = Math.max(4, Math.round((Date.now() - start) / 1000));
          onFinishGame({
            gameName: 'Bihu Memory Pairs',
            domain: 'Memory',
            difficulty,
            accuracy: Math.max(60, Math.round((PAIRS.length / Math.max(PAIRS.length, moves + 1 + mistakes)) * 100)),
            responseTimeSec: seconds,
            mistakes
          });
        }
      } else {
        setMistakes((m) => m + 1);
        window.setTimeout(() => setOpen([]), 750);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 animate-fade-in">
      <button onClick={onBack} className="btn-secondary px-4 py-2"><ArrowLeft className="w-5 h-5" /> Game Library</button>
      <div className="glass-card p-6 border-2 border-teal-500/40">
        <span className="badge badge-teal">Memory domain</span>
        <h2 className="text-3xl font-black text-white mt-2">Match the familiar Assam pairs</h2>
        <p className="text-slate-300 font-medium">Tap two tiles. Matched familiar objects stay open.</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isOpen = open.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => choose(card)}
              className={`game-tile rounded-2xl border-2 text-xl sm:text-2xl font-black transition-all ${
                isOpen ? 'bg-teal-500 text-slate-950 border-teal-200' : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {isOpen ? card.label : '?'}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-slate-400 font-bold">Moves: {moves} | Mistakes: {mistakes}</p>
    </div>
  );
}
