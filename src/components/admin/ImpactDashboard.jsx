import React from 'react';
import { MOCK_IMPACT_METRICS } from '../../data/mockData';

export default function ImpactDashboard() {
  const m = MOCK_IMPACT_METRICS;

  return (
    <div className="glass-card p-6 border-2 border-teal-500/40 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-amber mb-1">SIH Competition Pitch Metrics</span>
          <h3 className="text-2xl font-black text-white">SmritiSetu Regional Impact Dashboard</h3>
        </div>
        <div className="badge badge-teal text-sm font-bold">Simulated Platform Deployment Data</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold block uppercase">USERS SUPPORTED</span>
          <span className="text-3xl font-black text-teal-400">{m.totalUsersSupported.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold block uppercase">NER STATES</span>
          <span className="text-3xl font-black text-amber-400">{m.nerStatesActive} States</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold block uppercase">GAMES PLAYED</span>
          <span className="text-3xl font-black text-purple-400">{m.cognitiveGamesPlayed.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold block uppercase">MEMORY ASSISTS</span>
          <span className="text-3xl font-black text-rose-400">{m.memoryAssistanceQueries.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold block uppercase">CAREGIVER CHECKS</span>
          <span className="text-3xl font-black text-blue-400">{m.caregiverCheckinsCount.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold block uppercase">AVG BASELINE DRIFT</span>
          <span className="text-3xl font-black text-emerald-400">+{m.baselineImprovementPercent}%</span>
        </div>
      </div>
    </div>
  );
}
