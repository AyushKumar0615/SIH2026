// Pan-Indian cultural datasets for the Cognitive Exercises / Game Library.
// Content is deliberately spread across North, South, East, West, Central and
// North-East India so no single region dominates. This file is the ONLY place
// game components read cultural content from — add new items/sequences here
// to extend regional coverage without touching any game's logic or UI.
//
// Every visible string here is a TRANSLATION KEY (nameKey/titleKey/labelKey/
// promptKey/noteKey), not raw English text — components must call t(key) at
// render time via useTranslation(). `id` and `tag` stay stable English
// identifiers used only for game logic (matching, grouping) and are never
// rendered directly.

export const REGIONS = {
  NORTH: 'North India',
  SOUTH: 'South India',
  EAST: 'East India',
  WEST: 'West India',
  CENTRAL: 'Central India',
  NORTHEAST: 'North-East India'
};

// Master catalog reused by Memory Trail, Cultural Grid, Memory Market and
// What Changed?. `tag` groups items by cultural type for instruction-driven
// rounds (e.g. "find all festival objects") — it is an internal identifier,
// never displayed, so it does not need a translation key.
export const CULTURAL_ITEMS = [
  { id: 'hampi', nameKey: 'ciHampi', tag: 'Landmark', region: REGIONS.SOUTH, icon: '🏛️' },
  { id: 'taj', nameKey: 'ciTaj', tag: 'Landmark', region: REGIONS.NORTH, icon: '🕌' },
  { id: 'konark', nameKey: 'ciKonark', tag: 'Landmark', region: REGIONS.EAST, icon: '☀️' },
  { id: 'gateway', nameKey: 'ciGateway', tag: 'Landmark', region: REGIONS.WEST, icon: '⛩️' },
  { id: 'sanchi', nameKey: 'ciSanchi', tag: 'Landmark', region: REGIONS.CENTRAL, icon: '🛕' },
  { id: 'kaziranga', nameKey: 'ciKaziranga', tag: 'Landmark', region: REGIONS.NORTHEAST, icon: '🦏' },

  { id: 'diwali', nameKey: 'ciDiwali', tag: 'Festival', region: REGIONS.NORTH, icon: '🪔' },
  { id: 'onam', nameKey: 'ciOnam', tag: 'Festival', region: REGIONS.SOUTH, icon: '🛶' },
  { id: 'durgapuja', nameKey: 'ciDurgapuja', tag: 'Festival', region: REGIONS.EAST, icon: '🙏' },
  { id: 'navratri', nameKey: 'ciNavratri', tag: 'Festival', region: REGIONS.WEST, icon: '🕺' },
  { id: 'pongal', nameKey: 'ciPongal', tag: 'Festival', region: REGIONS.SOUTH, icon: '🌾' },
  { id: 'bihu', nameKey: 'ciBihu', tag: 'Festival', region: REGIONS.NORTHEAST, icon: '🪘' },

  { id: 'kathak', nameKey: 'ciKathak', tag: 'Dance', region: REGIONS.NORTH, icon: '💃' },
  { id: 'bharatanatyam', nameKey: 'ciBharatanatyam', tag: 'Dance', region: REGIONS.SOUTH, icon: '🩰' },
  { id: 'garba', nameKey: 'ciGarba', tag: 'Dance', region: REGIONS.WEST, icon: '🎊' },

  { id: 'warli', nameKey: 'ciWarli', tag: 'Art', region: REGIONS.WEST, icon: '🖼️' },
  { id: 'pattachitra', nameKey: 'ciPattachitra', tag: 'Art', region: REGIONS.EAST, icon: '🎨' },
  { id: 'madhubani', nameKey: 'ciMadhubani', tag: 'Art', region: REGIONS.EAST, icon: '🖌️' },
  { id: 'gondart', nameKey: 'ciGondart', tag: 'Art', region: REGIONS.CENTRAL, icon: '🐘' },
  { id: 'tanjore', nameKey: 'ciTanjore', tag: 'Art', region: REGIONS.SOUTH, icon: '🪞' },

  { id: 'phulkari', nameKey: 'ciPhulkari', tag: 'Textile', region: REGIONS.NORTH, icon: '🧵' },
  { id: 'kalamkari', nameKey: 'ciKalamkari', tag: 'Textile', region: REGIONS.SOUTH, icon: '🧣' },
  { id: 'banarasi', nameKey: 'ciBanarasi', tag: 'Textile', region: REGIONS.NORTH, icon: '🥻' },

  { id: 'tabla', nameKey: 'ciTabla', tag: 'Instrument', region: REGIONS.NORTH, icon: '🥁' },
  { id: 'veena', nameKey: 'ciVeena', tag: 'Instrument', region: REGIONS.SOUTH, icon: '🎻' },
  { id: 'pepa', nameKey: 'ciPepa', tag: 'Instrument', region: REGIONS.NORTHEAST, icon: '📯' },

  { id: 'jaapi', nameKey: 'ciJaapi', tag: 'Craft', region: REGIONS.NORTHEAST, icon: '🧢' },
  { id: 'pottery', nameKey: 'ciPottery', tag: 'Craft', region: REGIONS.CENTRAL, icon: '🏺' },
  { id: 'bamboo', nameKey: 'ciBamboo', tag: 'Craft', region: REGIONS.NORTHEAST, icon: '🎍' },
  { id: 'brasslamp', nameKey: 'ciBrasslamp', tag: 'Craft', region: REGIONS.SOUTH, icon: '🏮' },

  { id: 'sweets', nameKey: 'ciSweets', tag: 'Food', region: REGIONS.EAST, icon: '🍬' },
  { id: 'spices', nameKey: 'ciSpices', tag: 'Food', region: REGIONS.SOUTH, icon: '🌶️' },
  { id: 'thali', nameKey: 'ciThali', tag: 'Food', region: REGIONS.WEST, icon: '🍛' }
];

export function itemsByTag(tag) {
  return CULTURAL_ITEMS.filter((item) => item.tag === tag);
}

// ─── Memory Market — a curated marketplace pool (visual + interactive) ────
export const MARKET_ITEMS = [
  { id: 'banarasi', nameKey: 'miBanarasi', icon: '🥻' },
  { id: 'diya', nameKey: 'miDiya', icon: '🪔' },
  { id: 'spices', nameKey: 'miSpices', icon: '🌶️' },
  { id: 'brasslamp', nameKey: 'miBrasslamp', icon: '🏮' },
  { id: 'bamboo', nameKey: 'miBamboo', icon: '🎍' },
  { id: 'pottery', nameKey: 'miPottery', icon: '🏺' },
  { id: 'sweets', nameKey: 'miSweets', icon: '🍬' },
  { id: 'phulkari', nameKey: 'miPhulkari', icon: '🧵' },
  { id: 'kalamkari', nameKey: 'miKalamkari', icon: '🧣' },
  { id: 'jaapi', nameKey: 'miJaapi', icon: '🧢' },
  { id: 'warli', nameKey: 'miWarli', icon: '🖼️' },
  { id: 'veena', nameKey: 'miVeena', icon: '🎻' }
];

// ─── Heritage Sequence — curated, objectively-ordered rounds ──────────────
export const HERITAGE_SEQUENCES = [
  {
    id: 'festival-year',
    titleKey: 'seqFestivalYearTitle',
    promptKey: 'seqFestivalYearPrompt',
    steps: [
      { id: 'seq-sankranti', labelKey: 'seqSankrantiLabel', noteKey: 'seqSankrantiNote' },
      { id: 'seq-holi', labelKey: 'seqHoliLabel', noteKey: 'seqHoliNote' },
      { id: 'seq-bihu', labelKey: 'seqBihuLabel', noteKey: 'seqBihuNote' },
      { id: 'seq-onam', labelKey: 'seqOnamLabel', noteKey: 'seqOnamNote' },
      { id: 'seq-durgapuja', labelKey: 'seqDurgapujaLabel', noteKey: 'seqDurgapujaNote' },
      { id: 'seq-diwali', labelKey: 'seqDiwaliLabel', noteKey: 'seqDiwaliNote' }
    ]
  },
  {
    id: 'pattachitra-craft',
    titleKey: 'seqPattachitraCraftTitle',
    promptKey: 'seqPattachitraCraftPrompt',
    steps: [
      { id: 'seq-canvas', labelKey: 'seqCanvasLabel' },
      { id: 'seq-chalk', labelKey: 'seqChalkLabel' },
      { id: 'seq-sketch', labelKey: 'seqSketchLabel' },
      { id: 'seq-color', labelKey: 'seqColorLabel' },
      { id: 'seq-lacquer', labelKey: 'seqLacquerLabel' }
    ]
  },
  {
    id: 'india-journey',
    titleKey: 'seqIndiaJourneyTitle',
    promptKey: 'seqIndiaJourneyPrompt',
    steps: [
      { id: 'seq-gateway', labelKey: 'seqGatewayLabel', noteKey: 'seqGatewayNote' },
      { id: 'seq-sanchi', labelKey: 'seqSanchiLabel', noteKey: 'seqSanchiNote' },
      { id: 'seq-taj', labelKey: 'seqTajLabel', noteKey: 'seqTajNote' },
      { id: 'seq-khajuraho', labelKey: 'seqKhajurahoLabel', noteKey: 'seqKhajurahoNote' },
      { id: 'seq-konark', labelKey: 'seqKonarkLabel', noteKey: 'seqKonarkNote' },
      { id: 'seq-kaziranga', labelKey: 'seqKazirangaLabel', noteKey: 'seqKazirangaNote' }
    ]
  },
  {
    id: 'weaving-craft',
    titleKey: 'seqWeavingCraftTitle',
    promptKey: 'seqWeavingCraftPrompt',
    steps: [
      { id: 'seq-fibre', labelKey: 'seqFibreLabel' },
      { id: 'seq-dye', labelKey: 'seqDyeLabel' },
      { id: 'seq-warp', labelKey: 'seqWarpLabel' },
      { id: 'seq-weave', labelKey: 'seqWeaveLabel' },
      { id: 'seq-finish', labelKey: 'seqFinishLabel' }
    ]
  }
];

// ─── Progressive difficulty ladder shared by every game ───────────────────
export const DIFFICULTY_LEVELS = [
  { level: 1, labelKey: 'difficultyLevelFamiliar' },
  { level: 2, labelKey: 'difficultyLevelFocus' },
  { level: 3, labelKey: 'difficultyLevelChallenge' },
  { level: 4, labelKey: 'difficultyLevelAdvanced' },
  { level: 5, labelKey: 'difficultyLevelExpert' }
];

// Returns a translation KEY (not display text) — callers must wrap with t().
export function difficultyLabelKey(level) {
  return DIFFICULTY_LEVELS.find((d) => d.level === level)?.labelKey || 'difficultyLevelFamiliar';
}
