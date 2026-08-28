import React, { useState } from 'react';
import CognitiveAnalytics from './CognitiveAnalytics';
import ExplainableInsightsView from './ExplainableInsightsView';
import RoutineManager from './RoutineManager';
import { MOCK_ELDERLY_USER } from '../../data/mockData';
import { BarChart3, Lightbulb, Bell, ShieldAlert } from 'lucide-react';

export default function CaregiverDashboard() {
  const [activeTab, setActiveTab] = useState('insights');

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="glass-card p-6 md:p-8 border-2 border-amber-500/40 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={MOCK_ELDERLY_USER.avatarUrl}
              alt={MOCK_ELDERLY_USER.name}
              className="w-20 h-20 rounded-3xl object-cover border-4 border-amber-400 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-amber text-xs font-bold">Caregiver Overview</span>
                <span className="badge badge-teal text-xs font-bold">Priya Devi (Daughter)</span>
              </div>
              <h2 className="text-3xl font-black text-white">
                Caregiver Intelligence — <span className="text-amber-300">{MOCK_ELDERLY_USER.name}</span>
              </h2>
              <p className="text-sm text-slate-300 font-medium">
                Condition: {MOCK_ELDERLY_USER.conditionSummary} • {MOCK_ELDERLY_USER.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">TODAY'S ACTIVITIES</span>
              <span className="text-2xl font-black text-teal-400">4 / 4 Complete ✓</span>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">BASELINE STATUS</span>
              <span className="text-2xl font-black text-amber-400">Stable (+8% Rec)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 font-medium flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <strong>Medical Safety Principle:</strong> SmritiSetu displays cognitive activity trends and engagement indicators for remote caregiver support. It is NOT a clinical diagnostic tool and does NOT provide dementia severity diagnoses or replace medical doctors.
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm transition-all ${
            activeTab === 'insights'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" /> 💡 Explainable AI Insights
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm transition-all ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> 📊 Cognitive Analytics & Baseline
        </button>

        <button
          onClick={() => setActiveTab('routines')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm transition-all ${
            activeTab === 'routines'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" /> 🔔 Routine & Reminders Manager
        </button>
      </div>

      {activeTab === 'insights' && <ExplainableInsightsView />}
      {activeTab === 'analytics' && <CognitiveAnalytics />}
      {activeTab === 'routines' && <RoutineManager />}
    </div>
  );
}
