import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ImpactDashboard from './ImpactDashboard';
import { CULTURAL_CATALOG } from '../../data/regionalContent';
import { AdminService, formatDateTime } from '../../services/adminService';
import { LocationService } from '../../services/locationService';
import LocationMap from '../common/LocationMap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import ConfirmDialog from '../common/ConfirmDialog';
import InlineNotice from '../common/InlineNotice';
import {
  Shield, Server, Globe, Users, HeartPulse, LayoutDashboard, ChevronDown,
  Search, UserCheck, UserX, Link2, MapPin, Clock, Navigation
} from 'lucide-react';

const ROLE_LABEL_KEYS = { elderly: 'modeElderlyLabel', caregiver: 'modeCaregiverLabel', admin: 'modeAdminLabel' };
const ROLE_ICONS = { elderly: HeartPulse, caregiver: LayoutDashboard, admin: Shield };
const CONNECTION_STATUS_KEYS = { pending: 'pendingApprovalNotice', accepted: 'statusAcceptedLabel', rejected: 'statusRejectedLabel' };
const LOCATION_STATUS_KEYS = { live: 'locationStatusLive', recent: 'locationStatusRecent', offline: 'locationStatusOffline' };
const LOCATION_STATUS_COLORS = { live: 'var(--jade)', recent: 'var(--ember)', offline: 'var(--ink-faint)' };

export default function AdminPortal() {
  const { t } = useTranslation();
  const containerRef = useScrollReveal();

  // Bumped after a user-management mutation (activate/deactivate,
  // disconnect) so the dashboard counters above refetch without a
  // full page reload.
  const [statsVersion, setStatsVersion] = useState(0);
  const bumpStats = useCallback(() => setStatsVersion((v) => v + 1), []);

  const [activity, setActivity] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState('');

  const loadActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    setActivityError('');
    const result = await AdminService.getRecentActivity();
    if (!result.ok) {
      setActivityError(t('adminLoadError'));
      setIsLoadingActivity(false);
      return;
    }
    setActivity(result.events);
    setIsLoadingActivity(false);
  }, [t]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const describeEvent = (event) => {
    if (event.kind === 'reminder') return t('activityAddedReminder').replace('{title}', event.title);
    if (event.kind === 'memory') return t('activityAddedMemory').replace('{title}', event.title);
    return t('activityConnectionAccepted').replace('{caregiver}', event.caregiverName).replace('{elder}', event.elderName);
  };

  const roleLabelFor = (actor) => {
    if (!actor) return '';
    const key = ROLE_LABEL_KEYS[(actor.role || '').trim().toLowerCase()];
    return key ? t(key) : actor.role;
  };

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

      <div className="scroll-reveal" data-reveal-delay="1"><ImpactDashboard refreshSignal={statsVersion} /></div>

      <div className="scroll-reveal" data-reveal-delay="2">
        <UserManagementSection t={t} onMutation={bumpStats} />
      </div>

      <div className="scroll-reveal" data-reveal-delay="3">
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

      <div className="scroll-reveal" data-reveal-delay="4">
        <h2 className="font-display text-2xl font-medium flex items-center gap-2.5 mb-6"><Shield className="w-5 h-5" style={{ color: 'var(--ember)' }} /> {t('auditTrailTitle')}</h2>
        {isLoadingActivity ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>{t('adminLoadingLabel')}</p>
        ) : activityError ? (
          <div className="notice-strip is-alert flex items-center justify-between gap-4">
            <p className="text-sm" style={{ color: 'var(--alert)' }}>{activityError}</p>
            <button type="button" onClick={loadActivity} className="btn btn-line shrink-0">{t('retry')}</button>
          </div>
        ) : activity.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>{t('noActivityYet')}</p>
        ) : (
          <div className="data-table-wrap">
            <div className="overflow-x-auto">
              <table className="data-table text-sm">
                <thead><tr><th>{t('colTimestamp')}</th><th>{t('colUserRole')}</th><th>{t('colAction')}</th></tr></thead>
                <tbody>
                  {activity.map((event) => (
                    <tr key={event.id}>
                      <td className="font-mono text-xs whitespace-nowrap" style={{ color: 'rgba(23,20,15,0.5)' }}>{formatDateTime(event.timestamp)}</td>
                      <td className="font-semibold whitespace-nowrap">{event.actor?.full_name}{event.actor ? ` (${roleLabelFor(event.actor)})` : ''}</td>
                      <td style={{ color: 'rgba(23,20,15,0.6)' }}>{describeEvent(event)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserManagementSection({ t, onMutation }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [disconnectTarget, setDisconnectTarget] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    const result = await AdminService.listUsers({ search, roleFilter, statusFilter, page });
    if (!result.ok) {
      setLoadError(t('adminLoadError'));
      setIsLoading(false);
      return;
    }
    setUsers(result.users);
    setTotal(result.total);
    setPageSize(result.pageSize);
    setIsLoading(false);
  }, [search, roleFilter, statusFilter, page, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset to page 0 whenever a filter changes, so a narrower result set
  // never leaves the view stuck on a now-empty later page.
  useEffect(() => {
    setPage(0);
  }, [search, roleFilter, statusFilter]);

  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const toggleUserActive = async (user) => {
    const result = await AdminService.setUserActive(user.id, !user.is_active);
    if (!result.ok) {
      setNotice({ tone: 'error', message: t('adminActionError') });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)));
    setNotice({ tone: 'success', message: t(user.is_active ? 'userDeactivatedNotice' : 'userActivatedNotice') });
    onMutation?.();
  };

  const confirmDisconnect = async () => {
    if (!disconnectTarget) return;
    const result = await AdminService.disconnectConnection(disconnectTarget.id);
    setDisconnectTarget(null);
    if (!result.ok) {
      setNotice({ tone: 'error', message: t('adminActionError') });
      return;
    }
    setNotice({ tone: 'info', message: t('connectionRemovedNotice') });
    onMutation?.();
    setDetailRefreshKey((k) => k + 1);
  };

  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, page * pageSize + pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-medium flex items-center gap-2.5"><Users className="w-5 h-5" style={{ color: 'var(--ember)' }} /> {t('userManagementTitle')}</h2>
      </div>

      <InlineNotice tone={notice?.tone} message={notice?.message} onDismiss={() => setNotice(null)} />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-faint)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchUsersPlaceholder')}
            className="input !pl-6"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select sm:!w-48">
          <option value="">{t('allRolesOption')}</option>
          <option value="elderly">{t('modeElderlyLabel')}</option>
          <option value="caregiver">{t('modeCaregiverLabel')}</option>
          <option value="admin">{t('modeAdminLabel')}</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select sm:!w-48">
          <option value="">{t('allStatusesOption')}</option>
          <option value="active">{t('statusActiveLabel')}</option>
          <option value="inactive">{t('statusInactiveLabel')}</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>{t('adminLoadingLabel')}</p>
      ) : loadError ? (
        <div className="notice-strip is-alert flex items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--alert)' }}>{loadError}</p>
          <button type="button" onClick={loadUsers} className="btn btn-line shrink-0">{t('retry')}</button>
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>{t('noUsersFoundLabel')}</p>
      ) : (
        <>
          <div className="index-list">
            {users.map((user) => {
              const RoleIcon = ROLE_ICONS[(user.role || '').trim().toLowerCase()] || Users;
              const isExpanded = expandedId === user.id;
              return (
                <div key={user.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className="index-row"
                    aria-expanded={isExpanded}
                  >
                    <span className="index-icon"><RoleIcon className="w-4.5 h-4.5" /></span>
                    <span className="flex-1 min-w-0 text-left">
                      <span className="font-display text-lg font-medium block truncate">{user.full_name || '—'}</span>
                      <span className="text-sm block mt-0.5" style={{ color: 'var(--ink-faint)' }}>
                        {t(ROLE_LABEL_KEYS[(user.role || '').trim().toLowerCase()] || 'modeCaregiverLabel')} · {user.state || '—'} ·{' '}
                        <span style={{ color: user.is_active === false ? 'var(--alert)' : 'var(--jade)' }}>
                          {t(user.is_active === false ? 'statusInactiveLabel' : 'statusActiveLabel')}
                        </span>
                      </span>
                    </span>
                    <ChevronDown className="index-arrow w-5 h-5 shrink-0" style={{ opacity: 1, transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <ExpandedUserDetail
                          user={user}
                          t={t}
                          refreshKey={detailRefreshKey}
                          onToggleActive={() => toggleUserActive(user)}
                          onRequestDisconnect={(conn) => setDisconnectTarget(conn)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              {t('showingRangeLabel').replace('{from}', from).replace('{to}', to).replace('{total}', total)}
            </span>
            <div className="flex items-center gap-2.5">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn btn-quiet">{t('prevPageLabel')}</button>
              <button type="button" disabled={to >= total} onClick={() => setPage((p) => p + 1)} className="btn btn-quiet">{t('nextPageLabel')}</button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!disconnectTarget}
        title={t('adminDisconnectConfirmTitle')}
        message={t('adminDisconnectConfirmMessage')}
        confirmLabel={t('disconnectLabel')}
        onConfirm={confirmDisconnect}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}

function ExpandedUserDetail({ user, t, refreshKey, onToggleActive, onRequestDisconnect }) {
  const [counts, setCounts] = useState(null);
  const [connections, setConnections] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const role = (user.role || '').trim().toLowerCase();
  const isElder = role === 'elderly';

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      AdminService.getUserActivityCounts(user.id),
      AdminService.getUserConnections(user.id),
      isElder ? LocationService.getLatestLocation(user.id) : Promise.resolve({ ok: true, location: null })
    ]).then(([countsRes, connRes, locationRes]) => {
      if (cancelled) return;
      setCounts(countsRes.ok ? countsRes : null);
      setConnections(connRes.ok ? connRes : null);
      setLocation(locationRes.ok ? locationRes.location : null);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [user.id, isElder, refreshKey]);

  const relevantConnections = role === 'elderly' ? connections?.asElder : role === 'caregiver' ? connections?.asCaregiver : [];
  const relationshipLabelKey = role === 'elderly' ? 'relationshipsAsElderLabel' : 'relationshipsAsCaregiverLabel';
  const locationStatus = LocationService.getLocationStatus(location);

  return (
    <div className="well p-5 mb-2 space-y-5">
      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>{t('adminLoadingLabel')}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-8">
            <div className="figure">
              <span className="figure-label">{t('reminderCountLabel')}</span>
              <span className="figure-value" style={{ fontSize: '1.4rem' }}>{counts?.reminderCount ?? 0}</span>
            </div>
            <div className="figure">
              <span className="figure-label">{t('memoryCountLabel')}</span>
              <span className="figure-value" style={{ fontSize: '1.4rem' }}>{counts?.memoryCount ?? 0}</span>
            </div>
            <div className="figure">
              <span className="figure-label">{t('joinedLabel')}</span>
              <span className="text-sm font-medium block mt-1">{formatDateTime(user.created_at)}</span>
            </div>
            {user.role === 'elderly' && user.connection_code && (
              <div className="figure">
                <span className="figure-label">{t('connectionCodeFieldLabel')}</span>
                <span className="font-mono text-sm font-semibold block mt-1">{user.connection_code}</span>
              </div>
            )}
            <button type="button" onClick={onToggleActive} className="btn btn-line shrink-0 ml-auto">
              {user.is_active === false ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              {t(user.is_active === false ? 'activateUserLabel' : 'deactivateUserLabel')}
            </button>
          </div>

          {role !== 'admin' && (
            <div>
              <span className="figure-label flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> {t(relationshipLabelKey)}</span>
              {!relevantConnections || relevantConnections.length === 0 ? (
                <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>{t('noConnectionsLabel')}</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {relevantConnections.map((conn) => (
                    <div key={conn.id} className="flex items-center justify-between gap-4 text-sm py-2" style={{ borderTop: '1px solid var(--hairline)' }}>
                      <span className="min-w-0 truncate">
                        {conn.other?.full_name || '—'}{' '}
                        <span style={{ color: conn.status === 'accepted' ? 'var(--jade)' : conn.status === 'rejected' ? 'var(--alert)' : 'var(--ember)' }}>
                          ({t(CONNECTION_STATUS_KEYS[conn.status] || 'pendingApprovalNotice')})
                        </span>
                      </span>
                      {conn.status === 'accepted' && (
                        <button type="button" onClick={() => onRequestDisconnect(conn)} className="btn btn-quiet shrink-0" style={{ color: 'var(--alert)' }}>
                          {t('disconnectLabel')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isElder && (
            <div>
              <span className="figure-label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t('elderLocationTitle')}</span>
              {!location ? (
                <p className="text-sm mt-2" style={{ color: 'var(--ink-faint)' }}>{t('noLocationSharedYetDesc')}</p>
              ) : (
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span className="flex items-center gap-2 font-semibold" style={{ color: LOCATION_STATUS_COLORS[locationStatus] }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: LOCATION_STATUS_COLORS[locationStatus] }} />
                      {t(LOCATION_STATUS_KEYS[locationStatus])}
                    </span>
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--ink-faint)' }}><Clock className="w-3.5 h-3.5" /> {t('lastUpdatedLabel')}: {formatDateTime(location.recorded_at)}</span>
                    {typeof location.accuracy === 'number' && (
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--ink-faint)' }}><Navigation className="w-3.5 h-3.5" /> {t('accuracyLabel')}: {t('accuracyMetersValue').replace('{meters}', Math.round(location.accuracy))}</span>
                    )}
                  </div>
                  <LocationMap
                    latitude={location.latitude}
                    longitude={location.longitude}
                    accuracy={location.accuracy}
                    label={user.full_name}
                    recenterLabel={t('recenterMapLabel')}
                    openInMapsLabel={t('openInMapsLabel')}
                    height="12rem"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
