import React from 'react';
import { MOCK_PERSONAL_BASELINE, MOCK_GAME_SESSIONS } from '../../data/mockData';
import { Activity } from 'lucide-react';

export default function CognitiveAnalytics() {
  const baseline = MOCK_PERSONAL_BASELINE;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 border-2 border-teal-500/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-teal">Personal Baseline v2.4</span>
              <span className="badge badge-amber">Established: {baseline.establishedDate}</span>
            </div>
            <h3 className="text-2xl font-black text-white">Kamala Devi's Cognitive Baseline</h3>
            <p className="text-xs text-slate-400 font-medium">Calculated across {baseline.sampleSessionsCount} evaluated sessions</p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-center">
              <span className="text-xs text-slate-400 font-bold block">DAILY ENGAGEMENT</span>
              <span className="text-2xl font-black text-teal-400">{baseline.overallEngagementMinutesPerDay} mins</span>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <span className="text-xs text-slate-400 font-bold block">COMPLETION RATE</span>
              <span className="text-2xl font-black text-amber-400">{baseline.completionRatePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(baseline.domains).map(([domainKey, dData]) => (
          <div
            key={domainKey}
            className="glass-card p-6 border border-slate-700 hover:border-teal-400 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xl font-extrabold text-white capitalize">{domainKey} Domain</h4>
              <span className="badge badge-teal text-xs">{dData.trend}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Accuracy Benchmark</span>
                  <span className="text-teal-400">{dData.avgAccuracyPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all"
                    style={{ width: `${dData.avgAccuracyPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                <span className="text-slate-400 font-medium">Avg Response Time:</span>
                <span className="text-amber-300 font-bold">{dData.avgResponseTimeSec} seconds</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                <span className="text-slate-400 font-medium">Suggested Difficulty:</span>
                <span className="text-teal-300 font-bold">{dData.typicalDifficulty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 border border-slate-700">
        <h4 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" /> Recent Game Session Log
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400 font-extrabold border-b border-slate-800">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Game Name</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Response Time</th>
                <th className="p-3">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {MOCK_GAME_SESSIONS.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/50">
                  <td className="p-3 text-slate-400">{s.date} {s.time}</td>
                  <td className="p-3 font-bold text-white">{s.gameName}</td>
                  <td className="p-3"><span className="badge badge-teal text-xs">{s.domain}</span></td>
                  <td className="p-3 text-teal-300 font-bold">{s.accuracy}%</td>
                  <td className="p-3 text-amber-300 font-bold">{s.responseTimeSec}s</td>
                  <td className="p-3 text-xs text-slate-300">{s.adaptiveRecommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
