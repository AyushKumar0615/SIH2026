import React from 'react';
import { MOCK_PERSONAL_BASELINE, MOCK_GAME_SESSIONS } from '../../data/mockData';
import { Activity } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';

const TREND_KEYS = {
  'Improving (+8%)': 'trendImprovingPercent',
  'Stable': 'statusStable',
  'High Accuracy': 'trendHighAccuracy',
  'Needs Encouragement': 'trendNeedsEncouragement'
};

export default function CognitiveAnalytics() {
  const { t } = useTranslation();
  const baseline = MOCK_PERSONAL_BASELINE;
  const containerRef = useScrollReveal();

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 scroll-reveal">
        <div>
          <span className="eyebrow">{t('personalBaselineEyebrow')} · {t('sinceLabel')} {baseline.establishedDate}</span>
          <h3 className="font-display text-2xl md:text-3xl font-medium mt-3">{t('cognitiveBaselineTitle')}</h3>
          <p className="pin mt-1">{t('calculatedAcrossPrefix')} {baseline.sampleSessionsCount} {t('evaluatedSessionsSuffix')}</p>
        </div>
        <div className="flex items-center gap-8 shrink-0">
          <div className="figure"><span className="figure-label">{t('engagementLabel')}</span><span className="figure-value" style={{ color: 'var(--jade)' }}>{baseline.overallEngagementMinutesPerDay}m</span></div>
          <div className="figure"><span className="figure-label">{t('completionLabel')}</span><span className="figure-value" style={{ color: 'var(--ember)' }}>{baseline.completionRatePercent}%</span></div>
        </div>
      </div>

      <div className="index-list scroll-reveal" data-reveal-delay="1">
        {Object.entries(baseline.domains).map(([domainKey, dData]) => (
          <div key={domainKey} className="index-row !cursor-default">
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-4 mb-2">
                <span className="font-display text-lg font-medium capitalize">{domainKey}</span>
                <span className="pin shrink-0">{TREND_KEYS[dData.trend] ? t(TREND_KEYS[dData.trend]) : dData.trend}</span>
              </span>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${dData.avgAccuracyPercent}%` }} /></div>
              <span className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--ink-faint)' }}>
                <span>{dData.avgAccuracyPercent}% {t('accuracySuffix')}</span>
                <span>{dData.avgResponseTimeSec}s {t('responseSuffix')}</span>
                <span>{t('targetLabel')}: {dData.typicalDifficulty}</span>
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="scroll-reveal" data-reveal-delay="2">
        <h4 className="font-display text-lg font-medium mb-4 flex items-center gap-2"><Activity className="w-4.5 h-4.5" style={{ color: 'var(--jade)' }} /> {t('recentSessionLogs')}</h4>
        <div className="data-table-wrap">
          <div className="overflow-x-auto">
            <table className="data-table text-sm">
              <thead><tr><th>{t('colDateTime')}</th><th>{t('colGame')}</th><th>{t('colDomain')}</th><th>{t('accuracyLabel')}</th><th>{t('timeLabel')}</th><th>{t('colAiRecommendation')}</th></tr></thead>
              <tbody>
                {MOCK_GAME_SESSIONS.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs whitespace-nowrap" style={{ color: 'rgba(23,20,15,0.5)' }}>{s.date} {s.time}</td>
                    <td className="font-semibold">{s.gameName}</td>
                    <td style={{ color: 'rgba(23,20,15,0.6)' }}>{s.domain}</td>
                    <td className="font-semibold" style={{ color: 'var(--jade-deep)' }}>{s.accuracy}%</td>
                    <td className="font-semibold" style={{ color: 'var(--ember-deep)' }}>{s.responseTimeSec}s</td>
                    <td className="text-xs" style={{ color: 'rgba(23,20,15,0.6)' }}>{s.adaptiveRecommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
