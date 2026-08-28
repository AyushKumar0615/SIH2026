import React, { useState } from 'react';
import { MOCK_ELDERLY_USER, MOCK_ROUTINE_SCHEDULE } from '../../data/mockData';
import { LocalizationService } from '../../services/localizationService';
import { AudioService } from '../../services/audioService';
import GameShell from './GameShell';
import MemoryJournalView from './MemoryJournalView';
import RemindersView from './RemindersView';
import StoryModeView from './StoryModeView';
import VoiceAssistantModal from './VoiceAssistantModal';
import { Mic, Sparkles, Volume2, Clock, CheckCircle2, Home, Brain, BookOpen, Bell } from 'lucide-react';

export default function ElderlyHome({ currentLang, currentState }) {
  const [activeSubView, setActiveSubView] = useState('home');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const culturalProfile = LocalizationService.getCulturalProfile(currentState);
  const nextTask = MOCK_ROUTINE_SCHEDULE.find((item) => !item.completed) || MOCK_ROUTINE_SCHEDULE[0];

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return LocalizationService.getText('goodMorning', currentLang);
    if (hour < 17) return LocalizationService.getText('goodAfternoon', currentLang);
    return LocalizationService.getText('goodEvening', currentLang);
  };

  const handleSpeakGreeting = () => {
    const greetingMsg = `${getGreetingTime()} ${MOCK_ELDERLY_USER.name}! ${culturalProfile.greeting}. Tap any card below to play games or view family memories.`;
    AudioService.speak(greetingMsg, 'en');
  };

  if (activeSubView === 'games') {
    return <GameShell stateName={currentState} onBack={() => setActiveSubView('home')} />;
  }
  if (activeSubView === 'memories') {
    return <MemoryJournalView onBack={() => setActiveSubView('home')} onOpenVoiceAssistant={() => setIsAssistantOpen(true)} />;
  }
  if (activeSubView === 'reminders') {
    return <RemindersView onBack={() => setActiveSubView('home')} />;
  }
  if (activeSubView === 'story') {
    return <StoryModeView onBack={() => setActiveSubView('home')} />;
  }

  return (
    <div className="elder-home animate-fade-in">
      <section className="glass-card elder-identity-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <img
              src={MOCK_ELDERLY_USER.avatarUrl}
              alt={MOCK_ELDERLY_USER.name}
              className="elder-identity-photo"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-amber">{culturalProfile.greeting}</span>
                <span className="badge badge-teal">{currentState}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {getGreetingTime()} {MOCK_ELDERLY_USER.name}
              </h2>
              <p className="supporting-text text-lg font-medium mt-2">
                Caregiver: <strong className="text-amber-200">{MOCK_ELDERLY_USER.caregiverName}</strong>
                <span className="meta-text"> · {MOCK_ELDERLY_USER.location}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSpeakGreeting}
            className="btn-secondary py-3 px-5 text-lg"
          >
            <Volume2 className="w-6 h-6 text-teal-300" /> Speak Greeting
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsAssistantOpen(true)}
        className="elder-voice-card"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="elder-voice-icon">
            <Mic className="w-9 h-9" />
          </div>
          <div className="min-w-0">
            <span className="badge badge-amber mb-2">Voice assistant</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Ask anything</h3>
            <p className="supporting-text text-lg mt-1">Try: “Who is Ananya?”</p>
          </div>
        </div>

        <span className="btn-primary btn-gold py-3 px-7 text-xl pointer-events-none">
          <Sparkles className="w-6 h-6" /> Talk Now
        </span>
      </button>

      <section className="glass-card elder-next-task">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <div className="elderly-card-icon text-3xl bg-teal-500/15 text-teal-200">{nextTask.icon}</div>
            <div className="min-w-0">
              <p className="badge badge-teal mb-2">Today’s next task</p>
              <p className="meta-text text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-300" /> {nextTask.time}
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1 leading-tight">{nextTask.title}</h3>
              <p className="supporting-text text-lg mt-2">{nextTask.voicePrompt}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubView('reminders')}
            className="btn-primary py-3 px-6 text-lg shrink-0"
          >
            <CheckCircle2 className="w-6 h-6" /> Complete reminder
          </button>
        </div>
      </section>

      <div>
        <h3 className="section-title text-2xl mb-4">Your activities</h3>
        <div className="elder-activity-grid">
          <button type="button" onClick={() => setActiveSubView('games')} className="elderly-card">
            <div className="elderly-card-icon text-teal-200 bg-teal-500/15 text-3xl">🧠</div>
            <div className="elderly-card-content">
              <h3 className="elderly-card-title">{LocalizationService.getText('playAGame', currentLang)}</h3>
              <p className="elderly-card-subtitle">Bihu Pairs, Face Match & Focus</p>
            </div>
          </button>

          <button type="button" onClick={() => setActiveSubView('memories')} className="elderly-card">
            <div className="elderly-card-icon text-amber-200 bg-amber-500/15 text-3xl">📝</div>
            <div className="elderly-card-content">
              <h3 className="elderly-card-title">{LocalizationService.getText('myMemories', currentLang)}</h3>
              <p className="elderly-card-subtitle">Family photos, Ananya & story</p>
            </div>
          </button>

          <button type="button" onClick={() => setActiveSubView('reminders')} className="elderly-card">
            <div className="elderly-card-icon text-rose-200 bg-rose-500/15 text-3xl">🔔</div>
            <div className="elderly-card-content">
              <h3 className="elderly-card-title">{LocalizationService.getText('myReminders', currentLang)}</h3>
              <p className="elderly-card-subtitle">Medication & Assam tea time</p>
            </div>
          </button>

          <button type="button" onClick={() => setActiveSubView('story')} className="elderly-card">
            <div className="elderly-card-icon text-indigo-200 bg-indigo-500/15 text-3xl">📖</div>
            <div className="elderly-card-content">
              <h3 className="elderly-card-title">AI Story Mode</h3>
              <p className="elderly-card-subtitle">Narrated family slideshow</p>
            </div>
          </button>

          <button type="button" onClick={() => setIsAssistantOpen(true)} className="elderly-card">
            <div className="elderly-card-icon text-sky-200 bg-sky-500/15 text-3xl">👨‍👩‍👧</div>
            <div className="elderly-card-content">
              <h3 className="elderly-card-title">{LocalizationService.getText('myFamily', currentLang)}</h3>
              <p className="elderly-card-subtitle">Ananya, Priya & Rahul</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.speak('Connecting emergency call to Priya Devi.', 'en');
              alert('📞 Call Initiated to Primary Caregiver: Priya Devi (+91 98640 12345)');
            }}
            className="elderly-card elderly-card-caregiver"
          >
            <div className="elderly-card-icon text-red-300 bg-red-500/15 text-3xl">🚨</div>
            <div className="elderly-card-content">
              <h3 className="elderly-card-title">Call Caregiver</h3>
              <p className="elderly-card-subtitle">Tap for instant assistance</p>
            </div>
          </button>
        </div>
      </div>

      <nav className="elder-shortcut-nav" aria-label="Elder shortcuts">
        <button type="button" className="btn-secondary" aria-current="page">
          <Home className="w-5 h-5" /> Home
        </button>
        <button type="button" className="btn-secondary" onClick={() => setActiveSubView('games')}>
          <Brain className="w-5 h-5" /> Games
        </button>
        <button type="button" className="btn-secondary" onClick={() => setActiveSubView('memories')}>
          <BookOpen className="w-5 h-5" /> Memories
        </button>
        <button type="button" className="btn-secondary" onClick={() => setActiveSubView('reminders')}>
          <Bell className="w-5 h-5" /> Reminders
        </button>
      </nav>

      <VoiceAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onOpenGame={() => {
          setIsAssistantOpen(false);
          setActiveSubView('games');
        }}
      />
    </div>
  );
}
