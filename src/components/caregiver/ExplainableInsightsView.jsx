import React from 'react';
import { MOCK_CAREGIVER_ALERTS, ALERT_TRANSLATION_KEYS } from '../../data/mockData';
import { InsightEngine } from '../../services/insightEngine';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

const badgeColor = { green: 'var(--jade)', amber: 'var(--ember)', rose: 'var(--alert)' };

export default function ExplainableInsightsView({ userName = 'Guest' }) {
  const { t } = useTranslation();
  const report = InsightEngine.generateCaregiverReport(userName, t);
  const containerRef = useScrollReveal();

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

      <div className="index-list scroll-reveal" data-reveal-delay="1">
        {report.keyTrends.map((trend, idx) => (
          <div key={idx} className="index-row !cursor-default">
            <span className="index-num">0{idx + 1}</span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-3 mb-1.5">
                <span className="font-display text-lg font-medium">{trend.metric}</span>
                <span className="text-xs font-semibold shrink-0" style={{ color: badgeColor[trend.badgeColor] || 'var(--ink-faint)' }}>{trend.status} ({trend.changePercent})</span>
              </span>
              <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>{trend.explainableReason}</p>
              <p className="flex items-start gap-2 text-xs font-medium" style={{ color: 'var(--jade)' }}>
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {trend.recommendation}
              </p>
            </span>
          </div>
        ))}
      </div>

      <div className="scroll-reveal" data-reveal-delay="2">
        <h3 className="font-display text-lg font-medium flex items-center gap-2.5 mb-5"><ShieldAlert className="w-5 h-5" style={{ color: 'var(--ember)' }} /> {t('recentSystemAlerts')}</h3>
        <div className="index-list">
          {MOCK_CAREGIVER_ALERTS.map((alt) => {
            const keys = ALERT_TRANSLATION_KEYS[alt.id];
            return (
              <div key={alt.id} className="index-row !cursor-default">
                <span className="index-icon" style={alt.severity === 'ATTENTION' ? { background: 'var(--ember-soft)', color: 'var(--ember)' } : { background: 'var(--jade-soft)', color: 'var(--jade)' }}>
                  {alt.severity === 'ATTENTION' ? <AlertTriangle className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-display font-medium truncate">{keys ? t(keys.titleKey) : alt.title}</span>
                    <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--ink-faint)' }}>{alt.timestamp}</span>
                  </span>
                  <p className="text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>{keys ? t(keys.summaryKey) : alt.summary}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{keys ? t(keys.reasonKey) : alt.explainableReason}</p>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
