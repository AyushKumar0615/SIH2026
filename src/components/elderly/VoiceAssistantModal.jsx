import React, { useMemo, useState } from 'react';
import { X, Mic, PlayCircle } from 'lucide-react';
import { MOCK_FAMILY_MEMORIES } from '../../data/mockData';

export default function VoiceAssistantModal({ isOpen, onClose, onOpenGame }) {
  const [prompt, setPrompt] = useState('Who is Ananya?');
  const answer = useMemo(() => {
    const lower = prompt.toLowerCase();
    const hit = MOCK_FAMILY_MEMORIES.find((entry) => lower.includes(entry.name.toLowerCase().split(' ')[0]) || lower.includes(entry.relation.toLowerCase().split(' ')[0]));
    if (hit) return `${hit.name} is connected to you as ${hit.relation}. ${hit.description}`;
    if (lower.includes('game')) return 'Your Bihu memory game is ready. I can open it now.';
    return 'I can answer only from approved family memories, reminders and caregiver notes.';
  }, [prompt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4">
      <div className="glass-card max-w-xl w-full border-2 border-teal-500/50 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="badge badge-teal">Voice memory assistant</span>
            <h3 className="text-3xl font-black text-white mt-2">Ask me gently</h3>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 grid place-items-center"><X className="w-5 h-5" /></button>
        </div>
        <label className="block">
          <span className="text-sm text-slate-300 font-bold">Spoken prompt simulation</span>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 p-4 text-white text-lg outline-none focus:border-teal-400" />
        </label>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-amber-300 font-black uppercase">Assistant answer</p>
          <p className="text-xl text-white font-bold mt-2 leading-relaxed">{answer}</p>
          <p className="text-xs text-slate-400 mt-3">No diagnosis. No unknown facts invented. Escalates emergency phrases to caregiver workflow.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary px-5 py-3"><Mic className="w-5 h-5" /> Listen again</button>
          <button onClick={onOpenGame} className="btn-secondary px-5 py-3"><PlayCircle className="w-5 h-5" /> Open game</button>
        </div>
      </div>
    </div>
  );
}
