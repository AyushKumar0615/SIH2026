import React from 'react';
import { MOCK_PERSONAL_BASELINE, MOCK_GAME_SESSIONS } from '../../data/mockData';
import { Activity } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function CognitiveAnalytics() {
  const baseline = MOCK_PERSONAL_BASELINE;
  const containerRef = useScrollReveal();

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 scroll-reveal">
        <div>
          <span className="eyebrow">Personal Baseline v2.4 · Since {baseline.establishedDate}</span>
          <h3 className="font-display text-2xl md:text-3xl font-medium mt-3">Cognitive Baseline Performance</h3>
          <p className="pin mt-1">Calculated across {baseline.sampleSessionsCount} evaluated sessions</p>
        </div>
        <div className="flex items-center gap-8 shrink-0">
          <div className="figure"><span className="figure-label">Engagement</span><span className="figure-value" style={{ color: 'var(--jade)' }}>{baseline.overallEngagementMinutesPerDay}m</span></div>
          <div className="figure"><span className="figure-label">Completion</span><span className="figure-value" style={{ color: 'var(--ember)' }}>{baseline.completionRatePercent}%</span></div>
        </div>
      </div>

      <div className="index-list scroll-reveal" data-reveal-delay="1">
        {Object.entries(baseline.domains).map(([domainKey, dData]) => (
          <div key={domainKey} className="index-row !cursor-default">
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-4 mb-2">
                <span className="font-display text-lg font-medium capitalize">{domainKey}</span>
                <span className="pin shrink-0">{dData.trend}</span>
              </span>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${dData.avgAccuracyPercent}%` }} /></div>
              <span className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--ink-faint)' }}>
                <span>{dData.avgAccuracyPercent}% accuracy</span>
                <span>{dData.avgResponseTimeSec}s response</span>
                <span>Target: {dData.typicalDifficulty}</span>
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="scroll-reveal" data-reveal-delay="2">
        <h4 className="font-display text-lg font-medium mb-4 flex items-center gap-2"><Activity className="w-4.5 h-4.5" style={{ color: 'var(--jade)' }} /> Recent Session Logs</h4>
        <div className="data-table-wrap">
          <div className="overflow-x-auto">
            <table className="data-table text-sm">
              <thead><tr><th>Date & Time</th><th>Game</th><th>Domain</th><th>Accuracy</th><th>Time</th><th>AI Recommendation</th></tr></thead>
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
