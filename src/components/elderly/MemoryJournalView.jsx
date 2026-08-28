import React, { useState } from 'react';
import { MOCK_FAMILY_MEMORIES } from '../../data/mockData';
import { Volume2, ArrowLeft, Heart, BookOpen } from 'lucide-react';
import { AudioService } from '../../services/audioService';

export default function MemoryJournalView({ onBack, onOpenVoiceAssistant }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeMemory, setActiveMemory] = useState(MOCK_FAMILY_MEMORIES[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const categories = ['All', 'Family', 'Festivals', 'Places'];

  const filteredMemories = selectedCategory === 'All'
    ? MOCK_FAMILY_MEMORIES
    : MOCK_FAMILY_MEMORIES.filter(m => m.category === selectedCategory);

  const handleNarrate = (mem) => {
    setActiveMemory(mem);
    setIsPlayingAudio(true);
    const narrationText = `${mem.name}, ${mem.relation}. ${mem.description} ${mem.voiceNote}`;
    AudioService.speak(narrationText, 'en', () => setIsPlayingAudio(false));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="btn-secondary text-base py-2.5 px-4">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-end gap-2">
            <BookOpen className="w-8 h-8 text-teal-400" /> Digital Memory Journal
          </h2>
          <p className="text-sm text-slate-400 font-medium">Preserving your cherished family moments</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat === 'All' ? '🌟 All Memories' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {activeMemory && (
          <div className="lg:col-span-7 glass-card p-6 border-2 border-teal-500/40 relative">
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-6 border border-slate-700">
              <img
                src={activeMemory.photoUrl}
                alt={activeMemory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="badge badge-teal w-fit mb-2">{activeMemory.category}</span>
                <h3 className="text-3xl font-extrabold text-white">{activeMemory.name}</h3>
                <p className="text-lg font-bold text-amber-300">{activeMemory.relation}</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleNarrate(activeMemory)}
                className="btn-primary text-base py-3 px-6 w-full flex items-center justify-center gap-3 shadow-lg"
              >
                <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-bounce text-amber-300' : ''}`} />
                {isPlayingAudio ? 'Narrating Memory...' : 'Listen to Voice Memory'}
              </button>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Memory Story:</h4>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed font-medium">
                  {activeMemory.description}
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl text-amber-200 font-semibold text-sm flex items-start gap-3">
                <Heart className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300">Special Moment:</strong>
                  {activeMemory.favoriteMemory}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 flex items-center justify-between">
            <span>Memories ({filteredMemories.length})</span>
            <button onClick={onOpenVoiceAssistant} className="text-xs font-bold text-teal-400 hover:underline">
              Ask Voice Assistant "Who is this?"
            </button>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[650px] overflow-y-auto pr-1">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => {
                  setActiveMemory(mem);
                  handleNarrate(mem);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                  activeMemory?.id === mem.id
                    ? 'bg-teal-950/60 border-teal-400 ring-2 ring-teal-500/30'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <img
                  src={mem.photoUrl}
                  alt={mem.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-600 flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-extrabold text-white">{mem.name}</h4>
                  <p className="text-xs font-bold text-teal-400">{mem.relation}</p>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">{mem.description}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">
                  <Volume2 className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
