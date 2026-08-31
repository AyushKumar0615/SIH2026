// Realistic Seed Data for Kamala Devi (Elderly User) & Caregiver Priya Devi
export const MOCK_ELDERLY_USER = {
  id: 'usr_kamala_72',
  name: 'Kamala Devi',
  age: 72,
  gender: 'Female',
  location: 'Guwahati, Assam',
  primaryState: 'Assam',
  preferredLanguage: 'as',
  conditionSummary: 'Mild Cognitive Impairment (MCI) / Early Memory Support',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  caregiverName: 'Priya Devi',
  caregiverPhone: '+91 98640 12345',
  emergencyContacts: [
    { name: 'Priya Devi (Daughter)', relation: 'Primary Caregiver', phone: '+91 98640 12345', primary: true },
    { name: 'Dr. S. K. Sarma', relation: 'Family Physician', phone: '+91 98640 99887', primary: false },
    { name: 'Rahul Sharma (Son)', relation: 'Son (Tezpur)', phone: '+91 98640 55443', primary: false }
  ]
};

export const MOCK_PERSONAL_BASELINE = {
  elderlyId: 'usr_kamala_72',
  establishedDate: '2026-08-01',
  sampleSessionsCount: 28,
  domains: {
    memory: {
      avgAccuracyPercent: 82,
      avgResponseTimeSec: 42,
      typicalDifficulty: 'Medium',
      trend: 'Improving (+8%)'
    },
    attention: {
      avgAccuracyPercent: 78,
      avgResponseTimeSec: 35,
      typicalDifficulty: 'Medium',
      trend: 'Stable'
    },
    orientation: {
      avgAccuracyPercent: 90,
      avgResponseTimeSec: 28,
      typicalDifficulty: 'Easy',
      trend: 'High Accuracy'
    },
    language: {
      avgAccuracyPercent: 85,
      avgResponseTimeSec: 38,
      typicalDifficulty: 'Medium',
      trend: 'Stable'
    },
    logic: {
      avgAccuracyPercent: 74,
      avgResponseTimeSec: 50,
      typicalDifficulty: 'Easy',
      trend: 'Needs Encouragement'
    },
    visualSpatial: {
      avgAccuracyPercent: 80,
      avgResponseTimeSec: 45,
      typicalDifficulty: 'Medium',
      trend: 'Stable'
    }
  },
  overallEngagementMinutesPerDay: 35,
  completionRatePercent: 88
};

export const MOCK_FAMILY_MEMORIES = [
  {
    id: 'mem_1',
    name: 'Ananya Devi',
    relation: 'Granddaughter',
    age: 18,
    category: 'Family',
    description: 'Ananya is your loving granddaughter. She is studying Computer Science at Cotton University in Guwahati. She visits you every Sunday with homemade Pitha!',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    voiceNote: 'Ananya loves to sing Bihu songs with you on the verandah.',
    favoriteMemory: 'Rongali Bihu festival 2025 celebration together.'
  },
  {
    id: 'mem_2',
    name: 'Priya Devi',
    relation: 'Daughter (Caregiver)',
    age: 44,
    category: 'Family',
    description: 'Priya is your daughter who lives with you in Guwahati. She takes care of your daily routines, meals, and garden.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
    voiceNote: 'Priya makes your morning Assam Black Tea at 7:30 AM.',
    favoriteMemory: 'Family vacation to Kaziranga National Park.'
  },
  {
    id: 'mem_3',
    name: 'Rahul Sharma',
    relation: 'Son',
    age: 47,
    category: 'Family',
    description: 'Rahul is your elder son. He lives in Tezpur with his wife Rinku and works as a Senior Civil Engineer.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    voiceNote: 'Rahul calls you every evening at 6:00 PM.',
    favoriteMemory: 'Rahul’s marriage ceremony in Tezpur.'
  },
  {
    id: 'mem_4',
    name: 'Rongali Bihu 2025',
    relation: 'Festival & Joy',
    category: 'Festivals',
    description: 'Our entire family gathered in the courtyard. Ananya wore a yellow Muga silk Mekhela Chador and played the Pepa flute tune.',
    photoUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=500&q=80',
    voiceNote: 'Family Bihu dance memories.',
    favoriteMemory: 'Making Til Pitha and Ghila Pitha together.'
  },
  {
    id: 'mem_5',
    name: 'Guwahati Verandah Garden',
    relation: 'Favorite Place',
    category: 'Places',
    description: 'Your tranquil green verandah where you water orchids, marigolds, and tulsi plants every afternoon at 4:30 PM.',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80',
    voiceNote: 'The sound of birds in the morning tea time.',
    favoriteMemory: 'Morning sunshine with hot Assam tea.'
  }
];

export const MOCK_ROUTINE_SCHEDULE = [
  { id: 'r1', time: '08:00 AM', title: 'Breakfast & Morning Tea', category: 'Meals', icon: '🍵', completed: true, voicePrompt: 'Good morning! It is time for breakfast and hot Assam tea.' },
  { id: 'r2', time: '09:00 AM', title: 'Morning Blood Pressure Medicine', category: 'Medication', icon: '💊', completed: true, voicePrompt: 'Time to take 1 tablet of Telmisartan with water.' },
  { id: 'r3', time: '10:30 AM', title: '🧠 Play Bihu Cognitive Game', category: 'Activity', icon: '🧠', completed: false, voicePrompt: 'Time to keep your brain active! Play a quick memory game.' },
  { id: 'r4', time: '01:00 PM', title: 'Lunch & Fresh Fruit', category: 'Meals', icon: '🍛', completed: false, voicePrompt: 'Time for healthy lunch with fish curry and rice.' },
  { id: 'r5', time: '04:30 PM', title: 'Verandah Plant Care & Walk', category: 'Activity', icon: '🌱', completed: false, voicePrompt: 'Time to water your orchids on the verandah.' },
  { id: 'r6', time: '06:00 PM', title: '📞 Evening Call from Rahul', category: 'Family', icon: '📞', completed: false, voicePrompt: 'Rahul will be calling you now from Tezpur!' },
  { id: 'r7', time: '08:30 PM', title: 'Dinner & Evening Medicine', category: 'Medication', icon: '💊', completed: false, voicePrompt: 'Dinner time and evening multivitamin.' }
];

export const MOCK_GAME_SESSIONS = [
  { id: 'gs_1', date: '2026-08-27', time: '09:45 AM', gameName: 'Bihu Memory Pairs', domain: 'Memory', score: 95, accuracy: 92, responseTimeSec: 36, difficulty: 'Medium', mistakes: 1, adaptiveRecommendation: 'Maintain Medium difficulty' },
  { id: 'gs_2', date: '2026-08-26', time: '04:15 PM', gameName: 'Face & Relation Match', domain: 'Memory', score: 100, accuracy: 100, responseTimeSec: 28, difficulty: 'Medium', mistakes: 0, adaptiveRecommendation: 'Try Advanced level next' },
  { id: 'gs_3', date: '2026-08-26', time: '10:30 AM', gameName: 'NER Craft Focus', domain: 'Attention', score: 80, accuracy: 78, responseTimeSec: 44, difficulty: 'Medium', mistakes: 2, adaptiveRecommendation: 'Good steady focus' },
  { id: 'gs_4', date: '2026-08-25', time: '11:00 AM', gameName: 'Date & Time Orientation', domain: 'Orientation', score: 90, accuracy: 90, responseTimeSec: 30, difficulty: 'Easy', mistakes: 1, adaptiveRecommendation: 'High orientation score' },
  { id: 'gs_5', date: '2026-08-24', time: '03:30 PM', gameName: 'Picture Naming (Assamese)', domain: 'Language', score: 88, accuracy: 85, responseTimeSec: 39, difficulty: 'Medium', mistakes: 1, adaptiveRecommendation: 'Consistent fluency' }
];

export const MOCK_CAREGIVER_ALERTS = [
  {
    id: 'alt_1',
    timestamp: '2026-08-27 10:15 AM',
    severity: 'INFO',
    title: 'Morning Routine Completed',
    summary: 'Morning routine completed — breakfast & medicine on time.',
    explainableReason: 'Caregiver Priya verified completion within 15 minutes of scheduled time.'
  },
  {
    id: 'alt_2',
    timestamp: '2026-08-26 05:00 PM',
    severity: 'ATTENTION',
    title: 'Slight Change in Logic Game Speed',
    summary: 'Logic sorting game response time was 54s (personal baseline: 42s).',
    explainableReason: 'The AI identified a temporary 28% slowdown in response time during evening hours. Accuracy remained high (80%). Recommended check-in: Ensure user is not fatigued.'
  },
  {
    id: 'alt_3',
    timestamp: '2026-08-24 02:00 PM',
    severity: 'INFO',
    title: 'High Family Recognition Milestone',
    summary: '100% accuracy achieved in identifying granddaughter Ananya and son Rahul.',
    explainableReason: 'User correctly identified relationship and names in 28 seconds without hints.'
  }
];

export const MOCK_IMPACT_METRICS = {
  totalUsersSupported: 1420,
  nerStatesActive: 8,
  cognitiveGamesPlayed: 38450,
  memoryAssistanceQueries: 12900,
  caregiverCheckinsCount: 24800,
  avgEngagementMinutes: 34.5,
  baselineImprovementPercent: 14.2
};
