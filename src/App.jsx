import React, { useState, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { pageTransition } from './components/common/pageTransition';
import Header from './components/common/Header';
import AuthPortal from './components/auth/AuthPortal';
import ElderlyHome from './components/elderly/ElderlyHome';
import CaregiverDashboard from './components/caregiver/CaregiverDashboard';
import AdminPortal from './components/admin/AdminPortal';
import SIHDemoBar from './components/demo/SIHDemoBar';
import GameShell from './components/elderly/GameShell';
import MemoryJournalView from './components/elderly/MemoryJournalView';
import RemindersView from './components/elderly/RemindersView';
import StoryModeView from './components/elderly/StoryModeView';
import VoiceAssistantModal from './components/elderly/VoiceAssistantModal';
import { NER_STATES } from './data/regionalContent';
import { AuthService } from './services/authService';
import { LanguageProvider } from './hooks/useTranslation';

export default function App() {
  const [session, setSession] = useState(() => AuthService.getSession());
  const [currentMode, setCurrentMode] = useState(session?.role || 'elderly');
  const [currentSubView, setCurrentSubView] = useState('home');
  const [currentLang, setCurrentLang] = useState(session?.language || 'as');
  const [currentState, setCurrentState] = useState(session?.state || NER_STATES.ASSAM);
  
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  const [demoStep, setDemoStep] = useState(1);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [highContrast]);

  const handleAuthenticated = (nextSession) => {
    setSession(nextSession);
    setCurrentMode(nextSession.role);
    setCurrentLang(nextSession.language || 'en');
    setCurrentState(nextSession.state || NER_STATES.ASSAM);
    setCurrentSubView('home');
  };

  const handleLogout = () => {
    AuthService.logout();
    setSession(null);
    setCurrentMode('elderly');
    setCurrentSubView('home');
    setIsVoiceModalOpen(false);
  };

  if (!session) {
    return (
      <MotionConfig reducedMotion="user">
        <LanguageProvider lang="en">
          <AuthPortal onAuthenticated={handleAuthenticated} />
        </LanguageProvider>
      </MotionConfig>
    );
  }

  const handleExecuteDemoStep = (stepObj) => {
    const target = stepObj.targetView;
    if (target === 'elderly') {
      setCurrentMode('elderly');
      setCurrentSubView('home');
      setIsVoiceModalOpen(false);
    } else if (target === 'elderly_games') {
      setCurrentMode('elderly');
      setCurrentSubView('games');
      setIsVoiceModalOpen(false);
    } else if (target === 'elderly_memories') {
      setCurrentMode('elderly');
      setCurrentSubView('memories');
      setIsVoiceModalOpen(false);
    } else if (target === 'elderly_voice') {
      setCurrentMode('elderly');
      setCurrentSubView('home');
      setIsVoiceModalOpen(true);
    } else if (target === 'elderly_reminders') {
      setCurrentMode('elderly');
      setCurrentSubView('reminders');
      setIsVoiceModalOpen(false);
    } else if (target === 'elderly_story') {
      setCurrentMode('elderly');
      setCurrentSubView('story');
      setIsVoiceModalOpen(false);
    } else if (target === 'caregiver' || target === 'caregiver_analytics' || target === 'caregiver_insights') {
      setCurrentMode('caregiver');
      setIsVoiceModalOpen(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <LanguageProvider lang={currentLang}>
    <div className={`app-shell ${fontSize === 'lg' ? 'font-scale-lg' : fontSize === 'xl' ? 'font-scale-xl' : ''}`}>
      <Header
        currentMode={currentMode}
        setCurrentMode={(mode) => {
          setCurrentMode(mode);
          if (mode === 'demo') {
            setDemoStep(1);
            handleExecuteDemoStep({ targetView: 'elderly' });
          }
        }}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        currentState={currentState}
        setCurrentState={setCurrentState}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        fontSize={fontSize}
        setFontSize={setFontSize}
        session={session}
        onLogout={handleLogout}
        onSessionUpdate={setSession}
      />

      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          {currentMode === 'elderly' && currentSubView === 'home' && (
            <motion.div key="elderly-home" {...pageTransition}>
              <ElderlyHome currentLang={currentLang} currentState={currentState} session={session} />
            </motion.div>
          )}
          {currentMode === 'elderly' && currentSubView === 'games' && (
            <motion.div key="elderly-games" {...pageTransition}>
              <GameShell stateName={currentState} onBack={() => setCurrentSubView('home')} />
            </motion.div>
          )}
          {currentMode === 'elderly' && currentSubView === 'memories' && (
            <motion.div key="elderly-memories" {...pageTransition}>
              <MemoryJournalView onBack={() => setCurrentSubView('home')} onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)} />
            </motion.div>
          )}
          {currentMode === 'elderly' && currentSubView === 'reminders' && (
            <motion.div key="elderly-reminders" {...pageTransition}>
              <RemindersView onBack={() => setCurrentSubView('home')} />
            </motion.div>
          )}
          {currentMode === 'elderly' && currentSubView === 'story' && (
            <motion.div key="elderly-story" {...pageTransition}>
              <StoryModeView onBack={() => setCurrentSubView('home')} />
            </motion.div>
          )}

          {currentMode === 'caregiver' && (
            <motion.div key="caregiver" {...pageTransition}>
              <CaregiverDashboard session={session} />
            </motion.div>
          )}
          {currentMode === 'admin' && (
            <motion.div key="admin" {...pageTransition}>
              <AdminPortal />
            </motion.div>
          )}
          {currentMode === 'demo' && (
            <motion.div key="demo" className="space-y-4" {...pageTransition}>
              <ElderlyHome currentLang={currentLang} currentState={currentState} session={session} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onOpenGame={() => {
          setIsVoiceModalOpen(false);
          setCurrentMode('elderly');
          setCurrentSubView('games');
        }}
      />

      <SIHDemoBar
        currentStep={demoStep}
        setCurrentStep={setDemoStep}
        onExecuteStep={handleExecuteDemoStep}
      />
    </div>
    </LanguageProvider>
    </MotionConfig>
  );
}
