// Multilingual localization dictionary
import { CULTURAL_CATALOG, NER_STATES } from '../data/regionalContent';

export const LANGUAGES = {
  AS: { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
  HI: { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  EN: { code: 'en', name: 'English', flag: '🇬🇧' },
  MN: { code: 'mn', name: 'মণিপুর (Manipuri)', flag: '🇮🇳' },
  KS: { code: 'ks', name: 'Khasi', flag: '🇮🇳' },
  MZ: { code: 'mz', name: 'Mizo', flag: '🇮🇳' },
  BD: { code: 'bd', name: 'Bodo', flag: '🇮🇳' },
  KB: { code: 'kb', name: 'Kokborok', flag: '🇮🇳' }
};

export const DICTIONARY = {
  en: {
    appTitle: 'SmritiSetu NER',
    subtitle: 'AI Cognitive Companion & Memory Assistant',
    goodMorning: 'Good Morning,',
    goodAfternoon: 'Good Afternoon,',
    goodEvening: 'Good Evening,',
    todaysActivities: "Today's Activities",
    playAGame: 'Play a Game',
    myMemories: 'My Memories',
    myReminders: 'My Reminders',
    myFamily: 'My Family',
    talkToAssistant: 'Talk to Voice Assistant',
    todaysProgress: "Today's Progress",
    caregiverDashboard: 'Caregiver Dashboard',
    adminPortal: 'Admin Portal',
    emergencyCall: 'Emergency Call',
    speakQuestion: 'Tap microphone and ask a question...',
    hearingPrompt: 'Listening to your voice...',
    sampleQuestions: 'Try asking: "Who is Ananya?" or "What medicine do I take?"',
    highContrast: 'High Contrast',
    voiceGuide: 'Voice Guide',
    fontSize: 'Text Size',
    switchMode: 'Switch Mode',
    elderlyMode: 'Elderly Friendly Mode',
    demoMode: 'SIH 3-Min Judge Demo'
  },
  as: {
    appTitle: 'স্মৃতিসেতু NER',
    subtitle: 'AI মগজুৰ ব্যায়াম আৰু স্মৃতি সহায়ক',
    goodMorning: 'শুভ ৰাতিপুৱা,',
    goodAfternoon: 'শুভ অপৰাহ্ন,',
    goodEvening: 'শুভ সন্ধ্যা,',
    todaysActivities: 'আজিকালিৰ কাৰ্যসূচী',
    playAGame: '🧠 খেল খেলক',
    myMemories: '📝 মোৰ সোঁৱৰণি',
    myReminders: '🔔 মোৰ মনত পেলাই দিয়া',
    myFamily: '👨‍👩‍👧 মোৰ পৰিয়াল',
    talkToAssistant: '🎤 সহায়কৰ সৈতে কথা পাতক',
    todaysProgress: '❤️ আজিৰ অগ্ৰগতি',
    caregiverDashboard: 'যত্নলোৱা ব্যক্তিৰ ডেচবৰ্ড',
    adminPortal: 'প্ৰশাসক প’ৰ্টেল',
    emergencyCall: 'জৰুৰীকালীন কল',
    speakQuestion: 'মাইক্ৰ’ফোনত টিপি প্ৰশ্ন সোধক...',
    hearingPrompt: 'আপোনাৰ মাত শুনিকৈ আছোঁ...',
    sampleQuestions: 'সোধক: "অনন্যা কোন হয়?" বা "মোৰ ঔষধ কি?"',
    highContrast: 'উচ্চ স্পষ্টতা',
    voiceGuide: 'শব্দ সহায়ক',
    fontSize: 'আখৰৰ আকাৰ',
    switchMode: 'ম’ড সলনি কৰক',
    elderlyMode: 'বয়স্ক সুলভ ম’ড',
    demoMode: 'SIH ৩-মিনিট ডেমা’'
  },
  hi: {
    appTitle: 'स्मृतिसेतु NER',
    subtitle: 'AI संज्ञानात्मक व्यायाम एवं स्मृति सहायक',
    goodMorning: 'शुभ प्रभात,',
    goodAfternoon: 'शुभ दोपहर,',
    goodEvening: 'शुभ संध्या,',
    todaysActivities: 'आज की गतिविधियां',
    playAGame: '🧠 खेल खेलें',
    myMemories: '📝 मेरी यादें',
    myReminders: '🔔 मेरे रिमाइंडर',
    myFamily: '👨‍👩‍👧 मेरा परिवार',
    talkToAssistant: '🎤 सहायक से बात करें',
    todaysProgress: '❤️ आज की प्रगति',
    caregiverDashboard: 'केयरगिवर डैशबोर्ड',
    adminPortal: 'एडमिन पोर्टल',
    emergencyCall: 'आपातकालीन कॉल',
    speakQuestion: 'माइक दबाएं और पूछें...',
    hearingPrompt: 'आपकी आवाज सुन रहे हैं...',
    sampleQuestions: 'पूछें: "अनन्या कौन है?" या "मेरी दवा कौन सी है?"',
    highContrast: 'उच्च कंट्रास्ट',
    voiceGuide: 'वॉयस गाइड',
    fontSize: 'अक्षर का आकार',
    switchMode: 'मोड बदलें',
    elderlyMode: 'बुजुर्गों के लिए अनुकूल मोड',
    demoMode: 'SIH 3-मिनट डेमो'
  }
};

export const LocalizationService = {
  getText: (key, lang = 'as') => {
    const dict = DICTIONARY[lang] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || key;
  },

  getCulturalProfile: (stateName = NER_STATES.ASSAM) => {
    return (
      CULTURAL_CATALOG[stateName] ||
      Object.values(CULTURAL_CATALOG).find((state) => state.name === stateName) ||
      CULTURAL_CATALOG.assam
    );
  }
};
