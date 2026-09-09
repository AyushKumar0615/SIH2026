import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';
import { SkeletonList } from '../common/Skeleton';

// The four headline numbers (Total Elders / Total Caregivers / Active
// Connections / Games Available) moved to the dashboard's own stat-card row
// to match the reference layout — this section keeps the *rest* of what
// AdminService.getPlatformStats() already returns (total/active/inactive
// users, regions active, total memories) so that data isn't lost, just
// repositioned into a dedicated Analytics card lower on the page.
export default function ImpactDashboard({ refreshSignal = 0 }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const result = await AdminService.getPlatformStats();
    if (!result.ok) {
      setError(t('adminLoadError'));
      setIsLoading(false);
      return;
    }
    setStats(result.stats);
    setIsLoading(false);
  }, [t, refreshSignal]);

  useEffect(() => {
    load();
  }, [load]);

  const tiles = stats && [
    { labelKey: 'statTotalUsers', value: stats.totalUsers.toLocaleString() },
    { labelKey: 'statActiveUsers', value: stats.activeUsers.toLocaleString() },
    { labelKey: 'statInactiveUsers', value: stats.inactiveUsers.toLocaleString() },
    { labelKey: 'statNerStates', value: stats.regionsActive.toLocaleString() },
    { labelKey: 'statMemoriesRecorded', value: stats.totalMemories.toLocaleString() }
  ];

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="flex items-start gap-3.5">
          <span className="admin-card-icon"><BarChart3 className="w-5 h-5" /></span>
          <div>
            <h2 className="admin-card-title">{t('adminAnalyticsTitle')}</h2>
            <p className="admin-card-subtitle">{t('adminAnalyticsSubtitle')}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonList rows={2} label={t('adminLoadingLabel')} />
      ) : error ? (
        <div className="notice-strip is-alert flex items-center justify-between gap-4">
          <p className="text-sm text-alert">{error}</p>
          <button type="button" onClick={load} className="btn btn-line shrink-0">{t('retry')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {tiles.map((s) => (
            <div key={s.labelKey} className="figure">
              <span className="figure-label">{t(s.labelKey)}</span>
              <span className="figure-value text-ember">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
