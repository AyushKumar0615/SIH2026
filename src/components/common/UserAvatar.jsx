import React from 'react';
import { User } from 'lucide-react';

// A small, tasteful, diverse set of elderly-friendly avatars.
// Stored as "preset:<id>" on the user record — never a real photo.
export const AVATAR_PRESETS = [
  { id: 'p1', emoji: '👵🏽', bg: 'var(--ember-soft)', fg: 'var(--ember-deep)' },
  { id: 'p2', emoji: '👴🏻', bg: 'var(--jade-soft)', fg: 'var(--jade-deep)' },
  { id: 'p3', emoji: '👵🏻', bg: 'var(--jade-soft)', fg: 'var(--jade-deep)' },
  { id: 'p4', emoji: '👴🏾', bg: 'var(--ember-soft)', fg: 'var(--ember-deep)' },
  { id: 'p5', emoji: '👩🏿‍🦳', bg: 'var(--jade-soft)', fg: 'var(--jade-deep)' },
  { id: 'p6', emoji: '👨🏼‍🦳', bg: 'var(--ember-soft)', fg: 'var(--ember-deep)' }
];

export function getPreset(avatar) {
  if (!avatar || !avatar.startsWith('preset:')) return null;
  return AVATAR_PRESETS.find((p) => p.id === avatar.slice(7)) || null;
}

export function isPhotoAvatar(avatar) {
  return !!avatar && avatar.startsWith('data:image');
}

/**
 * Renders wherever the current user's avatar appears: a real photo
 * (camera/upload), a preset emoji avatar, or — if none was chosen —
 * a neutral initials/icon fallback. Never a random person's photo.
 */
export default function UserAvatar({ avatar, fullName, className = '', style = {}, iconClassName = 'w-1/2 h-1/2' }) {
  if (isPhotoAvatar(avatar)) {
    return <img src={avatar} alt={fullName || 'Your profile picture'} className={className} style={style} />;
  }

  const preset = getPreset(avatar);
  if (preset) {
    return (
      <div
        className={`grid place-items-center ${className}`}
        style={{ background: preset.bg, color: preset.fg, fontSize: '55%', lineHeight: 1, ...style }}
        role="img"
        aria-label={fullName || 'Your profile picture'}
      >
        <span aria-hidden="true">{preset.emoji}</span>
      </div>
    );
  }

  const initial = fullName?.trim()?.charAt(0)?.toUpperCase();
  return (
    <div
      className={`grid place-items-center ${className}`}
      style={{ background: 'var(--canvas-raised)', color: 'var(--ink-soft)', border: '1px solid var(--hairline-strong)', ...style }}
      role="img"
      aria-label={fullName || 'Guest'}
    >
      {initial ? <span className="font-semibold">{initial}</span> : <User className={iconClassName} />}
    </div>
  );
}
