import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const people = [
  { name: 'Ananya', relation: 'Granddaughter', hint: 'Studies Computer Science' },
  { name: 'Priya Devi', relation: 'Daughter', hint: 'Calls after lunch' },
  { name: 'Rahul', relation: 'Son-in-law', hint: 'Brings medicines from Guwahati' }
];

export default function FaceRelationGame({ onFinishGame, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const finish = () => {
    const correct = people.filter((p) => answers[p.name] === p.relation).length;
    setSubmitted(true);
    onFinishGame({
      gameName: 'Face & Relation Match',
      domain: 'Memory',
      difficulty: 'Medium',
      accuracy: Math.round((correct / people.length) * 100),
      responseTimeSec: 6,
      mistakes: people.length - correct
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 animate-fade-in">
      <button onClick={onBack} className="btn-secondary px-4 py-2"><ArrowLeft className="w-5 h-5" /> Game Library</button>
      <div className="glass-card p-6 border-2 border-amber-500/40">
        <span className="badge badge-amber">Family recall</span>
        <h2 className="text-3xl font-black text-white mt-2">Who is this family member?</h2>
      </div>
      <div className="space-y-4">
        {people.map((person) => (
          <div key={person.name} className="glass-card p-5 border border-slate-700 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-center">
            <div>
              <h3 className="text-2xl font-black text-white">{person.name}</h3>
              <p className="text-slate-300 font-medium">{person.hint}</p>
            </div>
            <select
              value={answers[person.name] || ''}
              onChange={(e) => setAnswers({ ...answers, [person.name]: e.target.value })}
              className="min-h-12 rounded-xl bg-slate-950 border border-slate-700 px-4 text-white font-bold"
            >
              <option value="">Choose relation</option>
              <option>Daughter</option>
              <option>Granddaughter</option>
              <option>Son-in-law</option>
            </select>
          </div>
        ))}
      </div>
      <button disabled={submitted} onClick={finish} className="btn-primary px-7 py-4 text-lg">Complete family match</button>
    </div>
  );
}
