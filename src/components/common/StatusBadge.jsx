import React from 'react';

// One status pill for the whole app — location LIVE/RECENT/OFFLINE, account
// active/inactive, connection accepted/pending/rejected. Previously each of
// those was hand-rolled with its own inline colours, which drifted apart and
// leaned on colour alone to carry meaning.
//
// Tone only ever *reinforces* the label: the text is always present, so the
// state is still readable without colour vision, and `dot` adds a shape cue.

const TONES = { jade: 'is-jade', ember: 'is-ember', alert: 'is-alert', muted: 'is-muted', neutral: '' };

export default function StatusBadge({ tone = 'neutral', children, dot = false, pulse = false, className = '' }) {
  return (
    <span className={`badge ${TONES[tone] ?? ''} ${className}`}>
      {dot && <span className={`badge-dot ${pulse ? 'is-pulsing' : ''}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

// Shared mapping so the location status pill looks identical wherever a
// caregiver or an admin sees it.
export const LOCATION_STATUS_TONES = { live: 'jade', recent: 'ember', offline: 'muted' };
