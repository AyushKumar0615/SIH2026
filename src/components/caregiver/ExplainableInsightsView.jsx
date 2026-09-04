import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { ShieldAlert, Lightbulb, BookOpen, Bell } from 'lucide-react';

export default function ExplainableInsightsView({ userName = 'Guest', memories = [], isLoadingMemories, routines = [], isLoadingRoutines }) {
  const { t } = useTranslation();
  const containerRef = useScrollReveal();
  const isLoading = isLoadingMemories || isLoadingRoutines;
  const hasData = memories.length > 0 || routines.length > 0;
  const completedToday = routines.filter((r) => r.isCompleted).length;

  const recentActivity = [
    ...memories.map((m) => ({ key: `mem-${m.id}`, icon: BookOpen, text: t('activityAddedMemory').replace('{title}', m.name), date: m.createdAt })),
    ...routines.map((r) => ({ key: `rem-${r.id}`, icon: Bell, text: t('activityAddedReminder').replace('{title}', r.title), date: r.createdAt }))
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  let body;
  if (isLoading) {
    body = <div className="py-16 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>{t('loadingInsights')}</div>;
  } else if (!hasData) {
    body = (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="panel-light p-8 sm:p-10 text-center space-y-5 max-w-lg mx-auto"
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(226,112,58,0.15)', color: 'var(--ember-deep)' }}>
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-medium">{t('insightsNotEnoughDataTitle')}</h3>
          <p className="text-sm mt-2" style={{ color: 'rgba(23,20,15,0.6)' }}>{t('insightsNotEnoughDataDesc')}</p>
        </div>
      </motion.div>
    );
  } else {
    body = (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="space-y-12">
        <div className="index-list">
          {memories.length > 0 && (
            <div className="index-row !cursor-default">
              <span className="index-icon"><BookOpen className="w-4.5 h-4.5" /></span>
              <span className="flex-1 min-w-0">
                <span className="font-display text-lg font-medium block mb-1">{t('memoryJournalActivityTitle')}</span>
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{t('memoryCountSummary').replace('{count}', memories.length)}</p>
              </span>
            </div>
          )}
          {routines.length > 0 && (
            <div className="index-row !cursor-default">
              <span className="index-icon"><Bell className="w-4.5 h-4.5" /></span>
              <span className="flex-1 min-w-0">
                <span className="font-display text-lg font-medium block mb-1">{t('reminderAdherenceTitle')}</span>
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{t('reminderAdherenceSummary').replace('{completed}', completedToday).replace('{total}', routines.length)}</p>
              </span>
            </div>
          )}
        </div>

        {recentActivity.length > 0 && (
          <div>
            <h3 className="font-display text-lg font-medium flex items-center gap-2.5 mb-5"><ShieldAlert className="w-5 h-5" style={{ color: 'var(--ember)' }} /> {t('recentActivityTitle')}</h3>
            <div className="index-list">
              {recentActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="index-row !cursor-default">
                    <span className="index-icon" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}><Icon className="w-4.5 h-4.5" /></span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-display font-medium truncate">{item.text}</span>
                        <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--ink-faint)' }}>{new Date(item.date).toLocaleDateString()}</span>
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="flex items-start gap-4 scroll-reveal">
        <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: 'var(--ember-soft)', color: 'var(--ember)' }}>
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <span className="eyebrow">{t('explainableAiCore')}</span>
          <h3 className="font-display text-xl md:text-2xl font-medium mt-2">{t('empiricalBaselineTitle')}</h3>
          <p className="text-sm leading-relaxed mt-2 max-w-2xl" style={{ color: 'var(--ink-soft)' }}>
            {t('insightIntroPrefix').replace('{name}', userName)} <strong style={{ color: 'var(--ink)' }}>{t('insightIntroBold')}</strong> {t('insightIntroSuffix')}
          </p>
        </div>
      </div>

      {body}
    </div>
  );
}
