import React from 'react';

export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-track rounded-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}
