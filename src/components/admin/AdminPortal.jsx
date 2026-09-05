import React from 'react';
import ImpactDashboard from './ImpactDashboard';
import { CULTURAL_CATALOG } from '../../data/regionalContent';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { Shield, Server, Globe } from 'lucide-react';

export default function AdminPortal() {
  const { t } = useTranslation();
  const containerRef = useScrollReveal();

  const auditLogs = [
    { id: 'log_1', timestamp: '2026-08-27 09:45:10', user: 'Priya Devi (Caregiver)', action: 'Updated morning blood pressure medication schedule', ip: '157.33.20.14' },
    { id: 'log_2', timestamp: '2026-08-27 10:12:04', user: 'Kamala Devi (Elderly)', action: 'Completed Memory Trail game session (Score 95)', ip: '157.33.20.14' },
    { id: 'log_3', timestamp: '2026-08-26 16:30:22', user: 'Priya Devi (Caregiver)', action: 'Added memory entry: Rongali Bihu 2025 celebration photo', ip: '157.33.20.14' },
    { id: 'log_4', timestamp: '2026-08-25 11:00:15', user: 'Dr. R. Phukan (Admin)', action: 'Verified Assamese regional dictionary translation tokens', ip: '10.0.4.12' }
  ];

  return (
    <div ref={containerRef} className="page space-y-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 scroll-reveal" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <div>
          <span className="eyebrow">{t('platformGovernance')}</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium mt-3 leading-[0.98]">{t('systemHealthTitle')}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-sm font-semibold" style={{ color: 'var(--jade)' }}>
          <Server className="w-4.5 h-4.5 animate-soft-pulse" /> {t('allNodesOperational')}
        </div>
      </div>

      <div className="scroll-reveal" data-reveal-delay="1"><ImpactDashboard /></div>

      <div className="scroll-reveal" data-reveal-delay="2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-medium flex items-center gap-2.5"><Globe className="w-5 h-5" style={{ color: 'var(--jade)' }} /> {t('neRegionTitle')}</h2>
        </div>
        <div className="index-list">
          {Object.values(CULTURAL_CATALOG).map((st, idx) => (
            <div key={st.id} className="index-row !cursor-default">
              <span className="index-num">0{idx + 1}</span>
              <span className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                <span className="font-display text-lg font-medium">{st.name}</span>
                <span className="text-sm" style={{ color: 'var(--ink-faint)' }}>{st.language} · "{st.greeting}"</span>
                <span className="text-sm truncate" style={{ color: 'var(--jade)' }}>{st.crafts ? st.crafts.join(', ') : 'Standard'}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-reveal" data-reveal-delay="3">
        <h2 className="font-display text-2xl font-medium flex items-center gap-2.5 mb-6"><Shield className="w-5 h-5" style={{ color: 'var(--ember)' }} /> {t('auditTrailTitle')}</h2>
        <div className="data-table-wrap">
          <div className="overflow-x-auto">
            <table className="data-table text-sm">
              <thead><tr><th>{t('colTimestamp')}</th><th>{t('colUserRole')}</th><th>{t('colAction')}</th><th>{t('colIpAddress')}</th></tr></thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs whitespace-nowrap" style={{ color: 'rgba(23,20,15,0.5)' }}>{log.timestamp}</td>
                    <td className="font-semibold whitespace-nowrap">{log.user}</td>
                    <td style={{ color: 'rgba(23,20,15,0.6)' }}>{log.action}</td>
                    <td className="font-mono font-semibold whitespace-nowrap" style={{ color: 'var(--jade-deep)' }}>{log.ip}</td>
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
