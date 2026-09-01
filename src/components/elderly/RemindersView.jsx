import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { MOCK_ROUTINE_SCHEDULE, ROUTINE_TRANSLATION_KEYS } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';

export default function RemindersView({ onBack }) {
  const { t } = useTranslation();
  const [items, setItems] = useState(MOCK_ROUTINE_SCHEDULE);
  const containerRef = useScrollReveal();

  const toggleItem = (id) => setItems((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div ref={containerRef} className="page max-w-2xl">
      <button type="button" onClick={onBack} className="btn btn-quiet !flex !px-0 mb-8"><ArrowLeft className="w-4 h-4" /> {t('back')}</button>

      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          <span className="eyebrow">{t('dailySchedule')}</span>
          <h2 className="font-display text-3xl md:text-4xl font-medium mt-3">{t('myReminders')}</h2>
        </div>
        <span className="figure-value shrink-0" style={{ color: 'var(--jade)' }}>{completedCount}/{items.length}</span>
      </div>

      <div className="progress-track my-6"><div className="progress-fill" style={{ width: `${(completedCount / items.length) * 100}%` }} /></div>

      <div className="index-list">
        {items.map((item) => {
          const keys = ROUTINE_TRANSLATION_KEYS[item.id];
          const title = keys ? `${keys.emojiPrefix || ''}${t(keys.titleKey)}` : item.title;
          const voicePrompt = keys ? t(keys.voiceKey) : item.voicePrompt;
          return (
            <button type="button" key={item.id} onClick={() => toggleItem(item.id)} className="index-row" style={item.completed ? { opacity: 0.5 } : undefined}>
              <span className="index-icon">{item.icon}</span>
              <span className="flex-1 min-w-0 text-left">
                <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ember)' }}>
                  <Clock className="w-3.5 h-3.5" /> {item.time}
                </span>
                <span className={`font-display text-xl font-medium block mt-0.5 ${item.completed ? 'line-through' : ''}`}>{title}</span>
                <span className="text-sm block mt-0.5 truncate" style={{ color: 'var(--ink-faint)' }}>{voicePrompt}</span>
              </span>
              <CheckCircle2 className="w-7 h-7 shrink-0" style={{ color: item.completed ? 'var(--jade)' : 'var(--hairline-strong)' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
