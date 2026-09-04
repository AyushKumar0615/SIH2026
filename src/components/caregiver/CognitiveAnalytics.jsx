import React from 'react';
import { Activity } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';

export default function CognitiveAnalytics() {
  const { t } = useTranslation();
  const containerRef = useScrollReveal();

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="panel-light p-8 sm:p-10 text-center space-y-5 max-w-lg mx-auto scroll-reveal">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(79,174,142,0.15)', color: 'var(--jade-deep)' }}>
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-medium">{t('cognitiveAnalyticsEmptyTitle')}</h3>
          <p className="text-sm mt-2" style={{ color: 'rgba(23,20,15,0.6)' }}>{t('cognitiveAnalyticsEmptyDesc')}</p>
        </div>
      </div>
    </div>
  );
}
