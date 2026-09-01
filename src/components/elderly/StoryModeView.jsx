import React, { useState, useEffect } from 'react';
import { MOCK_FAMILY_MEMORIES } from '../../data/mockData';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Heart } from 'lucide-react';
import { AudioService } from '../../services/audioService';
import Magnetic from '../common/Magnetic';
import { useTranslation } from '../../hooks/useTranslation';

const categoryLabelKeys = { Family: 'categoryFamily', Festivals: 'categoryFestivals', Places: 'categoryPlaces' };

export default function StoryModeView({ onBack }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const activeStory = MOCK_FAMILY_MEMORIES[currentIndex];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let advanceTimer;
    let fallbackTimer;
    let hasScheduled = false;

    const scheduleAdvance = () => {
      if (hasScheduled) return;
      hasScheduled = true;
      clearTimeout(fallbackTimer);
      advanceTimer = setTimeout(() => setCurrentIndex((prev) => (prev + 1) % MOCK_FAMILY_MEMORIES.length), 3000);
    };

    if (isPlaying) {
      const narrationText = `Memory ${currentIndex + 1} of ${MOCK_FAMILY_MEMORIES.length}: ${activeStory.name}. ${activeStory.description}`;
      // "onend" is unreliable across browsers/tabs — a duration-based fallback
      // guarantees the slideshow never silently freezes on one slide.
      const estimatedMs = Math.min(20000, Math.max(4000, narrationText.split(' ').length * 380));
      fallbackTimer = setTimeout(scheduleAdvance, estimatedMs);
      AudioService.speak(narrationText, 'en', scheduleAdvance);
    } else {
      AudioService.stopSpeaking();
    }

    return () => {
      clearTimeout(advanceTimer);
      clearTimeout(fallbackTimer);
      AudioService.stopSpeaking();
    };
  }, [currentIndex, isPlaying]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % MOCK_FAMILY_MEMORIES.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? MOCK_FAMILY_MEMORIES.length - 1 : prev - 1));

  return (
    <div className="relative min-h-screen">
      <img src={activeStory.photoUrl.replace('w=500', 'w=1600')} alt={activeStory.name} className="fixed inset-0 w-full h-full object-cover" />
      <div className="fixed inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,10,8,0.75) 0%, rgba(11,10,8,0.35) 40%, rgba(11,10,8,0.95) 100%)' }} />

      <div className="relative min-h-screen flex flex-col justify-between page !max-w-3xl">
        <button type="button" onClick={onBack} className="btn btn-quiet !px-0 self-start" style={{ color: 'var(--ink)' }}><ArrowLeft className="w-4 h-4" /> {t('back')}</button>

        <div>
          <span className="eyebrow">{t('storyLabel')} {currentIndex + 1} {t('ofLabel')} {MOCK_FAMILY_MEMORIES.length} · {categoryLabelKeys[activeStory.category] ? t(categoryLabelKeys[activeStory.category]) : activeStory.category}</span>
          <h3 className="font-display font-medium text-[clamp(2.2rem,6vw,4rem)] leading-[0.98] mt-4">{activeStory.name}</h3>
          <p className="text-lg mt-1" style={{ color: 'var(--ember)' }}>{activeStory.relation}</p>
          <p className="text-lg leading-relaxed italic font-display mt-6 max-w-xl">"{activeStory.description}"</p>
          <p className="flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: 'var(--ink-soft)' }}>
            <Heart className="w-4 h-4" style={{ color: 'var(--ember)' }} /> {activeStory.favoriteMemory}
          </p>

          <div className="flex items-center gap-6 mt-10">
            <button type="button" onClick={handlePrev} className="trigger-btn" title={t('previousLabel')}><SkipBack className="w-4.5 h-4.5" /></button>
            <Magnetic strength={0.25}>
              <button type="button" onClick={() => setIsPlaying(!isPlaying)} className="btn btn-ember !rounded-full !px-8">
                {isPlaying ? (<><Pause className="w-4.5 h-4.5" /> {t('pause')}</>) : (<><Play className="w-4.5 h-4.5" /> {t('resume')}</>)}
              </button>
            </Magnetic>
            <button type="button" onClick={handleNext} className="trigger-btn" title={t('nextLabel')}><SkipForward className="w-4.5 h-4.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
