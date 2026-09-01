import React, { useState } from 'react';
import { AudioService } from '../../services/audioService';
import { ArrowLeft, Compass } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function OrientationGame({ onFinishGame, onBack }) {
  const { t } = useTranslation();
  const questions = [
    { id: 'q1', question: 'Which season is celebrated during Rongali Bihu in Assam?', options: ['Spring / New Year (Bohag)', 'Winter Peak', 'Monsoon Rain'], answer: 'Spring / New Year (Bohag)', hint: 'It takes place in mid-April when new leaves bloom' },
    { id: 'q2', question: 'What time of day is tea typically enjoyed in Assamese households?', options: ['Morning & Evening', 'Midnight', 'Only late night'], answer: 'Morning & Evening', hint: 'Served hot at 8:00 AM and 4:30 PM' },
    { id: 'q3', question: 'Where is the famous one-horned rhino wildlife sanctuary located?', options: ['Kaziranga National Park (Assam)', 'Thar Desert', 'Goa Beach'], answer: 'Kaziranga National Park (Assam)', hint: 'Located along the Brahmaputra River in Assam' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const currentQ = questions[currentIndex];

  const handleSelect = (opt) => {
    if (opt === currentQ.answer) {
      AudioService.playChime('success');
      AudioService.speak('Excellent orientation answer!', 'en');
      setScore((s) => s + 1);
    }
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      const durationSec = Math.max(8, Math.round((Date.now() - startTime) / 1000));
      onFinishGame({
        gameName: 'Date & Festival Orientation', domain: 'Orientation',
        accuracy: Math.round(((score + (opt === currentQ.answer ? 1 : 0)) / questions.length) * 100),
        responseTimeSec: durationSec, mistakes: questions.length - (score + (opt === currentQ.answer ? 1 : 0)), difficulty: 'Easy'
      });
    }
  };

  return (
    <div className="page max-w-2xl">
      <div className="flex items-center justify-between gap-4 mb-8">
        <button type="button" onClick={onBack} className="btn btn-quiet !px-0"><ArrowLeft className="w-4 h-4" /> {t('quit')}</button>
        <span className="eyebrow">{t('questionLabel')} {currentIndex + 1} {t('ofLabel')} {questions.length}</span>
      </div>

      <div className="text-center space-y-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--ember-soft)', color: 'var(--ember)' }}>
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-medium leading-tight">{currentQ.question}</h3>
        <p className="pin max-w-md mx-auto">{t('hintPrefix')}: {currentQ.hint}</p>

        <div className="index-list text-left pt-4">
          {currentQ.options.map((opt) => (
            <button type="button" key={opt} onClick={() => handleSelect(opt)} className="index-row justify-between">
              <span className="font-medium">{opt}</span>
              <span className="text-xs font-semibold opacity-0 hover:opacity-100 transition-opacity" style={{ color: 'var(--jade)' }}>{t('selectAction')} →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
