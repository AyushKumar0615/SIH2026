import React, { useCallback, useEffect, useState } from 'react';
import { AdminService } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';
import { SkeletonList } from '../common/Skeleton';

// refreshSignal: bump this from a parent after a mutation elsewhere on the
// page (e.g. activating/deactivating a user) so these counters don't go
// stale without requiring a full page reload.
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
    { labelKey: 'statTotalUsers', value: stats.totalUsers.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statActiveUsers', value: stats.activeUsers.toLocaleString(), color: 'var(--ember)' },
    { labelKey: 'statInactiveUsers', value: stats.inactiveUsers.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statNerStates', value: stats.regionsActive.toLocaleString(), color: 'var(--ember)' },
    { labelKey: 'statEldersSupported', value: stats.totalElders.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statCaregiversActive', value: stats.totalCaregivers.toLocaleString(), color: 'var(--ember)' },
    { labelKey: 'statMemoriesRecorded', value: stats.totalMemories.toLocaleString(), color: 'var(--jade)' },
    { labelKey: 'statActiveConnections', value: stats.activeConnections.toLocaleString(), color: 'var(--ember)' }
  ];

  return (
    <div>
      <span className="eyebrow">{t('sihPitchMetrics')}</span>
      <h2 className="font-display text-3xl md:text-4xl font-medium mt-3 mb-8">{t('regionalImpactTitle')}</h2>

      {isLoading ? (
        <SkeletonList rows={2} label={t('adminLoadingLabel')} />
      ) : error ? (
        <div className="notice-strip is-alert flex items-center justify-between gap-4">
          <p className="text-sm text-alert">{error}</p>
          <button type="button" onClick={load} className="btn btn-line shrink-0">{t('retry')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" style={{ borderTop: '1px solid var(--hairline)', paddingTop: '2rem' }}>
          {tiles.map((s) => (
            <div key={s.labelKey} className="figure">
              <span className="figure-label">{t(s.labelKey)}</span>
              <span className="figure-value" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
