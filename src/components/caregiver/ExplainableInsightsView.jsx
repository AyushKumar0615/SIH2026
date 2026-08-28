import React from 'react';
import { MOCK_CAREGIVER_ALERTS } from '../../data/mockData';
import { InsightEngine } from '../../services/insightEngine';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default function ExplainableInsightsView() {
  const report = InsightEngine.generateCaregiverReport();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-teal-950/60">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <span className="badge badge-amber mb-1">Explainable AI Core</span>
            <h3 className="text-2xl font-black text-white">Why am I seeing these AI insights?</h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed mt-1">
              SmritiSetu analyzes Kamala Devi's performance against her <strong>personal 30-day baseline</strong> rather than standard population averages. Insights explain <em>what changed</em>, <em>why it changed</em>, and offer non-alarmist caregiver recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {report.keyTrends.map((trend, idx) => (
          <div
            key={idx}
            className="glass-card p-6 border border-slate-700 hover:border-teal-500/40 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white">{trend.metric}</h4>
                  <span className="text-xs font-bold text-slate-400">Personal Baseline Tracking</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${trend.badgeColor === 'green' ? 'badge-teal' : trend.badgeColor === 'amber' ? 'badge-amber' : 'badge-rose'}`}>
                  {trend.status} ({trend.changePercent})
                </span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-sm text-slate-200 font-medium">
              <strong className="text-teal-300 block mb-1">🔍 AI Rationale & Empirical Findings:</strong>
              {trend.explainableReason}
            </div>

            <div className="bg-teal-950/40 p-4 rounded-2xl border border-teal-800/50 text-xs md:text-sm text-teal-200 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Caregiver Action:</strong> {trend.recommendation}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" /> Recent System Alerts ({MOCK_CAREGIVER_ALERTS.length})
        </h3>

        {MOCK_CAREGIVER_ALERTS.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border flex items-start gap-4 ${
              alt.severity === 'ATTENTION'
                ? 'bg-amber-950/40 border-amber-500/50'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
              alt.severity === 'ATTENTION' ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
            }`}>
              {alt.severity === 'ATTENTION' ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-lg font-extrabold text-white">{alt.title}</h4>
                <span className="text-xs text-slate-400 font-semibold">{alt.timestamp}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium mb-2">{alt.summary}</p>
              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/60 font-medium">
                💬 <strong>AI Rationale:</strong> {alt.explainableReason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
