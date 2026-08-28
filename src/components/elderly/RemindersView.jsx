import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MOCK_ROUTINE_SCHEDULE } from '../../data/mockData';

export default function RemindersView({ onBack }) {
  const [items, setItems] = useState(MOCK_ROUTINE_SCHEDULE);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 animate-fade-in">
      <button onClick={onBack} className="btn-secondary px-4 py-2"><ArrowLeft className="w-5 h-5" /> Back</button>
      <div className="glass-card p-6 border-2 border-amber-500/40">
        <span className="badge badge-amber">Simple routine assistant</span>
        <h2 className="text-4xl font-black text-white mt-2">My reminders</h2>
        <p className="text-slate-300 font-medium mt-2">Large, calm prompts for medicines, meals, calls and safe activities.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setItems(items.map((r) => r.id === item.id ? { ...r, completed: !r.completed } : r))}
            className="w-full text-left elderly-card p-5 border-2 border-slate-700"
          >
            <div className="elderly-card-icon text-4xl">{item.icon}</div>
            <div className="flex-1">
              <p className="text-amber-300 font-black text-lg">{item.time}</p>
              <h3 className="text-2xl font-black text-white">{item.title}</h3>
              <p className="text-slate-300">{item.voicePrompt}</p>
            </div>
            <CheckCircle2 className={`w-9 h-9 ${item.completed ? 'text-teal-300' : 'text-slate-600'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
