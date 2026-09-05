// Pan-Indian cultural datasets for the Cognitive Exercises / Game Library.
// Content is deliberately spread across North, South, East, West, Central and
// North-East India so no single region dominates. This file is the ONLY place
// game components read cultural content from — add new items/sequences here
// to extend regional coverage without touching any game's logic or UI.

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
// rounds (e.g. "find all festival objects").
export const CULTURAL_ITEMS = [
  { id: 'hampi', name: 'Hampi', tag: 'Landmark', region: REGIONS.SOUTH, icon: '🏛️' },
  { id: 'taj', name: 'Taj Mahal', tag: 'Landmark', region: REGIONS.NORTH, icon: '🕌' },
  { id: 'konark', name: 'Konark Sun Temple', tag: 'Landmark', region: REGIONS.EAST, icon: '☀️' },
  { id: 'gateway', name: 'Gateway of India', tag: 'Landmark', region: REGIONS.WEST, icon: '⛩️' },
  { id: 'sanchi', name: 'Sanchi Stupa', tag: 'Landmark', region: REGIONS.CENTRAL, icon: '🛕' },
  { id: 'kaziranga', name: 'Kaziranga', tag: 'Landmark', region: REGIONS.NORTHEAST, icon: '🦏' },

  { id: 'diwali', name: 'Diwali', tag: 'Festival', region: REGIONS.NORTH, icon: '🪔' },
  { id: 'onam', name: 'Onam', tag: 'Festival', region: REGIONS.SOUTH, icon: '🛶' },
  { id: 'durgapuja', name: 'Durga Puja', tag: 'Festival', region: REGIONS.EAST, icon: '🙏' },
  { id: 'navratri', name: 'Navratri', tag: 'Festival', region: REGIONS.WEST, icon: '🕺' },
  { id: 'pongal', name: 'Pongal', tag: 'Festival', region: REGIONS.SOUTH, icon: '🌾' },
  { id: 'bihu', name: 'Bihu', tag: 'Festival', region: REGIONS.NORTHEAST, icon: '🪘' },

  { id: 'kathak', name: 'Kathak', tag: 'Dance', region: REGIONS.NORTH, icon: '💃' },
  { id: 'bharatanatyam', name: 'Bharatanatyam', tag: 'Dance', region: REGIONS.SOUTH, icon: '🩰' },
  { id: 'garba', name: 'Garba', tag: 'Dance', region: REGIONS.WEST, icon: '🎊' },

  { id: 'warli', name: 'Warli Art', tag: 'Art', region: REGIONS.WEST, icon: '🖼️' },
  { id: 'pattachitra', name: 'Pattachitra', tag: 'Art', region: REGIONS.EAST, icon: '🎨' },
  { id: 'madhubani', name: 'Madhubani', tag: 'Art', region: REGIONS.EAST, icon: '🖌️' },
  { id: 'gondart', name: 'Gond Art', tag: 'Art', region: REGIONS.CENTRAL, icon: '🐘' },
  { id: 'tanjore', name: 'Tanjore Painting', tag: 'Art', region: REGIONS.SOUTH, icon: '🪞' },

  { id: 'phulkari', name: 'Phulkari', tag: 'Textile', region: REGIONS.NORTH, icon: '🧵' },
  { id: 'kalamkari', name: 'Kalamkari', tag: 'Textile', region: REGIONS.SOUTH, icon: '🧣' },
  { id: 'banarasi', name: 'Banarasi Silk', tag: 'Textile', region: REGIONS.NORTH, icon: '🥻' },

  { id: 'tabla', name: 'Tabla', tag: 'Instrument', region: REGIONS.NORTH, icon: '🥁' },
  { id: 'veena', name: 'Veena', tag: 'Instrument', region: REGIONS.SOUTH, icon: '🎻' },
  { id: 'pepa', name: 'Pepa', tag: 'Instrument', region: REGIONS.NORTHEAST, icon: '📯' },

  { id: 'jaapi', name: 'Jaapi', tag: 'Craft', region: REGIONS.NORTHEAST, icon: '🧢' },
  { id: 'pottery', name: 'Terracotta Pottery', tag: 'Craft', region: REGIONS.CENTRAL, icon: '🏺' },
  { id: 'bamboo', name: 'Bamboo Craft', tag: 'Craft', region: REGIONS.NORTHEAST, icon: '🎍' },
  { id: 'brasslamp', name: 'Brass Lamp', tag: 'Craft', region: REGIONS.SOUTH, icon: '🏮' },

  { id: 'sweets', name: 'Traditional Sweets', tag: 'Food', region: REGIONS.EAST, icon: '🍬' },
  { id: 'spices', name: 'Spice Basket', tag: 'Food', region: REGIONS.SOUTH, icon: '🌶️' },
  { id: 'thali', name: 'Regional Thali', tag: 'Food', region: REGIONS.WEST, icon: '🍛' }
];

export function itemsByTag(tag) {
  return CULTURAL_ITEMS.filter((item) => item.tag === tag);
}

// ─── Memory Market — a curated marketplace pool (visual + interactive) ────
export const MARKET_ITEMS = [
  { id: 'banarasi', name: 'Banarasi Silk', icon: '🥻' },
  { id: 'diya', name: 'Clay Diya', icon: '🪔' },
  { id: 'spices', name: 'Spice Basket', icon: '🌶️' },
  { id: 'brasslamp', name: 'Brass Lamp', icon: '🏮' },
  { id: 'bamboo', name: 'Bamboo Craft', icon: '🎍' },
  { id: 'pottery', name: 'Terracotta Pottery', icon: '🏺' },
  { id: 'sweets', name: 'Traditional Sweets', icon: '🍬' },
  { id: 'phulkari', name: 'Phulkari Dupatta', icon: '🧵' },
  { id: 'kalamkari', name: 'Kalamkari Cloth', icon: '🧣' },
  { id: 'jaapi', name: 'Jaapi Hat', icon: '🧢' },
  { id: 'warli', name: 'Warli Art Piece', icon: '🖼️' },
  { id: 'veena', name: 'Veena', icon: '🎻' }
];

// ─── Heritage Sequence — curated, objectively-ordered rounds ──────────────
export const HERITAGE_SEQUENCES = [
  {
    id: 'festival-year',
    title: 'Festivals Through the Year',
    prompt: 'Arrange these festivals in the order they are celebrated across the calendar year.',
    steps: [
      { id: 'seq-sankranti', label: 'Makar Sankranti / Pongal', note: 'January' },
      { id: 'seq-holi', label: 'Holi', note: 'March' },
      { id: 'seq-bihu', label: 'Rongali Bihu', note: 'April' },
      { id: 'seq-onam', label: 'Onam', note: 'August–September' },
      { id: 'seq-durgapuja', label: 'Durga Puja', note: 'October' },
      { id: 'seq-diwali', label: 'Diwali', note: 'October–November' }
    ]
  },
  {
    id: 'pattachitra-craft',
    title: 'Stages of a Pattachitra Painting',
    prompt: 'Arrange the traditional stages of creating a Pattachitra scroll painting in order.',
    steps: [
      { id: 'seq-canvas', label: 'Preparing the cloth canvas with tamarind paste' },
      { id: 'seq-chalk', label: 'Coating the canvas with chalk powder' },
      { id: 'seq-sketch', label: 'Sketching the outline by hand' },
      { id: 'seq-color', label: 'Filling in natural, mineral-based colors' },
      { id: 'seq-lacquer', label: 'Sealing the painting with a natural lacquer coat' }
    ]
  },
  {
    id: 'india-journey',
    title: 'A Journey Across India',
    prompt: 'Arrange these landmarks in order, travelling from the west coast to the east coast of India.',
    steps: [
      { id: 'seq-gateway', label: 'Gateway of India, Mumbai', note: 'West coast' },
      { id: 'seq-sanchi', label: 'Sanchi Stupa, Madhya Pradesh', note: 'Central India' },
      { id: 'seq-taj', label: 'Taj Mahal, Agra', note: 'North India' },
      { id: 'seq-khajuraho', label: 'Khajuraho Temples, Madhya Pradesh', note: 'Central India' },
      { id: 'seq-konark', label: 'Konark Sun Temple, Odisha', note: 'East coast' },
      { id: 'seq-kaziranga', label: 'Kaziranga National Park, Assam', note: 'North-East India' }
    ]
  },
  {
    id: 'weaving-craft',
    title: 'Stages of Handloom Weaving',
    prompt: 'Arrange the traditional stages of handloom textile weaving in order.',
    steps: [
      { id: 'seq-fibre', label: 'Spinning raw fibre into yarn' },
      { id: 'seq-dye', label: 'Dyeing the yarn with natural colors' },
      { id: 'seq-warp', label: 'Setting up the warp on the loom' },
      { id: 'seq-weave', label: 'Weaving the pattern thread by thread' },
      { id: 'seq-finish', label: 'Finishing and pressing the woven cloth' }
    ]
  }
];

// ─── Progressive difficulty ladder shared by every game ───────────────────
export const DIFFICULTY_LEVELS = [
  { level: 1, label: 'Familiar' },
  { level: 2, label: 'Focus' },
  { level: 3, label: 'Challenge' },
  { level: 4, label: 'Advanced' },
  { level: 5, label: 'Expert' }
];

export function difficultyLabel(level) {
  return DIFFICULTY_LEVELS.find((d) => d.level === level)?.label || 'Familiar';
}
