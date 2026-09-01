import React from 'react';
import { MOCK_IMPACT_METRICS } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';

export default function ImpactDashboard() {
  const { t } = useTranslation();
  const m = MOCK_IMPACT_METRICS;

  const stats = [
    { labelKey: 'statTotalUsers', value: m.totalUsersSupported.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statNerStates', value: m.nerStatesActive, color: 'var(--ember)' },
    { labelKey: 'statGamesPlayed', value: m.cognitiveGamesPlayed.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statMemoryQueries', value: m.memoryAssistanceQueries.toLocaleString(), color: 'var(--ember)' },
    { labelKey: 'statCaregiverChecks', value: m.caregiverCheckinsCount.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statBaselineImprov', value: `+${m.baselineImprovementPercent}%`, color: 'var(--ember)' }
  ];

  return (
    <div>
      <span className="eyebrow">{t('sihPitchMetrics')}</span>
      <h2 className="font-display text-3xl md:text-4xl font-medium mt-3 mb-8">{t('regionalImpactTitle')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" style={{ borderTop: '1px solid var(--hairline)', paddingTop: '2rem' }}>
        {stats.map((s) => (
          <div key={s.labelKey} className="figure">
            <span className="figure-label">{t(s.labelKey)}</span>
            <span className="figure-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
