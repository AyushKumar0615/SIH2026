import React from 'react';
import { MOCK_IMPACT_METRICS } from '../../data/mockData';

export default function ImpactDashboard() {
  const m = MOCK_IMPACT_METRICS;

  const stats = [
    { label: 'Total Users', value: m.totalUsersSupported.toLocaleString(), color: 'var(--jade)' },
    { label: 'NER States', value: m.nerStatesActive, color: 'var(--ember)' },
    { label: 'Games Played', value: m.cognitiveGamesPlayed.toLocaleString(), color: 'var(--jade)' },
    { label: 'Memory Queries', value: m.memoryAssistanceQueries.toLocaleString(), color: 'var(--ember)' },
    { label: 'Caregiver Checks', value: m.caregiverCheckinsCount.toLocaleString(), color: 'var(--jade)' },
    { label: 'Baseline Improv.', value: `+${m.baselineImprovementPercent}%`, color: 'var(--ember)' }
  ];

  return (
    <div>
      <span className="eyebrow">SIH Pitch Metrics</span>
      <h2 className="font-display text-3xl md:text-4xl font-medium mt-3 mb-8">Regional Impact & Deployment</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" style={{ borderTop: '1px solid var(--hairline)', paddingTop: '2rem' }}>
        {stats.map((s) => (
          <div key={s.label} className="figure">
            <span className="figure-label">{s.label}</span>
            <span className="figure-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
