import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CognitiveAnalytics from './CognitiveAnalytics';
import ExplainableInsightsView from './ExplainableInsightsView';
import RoutineManager from './RoutineManager';
import { MOCK_ELDERLY_USER } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { pageTransition } from '../common/pageTransition';
import UserAvatar from '../common/UserAvatar';
import { useTranslation } from '../../hooks/useTranslation';
import { BarChart3, Lightbulb, Bell, ShieldAlert } from 'lucide-react';

export default function CaregiverDashboard({ session }) {
  const { t } = useTranslation();
  const userName = session?.fullName || t('guestLabel');
  const [activeTab, setActiveTab] = useState('insights');
  const containerRef = useScrollReveal();

  const tabs = [
    { id: 'insights', labelKey: 'tabAiInsights', icon: Lightbulb },
    { id: 'analytics', labelKey: 'tabCognitiveAnalytics', icon: BarChart3 },
    { id: 'routines', labelKey: 'tabRoutines', icon: Bell }
  ];

  return (
    <div ref={containerRef} className="page">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 scroll-reveal" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <div className="flex items-center gap-5 min-w-0">
          <UserAvatar avatar={session?.avatar} fullName={userName} className="avatar-ring w-16 h-16 rounded-full overflow-hidden object-cover shrink-0" iconClassName="w-1/3 h-1/3" />
          <div className="min-w-0">
            <h1 className="font-display text-3xl md:text-4xl font-medium mt-2 truncate">
              {t('monitoring')} <em className="italic" style={{ color: 'var(--ember)' }}>{userName}</em>
            </h1>
            <p className="pin mt-1">{MOCK_ELDERLY_USER.conditionSummary} · {MOCK_ELDERLY_USER.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 shrink-0">
          <div className="figure"><span className="figure-label">{t('todayLabel')}</span><span className="figure-value" style={{ color: 'var(--jade)' }}>4/4</span></div>
          <div className="figure"><span className="figure-label">{t('trendLabel')}</span><span className="figure-value" style={{ color: 'var(--ember)' }}>+8%</span></div>
        </div>
      </div>

      <div className="notice-strip is-ember flex items-center gap-3 my-8 scroll-reveal" data-reveal-delay="1">
        <ShieldAlert className="w-4.5 h-4.5 shrink-0" style={{ color: 'var(--ember)' }} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {t('caregiverDisclaimer')}
        </p>
      </div>

      <div className="relative flex items-center gap-8 mb-10 scroll-reveal" data-reveal-delay="2" style={{ borderBottom: '1px solid var(--hairline)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`tab-link flex items-center gap-2 ${isActive ? 'is-active' : ''}`}>
              <Icon className="w-4 h-4" /> {t(tab.labelKey)}
              {isActive && <motion.span layoutId="caregiver-tab" className="absolute left-0 right-0 -bottom-px h-[2px]" style={{ background: 'var(--ember)' }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} />}
            </button>
          );
        })}
      </div>

      <div className="scroll-reveal" data-reveal-delay="3">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} {...pageTransition}>
            {activeTab === 'insights' && <ExplainableInsightsView userName={userName} />}
            {activeTab === 'analytics' && <CognitiveAnalytics />}
            {activeTab === 'routines' && <RoutineManager userName={userName} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
