import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CULTURAL_ITEMS, MARKET_ITEMS, HERITAGE_SEQUENCES } from '../../../data/culturalContent';
import { useTranslation } from '../../../hooks/useTranslation';

// Purely decorative, static previews of each game's mechanic for the Game
// Library cards/featured panel/intro screen. These read fixed slices of the
// existing datasets for visual flavor only — never used by real gameplay.

function findItems(ids) {
  return ids.map((id) => CULTURAL_ITEMS.find((i) => i.id === id)).filter(Boolean);
}

const TRAIL_SAMPLE = findItems(['hampi', 'diwali', 'pattachitra']);
const GRID_SAMPLE = findItems(['jaapi', 'warli', 'tabla', 'sweets', 'diwali', 'konark', 'kalamkari', 'bihu']);
const MARKET_SAMPLE = MARKET_ITEMS.slice(0, 4);
const SEQUENCE_SAMPLE = HERITAGE_SEQUENCES[0].steps.slice(0, 3);
const CHANGE_BEFORE = findItems(['taj', 'onam', 'pottery', 'veena']);

function TrailPreview() {
  return (
    <div className="game-preview">
      {TRAIL_SAMPLE.map((item, idx) => (
        <React.Fragment key={item.id}>
          {idx > 0 && <ArrowRight className="gp-arrow" />}
          <span className="gp-chip">{item.icon}</span>
        </React.Fragment>
      ))}
      <ArrowRight className="gp-arrow" />
      <span className="gp-chip is-ghost">?</span>
    </div>
  );
}

function GridPreview() {
  return (
    <div className="gp-grid">
      {GRID_SAMPLE.map((item, idx) => (
        <span key={item.id} className={`gp-chip ${idx === 4 ? 'is-target' : ''}`}>{item.icon}</span>
      ))}
    </div>
  );
}

function MarketPreview() {
  return (
    <div className="game-preview">
      {MARKET_SAMPLE.map((item, idx) => (
        <span key={item.id} className={`gp-chip ${idx === 2 ? 'is-ghost' : ''}`}>{item.icon}</span>
      ))}
    </div>
  );
}

function SequencePreview() {
  const { t } = useTranslation();
  return (
    <div className="gp-seq">
      {SEQUENCE_SAMPLE.map((step, idx) => (
        <React.Fragment key={step.id}>
          {idx > 0 && <ArrowRight className="gp-arrow shrink-0" />}
          <span className="gp-seq-chip">{t(step.labelKey)}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function ChangePreview() {
  return (
    <div className="gp-split">
      <div className="gp-split-grid">
        {CHANGE_BEFORE.map((item) => <span key={item.id} className="gp-chip">{item.icon}</span>)}
      </div>
      <span className="gp-split-divider">→</span>
      <div className="gp-split-grid">
        {CHANGE_BEFORE.map((item, idx) => (
          <span key={item.id} className={`gp-chip ${idx === 1 ? 'is-target' : ''}`}>{idx === 1 ? '?' : item.icon}</span>
        ))}
      </div>
    </div>
  );
}

const PREVIEWS = {
  trail: TrailPreview,
  grid: GridPreview,
  market: MarketPreview,
  sequence: SequencePreview,
  changed: ChangePreview
};

export default function GamePreview({ gameId, size = 'sm' }) {
  const Preview = PREVIEWS[gameId];
  if (!Preview) return null;
  return (
    <div className={`game-preview-stage ${size === 'lg' ? 'game-preview-lg' : ''}`}>
      <Preview />
    </div>
  );
}
