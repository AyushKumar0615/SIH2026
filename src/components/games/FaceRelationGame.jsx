import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const people = [
  { name: 'Ananya', relation: 'Granddaughter', hint: 'Studies Computer Science at Cotton University' },
  { name: 'Priya Devi', relation: 'Daughter', hint: 'Calls after lunch and brings tea' },
  { name: 'Rahul', relation: 'Son-in-law', hint: 'Brings medicines from Guwahati' }
];

export default function FaceRelationGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const finish = () => {
    const correct = people.filter((p) => answers[p.name] === p.relation).length;
    setSubmitted(true);
    onFinishGame({
      gameName: 'Face & Relation Match', domain: 'Memory', difficulty: 'Medium',
      accuracy: Math.round((correct / people.length) * 100), responseTimeSec: 6, mistakes: people.length - correct
    });
  };

  return (
    <div className="page max-w-2xl">
      <button type="button" onClick={onBack} className="btn btn-quiet !flex !px-0 mb-8"><ArrowLeft className="w-4 h-4" /> {t('gameLibrary')}</button>

      <span className="eyebrow">{t('familyRecall')}</span>
      <h2 className="font-display text-3xl font-medium mt-2 mb-8">Who is this family member?</h2>

      <div className="index-list">
        {people.map((person) => (
          <div key={person.name} className="index-row !cursor-default grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-center">
            <span className="min-w-0">
              <span className="font-display text-xl font-medium block">{person.name}</span>
              <span className="text-sm block mt-0.5" style={{ color: 'var(--ink-faint)' }}>{person.hint}</span>
            </span>
            <select value={answers[person.name] || ''} onChange={(e) => setAnswers({ ...answers, [person.name]: e.target.value })} className="select">
              <option value="">{t('chooseRelationPlaceholder')}</option>
              <option value="Daughter">{t('relationDaughter')}</option>
              <option value="Granddaughter">{t('relationGranddaughter')}</option>
              <option value="Son-in-law">{t('relationSonInLaw')}</option>
            </select>
          </div>
        ))}
      </div>

      <button type="button" disabled={submitted} onClick={finish} className="btn btn-ember w-full mt-8">{t('completeFamilyMatch')}</button>
    </div>
  );
}
