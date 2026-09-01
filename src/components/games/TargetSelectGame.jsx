import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const items = ['Tea leaf', 'Jaapi', 'Bamboo', 'Muga', 'Pepa', 'Tea leaf', 'Tulsi', 'Tea leaf', 'Bihu', 'Rice'];

export default function TargetSelectGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
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
      gameName: 'NER Craft Focus', domain: 'Attention', difficulty: 'Medium',
      accuracy: Math.max(0, Math.round(((items.length - mistakes) / items.length) * 100)),
      responseTimeSec: Math.max(5, Math.round((Date.now() - start) / 1000)), mistakes
    });
  };

  return (
    <div className="page max-w-2xl">
      <button type="button" onClick={onBack} className="btn btn-quiet !flex !px-0 mb-8"><ArrowLeft className="w-4 h-4" /> {t('gameLibrary')}</button>

      <span className="eyebrow">{t('attentionDomain')}</span>
      <h2 className="font-display text-3xl font-medium mt-2 mb-8">Find Every "Tea Leaf"</h2>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map((item, idx) => (
          <button
            type="button" key={`${item}-${idx}`} onClick={() => toggle(idx)}
            className="game-tile p-3 text-sm font-medium flex items-center justify-center"
            style={selected.includes(idx) ? { background: 'var(--ember)', color: '#1a0f08', borderColor: 'var(--ember)' } : {}}
          >
            {item}
          </button>
        ))}
      </div>

      <button type="button" onClick={finish} className="btn btn-ember w-full mt-8">{t('finishFocusTask')}</button>
    </div>
  );
}
