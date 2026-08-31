import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mic, PlayCircle, Sparkles, Volume2 } from 'lucide-react';
import { MOCK_FAMILY_MEMORIES } from '../../data/mockData';
import { AudioService } from '../../services/audioService';
import Magnetic from '../common/Magnetic';

export default function VoiceAssistantModal({ isOpen, onClose, onOpenGame }) {
  const [prompt, setPrompt] = useState('Who is Ananya?');

  const answer = useMemo(() => {
    const lower = prompt.toLowerCase();
    const hit = MOCK_FAMILY_MEMORIES.find((entry) => lower.includes(entry.name.toLowerCase().split(' ')[0]) || lower.includes(entry.relation.toLowerCase().split(' ')[0]));
    if (hit) return `${hit.name} is connected to you as ${hit.relation}. ${hit.description}`;
    if (lower.includes('game')) return 'Your Bihu memory game is ready. I can open it now for you.';
    return 'I can answer only from approved family memories, reminders, and caregiver notes.';
  }, [prompt]);

  const handleSpeak = () => AudioService.speak(answer, 'en');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          <motion.div
            className="modal-panel p-7 sm:p-9"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="eyebrow eyebrow-jade" style={{ color: 'var(--jade-deep)' }}>Voice Companion</span>
                <h3 className="font-display text-2xl sm:text-3xl font-medium mt-2">Ask Me Anything</h3>
              </div>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: 'rgba(23,20,15,0.06)' }}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <label className="block mb-6">
              <span className="field-label" style={{ color: 'rgba(23,20,15,0.55)' }}>Spoken Voice Prompt</span>
              <div className="relative mt-1">
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="input-on-light pr-9" placeholder="Type or speak a question..." />
                <Mic className="w-4.5 h-4.5 absolute right-0 top-1/2 -translate-y-1/2 animate-soft-pulse" style={{ color: 'var(--jade-deep)' }} />
              </div>
            </label>

            <div className="rounded-[var(--radius-md)] p-5 mb-6" style={{ background: 'rgba(23,20,15,0.04)' }}>
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ember-deep)' }}>
                <Sparkles className="w-4 h-4" /> Assistant Response
              </div>
              <p className="text-base leading-relaxed font-medium">{answer}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Magnetic strength={0.15} className="flex-1">
                <button type="button" onClick={handleSpeak} className="btn btn-on-light w-full"><Volume2 className="w-4.5 h-4.5" /> Speak Answer</button>
              </Magnetic>
              <button type="button" onClick={onOpenGame} className="btn btn-line flex-1" style={{ borderColor: 'var(--paper-line)', color: 'var(--paper-ink)' }}>
                <PlayCircle className="w-4.5 h-4.5" /> Open Game
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
