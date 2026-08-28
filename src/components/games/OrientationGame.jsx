import React, { useState } from 'react';
import { AudioService } from '../../services/audioService';
import { ArrowLeft, Compass } from 'lucide-react';

export default function OrientationGame({ onFinishGame, onBack }) {
  const questions = [
    {
      id: 'q1',
      question: 'Which season is celebrated during Rongali Bihu in Assam?',
      options: ['Spring / New Year (Bohag)', 'Winter Peak', 'Monsoon Rain'],
      answer: 'Spring / New Year (Bohag)',
      hint: 'It takes place in mid-April when new leaves bloom'
    },
    {
      id: 'q2',
      question: 'What time of day is tea typically enjoyed in Assamese households?',
      options: ['Morning & Evening', 'Midnight', 'Only late night'],
      answer: 'Morning & Evening',
      hint: 'Served hot at 8:00 AM and 4:30 PM'
    },
    {
      id: 'q3',
      question: 'Where is the famous one-horned rhino wildlife sanctuary located?',
      options: ['Kaziranga National Park (Assam)', 'Thar Desert', 'Goa Beach'],
      answer: 'Kaziranga National Park (Assam)',
      hint: 'Located along the Brahmaputra River in Assam'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQ = questions[currentIndex];

  const handleSelect = (opt) => {
    if (opt === currentQ.answer) {
      AudioService.playChime('success');
      AudioService.speak('Excellent orientation answer!', 'en');
      setScore(s => s + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
    } else {
      const durationSec = Math.max(8, Math.round((Date.now() - startTime) / 1000));
      onFinishGame({
        gameName: 'Date & Festival Orientation',
        domain: 'Orientation',
        accuracy: Math.round(((score + (opt === currentQ.answer ? 1 : 0)) / questions.length) * 100),
        responseTimeSec: durationSec,
        mistakes: questions.length - (score + (opt === currentQ.answer ? 1 : 0)),
        difficulty: 'Easy'
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="btn-secondary py-2 px-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Quit Game
        </button>
        <div className="text-right">
          <span className="badge badge-amber mb-1">Question {currentIndex + 1} of {questions.length}</span>
          <h2 className="text-2xl font-extrabold text-white">🗓️ Day & Festival Orientation</h2>
        </div>
      </div>

      <div className="glass-card p-6 border-2 border-teal-500/40 text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-white mb-3">{currentQ.question}</h3>
        <p className="text-sm text-amber-300 font-medium mb-6">💡 {currentQ.hint}</p>

        <div className="space-y-3">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-teal-900/60 border-2 border-slate-700 hover:border-teal-400 text-white font-extrabold text-lg transition-all shadow-md text-left flex items-center justify-between"
            >
              <span>{opt}</span>
              <span className="text-teal-400 font-bold">Select →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
