import React from 'react';
import { DIFFICULTY_LEVELS } from '../../../data/culturalContent';

export default function DifficultyIndicator({ level }) {
  const current = DIFFICULTY_LEVELS.find((d) => d.level === level) || DIFFICULTY_LEVELS[0];
  return (
    <div className="flex items-center gap-2" aria-label={`Difficulty: ${current.label}`}>
      <div className="flex items-center gap-1">
        {DIFFICULTY_LEVELS.map((d) => (
          <span
            key={d.level}
            className="rounded-full"
            style={{
              width: 6, height: 6,
              background: d.level <= level ? 'var(--ember)' : 'var(--hairline-strong)',
              transition: 'background-color var(--t-base) var(--ease)'
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>{current.label}</span>
    </div>
  );
}
