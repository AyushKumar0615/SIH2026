import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { MOCK_FAMILY_MEMORIES } from '../../data/mockData';
import { Volume2, ArrowLeft, Heart, Check } from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Magnetic from '../common/Magnetic';
import Waveform from '../common/Waveform';
import { useTranslation } from '../../hooks/useTranslation';

export default function MemoryJournalView({ onBack, onOpenVoiceAssistant }) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeMemory, setActiveMemory] = useState(MOCK_FAMILY_MEMORIES[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const containerRef = useScrollReveal();
  const fallbackTimerRef = useRef(null);

  const imgTiltX = useMotionValue(0);
  const imgTiltY = useMotionValue(0);
  const imgTiltXSpring = useSpring(imgTiltX, { stiffness: 80, damping: 18, mass: 0.6 });
  const imgTiltYSpring = useSpring(imgTiltY, { stiffness: 80, damping: 18, mass: 0.6 });

  const categories = ['All', 'Family', 'Festivals', 'Places'];
  const categoryLabelKeys = { All: 'categoryAll', Family: 'categoryFamily', Festivals: 'categoryFestivals', Places: 'categoryPlaces' };
  const filteredMemories = selectedCategory === 'All' ? MOCK_FAMILY_MEMORIES : MOCK_FAMILY_MEMORIES.filter((m) => m.category === selectedCategory);

  const handleNarrate = (mem) => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    setActiveMemory(mem);
    setIsPlayingAudio(true);
    setJustFinished(false);

    const text = `${mem.name}, ${mem.relation}. ${mem.description} ${mem.voiceNote}`;
    // Speech-synthesis "onend" is notoriously unreliable across browsers/tabs —
    // fall back to a duration estimate so the button can never get stuck.
    const estimatedMs = Math.min(20000, Math.max(3000, text.split(' ').length * 380));

    const finish = () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setIsPlayingAudio(false);
      setJustFinished(true);
      window.setTimeout(() => setJustFinished(false), 1400);
    };

    fallbackTimerRef.current = window.setTimeout(finish, estimatedMs);
    AudioService.speak(text, 'en', finish);
  };

  const handleImageMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    imgTiltX.set(((e.clientX - rect.left) / rect.width - 0.5) * 14);
    imgTiltY.set(((e.clientY - rect.top) / rect.height - 0.5) * 14);
  };

  const handleImageLeave = () => {
    imgTiltX.set(0);
    imgTiltY.set(0);
  };

  return (
    <div ref={containerRef} className="page max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-8">
        <button type="button" onClick={onBack} className="btn btn-quiet !px-0"><ArrowLeft className="w-4 h-4" /> {t('back')}</button>
        <h2 className="font-display text-2xl font-medium">{t('memoryJournal')}</h2>
      </div>

      <div className="flex items-center gap-6 mb-8 overflow-x-auto scrollbar-none" style={{ borderBottom: '1px solid var(--hairline)' }}>
        {categories.map((cat) => (
          <button
            type="button" key={cat} onClick={() => setSelectedCategory(cat)}
            className={`tab-link ${selectedCategory === cat ? 'is-active' : ''}`}
          >
            {t(categoryLabelKeys[cat])}
            {selectedCategory === cat && (
              <motion.span layoutId="memory-tab-underline" className="absolute left-0 right-0 -bottom-px h-[2px]" style={{ background: 'var(--ember)' }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {activeMemory && (
          <div className="lg:col-span-7 scroll-reveal">
            <div
              className="relative rounded-[var(--radius-lg)] overflow-hidden h-72 sm:h-[27rem]"
              onMouseMove={handleImageMove}
              onMouseLeave={handleImageLeave}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMemory.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.img
                    src={activeMemory.photoUrl}
                    alt={activeMemory.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: '50% 28%', x: imgTiltXSpring, y: imgTiltYSpring, scale: 1.06 }}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(11,10,8,0.94) 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--on-photo-soft)' }}>{t(categoryLabelKeys[activeMemory.category]) || activeMemory.category}</span>
                <h3 className="font-display text-3xl sm:text-[2.15rem] font-medium mt-1.5 leading-tight" style={{ color: 'var(--on-photo)' }}>{activeMemory.name}</h3>
                <p className="text-sm font-medium mt-1" style={{ color: 'var(--jade)' }}>{activeMemory.relation}</p>
              </div>
            </div>

            <div className="mt-5 space-y-6">
              <Magnetic strength={0.12} className="block">
                <button type="button" onClick={() => handleNarrate(activeMemory)} className="btn btn-ember w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {justFinished ? (
                      <motion.span key="done" className="inline-flex items-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.16 }}>
                        <Check className="w-4.5 h-4.5" /> {t('played')}
                      </motion.span>
                    ) : isPlayingAudio ? (
                      <motion.span key="playing" className="inline-flex items-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
                        <Waveform active barWidth={2.5} height={16} />
                        {t('narratingEllipsis')}
                      </motion.span>
                    ) : (
                      <motion.span key="idle" className="inline-flex items-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
                        <Volume2 className="w-4.5 h-4.5" /> {t('listenToVoiceMemory')}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </Magnetic>

              <p className="text-base leading-relaxed max-w-prose" style={{ color: 'var(--ink-soft)' }}>{activeMemory.description}</p>

              <div className="notice-strip is-ember flex items-start gap-3">
                <Heart className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--ember)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  <span className="font-semibold" style={{ color: 'var(--ink)' }}>{t('specialMoment')}</span> {activeMemory.favoriteMemory}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-5 scroll-reveal" data-reveal-delay="1">
          <div className="flex items-center justify-between mb-2">
            <span className="pin">{filteredMemories.length} {t('memoriesCountSuffix')}</span>
            <button type="button" onClick={onOpenVoiceAssistant} className="text-xs font-semibold" style={{ color: 'var(--jade)' }}>{t('askWhoIsThis')} →</button>
          </div>

          <div className="index-list max-h-[560px] overflow-y-auto scrollbar-none">
            {filteredMemories.map((mem) => (
              <button
                type="button" key={mem.id} onClick={() => handleNarrate(mem)} className="index-row"
                style={activeMemory?.id === mem.id ? { color: 'var(--ember)' } : undefined}
              >
                <img src={mem.photoUrl} alt={mem.name} className="w-14 h-14 rounded-full object-cover shrink-0" style={{ objectPosition: '50% 28%' }} />
                <span className="flex-1 min-w-0">
                  <span className="font-display text-lg font-medium block truncate">{mem.name}</span>
                  <span className="text-xs block truncate" style={{ color: 'var(--ink-faint)' }}>{mem.relation}</span>
                </span>
                <Volume2 className="w-4 h-4 shrink-0" style={{ color: 'var(--ink-faint)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
