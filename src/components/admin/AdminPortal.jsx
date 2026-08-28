import React from 'react';
import ImpactDashboard from './ImpactDashboard';
import { CULTURAL_CATALOG } from '../../data/regionalContent';
import { Shield, Server, Globe } from 'lucide-react';

export default function AdminPortal() {
  const auditLogs = [
    { id: 'log_1', timestamp: '2026-08-27 09:45:10', user: 'Priya Devi (Caregiver)', action: 'Updated morning blood pressure medication schedule', ip: '157.33.20.14' },
    { id: 'log_2', timestamp: '2026-08-27 10:12:04', user: 'Kamala Devi (Elderly)', action: 'Completed Bihu Memory Pairs game session (Score 95)', ip: '157.33.20.14' },
    { id: 'log_3', timestamp: '2026-08-26 16:30:22', user: 'Priya Devi (Caregiver)', action: 'Added memory entry: Rongali Bihu 2025 celebration photo', ip: '157.33.20.14' },
    { id: 'log_4', timestamp: '2026-08-25 11:00:15', user: 'Dr. R. Phukan (Admin)', action: 'Verified Assamese regional dictionary translation tokens', ip: '10.0.4.12' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-fade-in">
      <div className="glass-card p-6 border-2 border-purple-500/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="badge badge-teal mb-1">Platform Administrator</span>
            <h2 className="text-3xl font-black text-white">SmritiSetu System Health & Content Portal</h2>
            <p className="text-sm text-slate-300 font-medium">Managing regional localization, access control, and audit logs</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Server className="w-5 h-5" /> All Services Operational
            </div>
          </div>
        </div>
      </div>

      <ImpactDashboard />

      <div className="glass-card p-6 border border-slate-700 space-y-4">
        <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-teal-400" /> North Eastern Region (8 States) Content Catalog
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(CULTURAL_CATALOG).map((st) => (
            <div key={st.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-lg">{st.name}</h4>
                <span className="badge badge-amber text-xs">{st.language}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Greeting: {st.greeting}</p>
              <div className="text-xs text-teal-300 font-semibold">
                Crafts: {st.crafts ? st.crafts.join(', ') : 'Standard'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border border-slate-700 space-y-4">
        <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" /> RBAC Security & Privacy Audit Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-slate-400 font-extrabold border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User & Role</th>
                <th className="p-3">Action Description</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="p-3 text-slate-400">{log.timestamp}</td>
                  <td className="p-3 font-bold text-white">{log.user}</td>
                  <td className="p-3 text-slate-200">{log.action}</td>
                  <td className="p-3 font-mono text-teal-300">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
