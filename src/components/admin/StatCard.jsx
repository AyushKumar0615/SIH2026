import React from 'react';
import { SkeletonLine } from '../common/Skeleton';

const TONE_STYLES = {
  ember: { background: 'var(--ember-soft)', color: 'var(--ember)' },
  sky: { background: 'var(--sky-soft)', color: 'var(--sky)' },
  violet: { background: 'var(--violet-soft)', color: 'var(--violet)' },
  jade: { background: 'var(--jade-soft)', color: 'var(--jade)' }
};

// One of the four top-row stat cards (Total Elders / Total Caregivers /
// Active Connections / Games Available). No trend arrows or sparklines are
// rendered here — the app has no historical/time-series data to compute a
// real percentage change or chart from, and fabricating one was explicitly
// out of scope.
export default function StatCard({ icon: Icon, tone = 'ember', value, label, isLoading }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-icon" style={TONE_STYLES[tone]}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        {isLoading ? (
          <>
            <SkeletonLine width="3rem" title />
            <div className="mt-1.5"><SkeletonLine width="6rem" /></div>
          </>
        ) : (
          <>
            <span className="admin-stat-value block">{value}</span>
            <span className="admin-stat-label block truncate">{label}</span>
          </>
        )}
      </div>
    </div>
  );
}
