import React, { useCallback, useEffect, useState } from 'react';
import { LocationService } from '../../services/locationService';
import { formatDateTime } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';
import LocationMap from '../common/LocationMap';
import { MapPin, Clock, Navigation } from 'lucide-react';

const STATUS_KEYS = { live: 'locationStatusLive', recent: 'locationStatusRecent', offline: 'locationStatusOffline' };
const STATUS_COLORS = { live: 'var(--jade)', recent: 'var(--ember)', offline: 'var(--ink-faint)' };

// Read-only for the caregiver — RLS only allows this query to return rows
// for elders with an ACCEPTED connection to the caller, so there's no
// client-side gate needed on top of that to keep an unrelated elder's
// location out of reach.
export default function ElderLocationView({ elder }) {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [, forceTick] = useState(0);

  const load = useCallback(async () => {
    if (!elder?.id) { setIsLoading(false); return; }
    setIsLoading(true);
    setLoadError('');
    const result = await LocationService.getLatestLocation(elder.id);
    if (!result.ok) {
      setLoadError(t('adminLoadError'));
      setIsLoading(false);
      return;
    }
    setLocation(result.location);
    setIsLoading(false);
  }, [elder?.id, t]);

  useEffect(() => { load(); }, [load]);

  // Live-update the marker as new samples arrive, without a full refetch.
  useEffect(() => {
    if (!elder?.id) return undefined;
    return LocationService.subscribeToElderLocation(elder.id, (row) => setLocation(row));
  }, [elder?.id]);

  // The LIVE/RECENT/OFFLINE label is purely a function of elapsed time, so
  // it needs to advance even when no new location arrives.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (!elder) return null;

  if (isLoading) {
    return <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>{t('adminLoadingLabel')}</p>;
  }

  if (loadError) {
    return (
      <div className="notice-strip is-alert flex items-center justify-between gap-4">
        <p className="text-sm" style={{ color: 'var(--alert)' }}>{loadError}</p>
        <button type="button" onClick={load} className="btn btn-line shrink-0">{t('retry')}</button>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="panel-light p-8 sm:p-10 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(226,112,58,0.15)', color: 'var(--ember-deep)' }}>
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-display text-xl font-medium">{t('noLocationSharedYetTitle')}</h4>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(23,20,15,0.6)' }}>{t('noLocationSharedYetDesc')}</p>
        </div>
      </div>
    );
  }

  const status = LocationService.getLocationStatus(location);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: STATUS_COLORS[status] }}>
          <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
          {t(STATUS_KEYS[status])}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--ink-faint)' }}>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('lastUpdatedLabel')}: {formatDateTime(location.recorded_at)}</span>
          {typeof location.accuracy === 'number' && (
            <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> {t('accuracyLabel')}: {t('accuracyMetersValue').replace('{meters}', Math.round(location.accuracy))}</span>
          )}
        </div>
      </div>
      <LocationMap
        latitude={location.latitude}
        longitude={location.longitude}
        accuracy={location.accuracy}
        label={elder.fullName}
        recenterLabel={t('recenterMapLabel')}
        openInMapsLabel={t('openInMapsLabel')}
      />
    </div>
  );
}
