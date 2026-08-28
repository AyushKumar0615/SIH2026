import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const items = ['Tea leaf', 'Jaapi', 'Bamboo', 'Muga', 'Pepa', 'Tea leaf', 'Tulsi', 'Tea leaf', 'Bihu', 'Rice'];

export default function TargetSelectGame({ onFinishGame, onBack }) {
  const [selected, setSelected] = useState([]);
  const start = useMemo(() => Date.now(), []);
  const targets = items.filter((item) => item === 'Tea leaf').length;

  const toggle = (idx) => {
    setSelected(selected.includes(idx) ? selected.filter((id) => id !== idx) : [...selected, idx]);
  };

  const finish = () => {
    const correct = selected.filter((idx) => items[idx] === 'Tea leaf').length;
    const mistakes = selected.length - correct + (targets - correct);
    onFinishGame({
      gameName: 'NER Craft Focus',
      domain: 'Attention',
      difficulty: 'Medium',
      accuracy: Math.max(0, Math.round(((items.length - mistakes) / items.length) * 100)),
      responseTimeSec: Math.max(5, Math.round((Date.now() - start) / 1000)),
      mistakes
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 animate-fade-in">
      <button onClick={onBack} className="btn-secondary px-4 py-2"><ArrowLeft className="w-5 h-5" /> Game Library</button>
      <div className="glass-card p-6 border-2 border-teal-500/40">
        <span className="badge badge-teal">Attention domain</span>
        <h2 className="text-3xl font-black text-white mt-2">Find every Tea leaf</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map((item, idx) => (
          <button
            key={`${item}-${idx}`}
            onClick={() => toggle(idx)}
            className={`game-tile rounded-2xl border-2 p-3 text-lg font-black ${selected.includes(idx) ? 'bg-amber-400 text-slate-950 border-amber-100' : 'bg-slate-900 border-slate-700 text-slate-200'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <button onClick={finish} className="btn-primary px-7 py-4 text-lg">Finish focus task</button>
    </div>
  );
}
