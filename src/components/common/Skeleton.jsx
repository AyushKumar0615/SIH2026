import React from 'react';

// Content-shaped loading placeholders. Prefer these over a "Loading…" line:
// they hold the space the real content will occupy, so nothing jumps when it
// arrives, and they read as "this is coming" rather than "nothing here".
//
// The shimmer is pure CSS (see .skeleton in styles.css) and is flattened
// automatically by the global prefers-reduced-motion rule.

export function SkeletonLine({ width = '100%', title = false, className = '' }) {
  return (
    <span
      className={`skeleton skeleton-line ${title ? 'is-title' : ''} block ${className}`}
      style={{ width }}
    />
  );
}

export function SkeletonBlock({ height = '8rem', className = '' }) {
  return <span className={`skeleton skeleton-block block ${className}`} style={{ height }} />;
}

export function SkeletonCircle({ size = '3rem', className = '' }) {
  return <span className={`skeleton skeleton-circle block ${className}`} style={{ width: size, height: size }} />;
}

// A list of rows shaped like the app's standard "icon + two lines" list item.
export function SkeletonList({ rows = 3, label }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" aria-hidden="true">
          <SkeletonCircle size="2.75rem" />
          <div className="flex-1 min-w-0 space-y-2.5">
            <SkeletonLine width={`${72 - i * 8}%`} title />
            <SkeletonLine width={`${48 - i * 6}%`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Card-shaped placeholders for grid layouts (memories, game library).
export function SkeletonCards({ count = 3, height = '9rem', label }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} height={height} />
      ))}
    </div>
  );
}
