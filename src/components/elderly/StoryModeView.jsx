import React, { useState, useEffect } from 'react';
import { MOCK_FAMILY_MEMORIES } from '../../data/mockData';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Sparkles, Heart } from 'lucide-react';
import { AudioService } from '../../services/audioService';

export default function StoryModeView({ onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeStory = MOCK_FAMILY_MEMORIES[currentIndex];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const narrationText = `Memory ${currentIndex + 1} of ${MOCK_FAMILY_MEMORIES.length}: ${activeStory.name}. ${activeStory.description}`;
      AudioService.speak(narrationText, 'en', () => {
        timer = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % MOCK_FAMILY_MEMORIES.length);
        }, 3000);
      });
    } else {
      AudioService.stopSpeaking();
    }

    return () => {
      clearTimeout(timer);
      AudioService.stopSpeaking();
    };
  }, [currentIndex, isPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MOCK_FAMILY_MEMORIES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? MOCK_FAMILY_MEMORIES.length - 1 : prev - 1));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="btn-secondary text-base py-2.5 px-4">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-end gap-2">
            <Sparkles className="w-8 h-8 text-amber-400" /> AI Family Story Mode
          </h2>
          <p className="text-sm text-slate-400 font-medium">Narrated memory slideshow for Kamala Devi</p>
        </div>
      </div>

      <div className="glass-card p-6 border-2 border-amber-500/40 relative">
        <div className="relative h-80 md:h-[450px] rounded-3xl overflow-hidden mb-6 border border-slate-700">
          <img
            src={activeStory.photoUrl}
            alt={activeStory.name}
            className="w-full h-full object-cover transition-all duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-amber text-xs">Story {currentIndex + 1} of {MOCK_FAMILY_MEMORIES.length}</span>
              <span className="badge badge-teal text-xs">{activeStory.category}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white">{activeStory.name}</h3>
            <p className="text-lg md:text-xl font-bold text-amber-300">{activeStory.relation}</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl mb-6">
          <p className="text-lg md:text-xl text-slate-100 font-medium leading-relaxed">
            "{activeStory.description}"
          </p>
          <p className="text-sm text-amber-400 font-semibold mt-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" /> {activeStory.favoriteMemory}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <button onClick={handlePrev} className="p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all">
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary py-3 px-8 text-lg font-extrabold shadow-lg shadow-teal-500/40"
          >
            {isPlaying ? (
              <><Pause className="w-6 h-6" /> Pause Story</>
            ) : (
              <><Play className="w-6 h-6" /> Resume Story</>
            )}
          </button>

          <button onClick={handleNext} className="p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
