import React, { useState, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { pageTransition } from './components/common/pageTransition';
import Header from './components/common/Header';
import AuthPortal from './components/auth/AuthPortal';
import ElderlyHome from './components/elderly/ElderlyHome';
import CaregiverDashboard from './components/caregiver/CaregiverDashboard';
import AdminPortal from './components/admin/AdminPortal';
import { NER_STATES } from './data/regionalContent';
import { AuthService } from './services/authService';
import { LanguageProvider } from './hooks/useTranslation';

export default function App() {
  const [session, setSession] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [currentMode, setCurrentMode] = useState('elderly');
  const [currentLang, setCurrentLang] = useState('as');
  const [currentState, setCurrentState] = useState(NER_STATES.ASSAM);

  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    let cancelled = false;
    AuthService.getSession().then((restoredSession) => {
      if (cancelled) return;
      if (restoredSession) {
        setSession(restoredSession);
        setCurrentMode(restoredSession.role || 'elderly');
        setCurrentLang(restoredSession.language || 'as');
        setCurrentState(restoredSession.state || NER_STATES.ASSAM);
      }
      setIsRestoringSession(false);
    });
    return () => { cancelled = true; };
  }, []);

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
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setSession(null);
    setCurrentMode('elderly');
  };

  if (isRestoringSession) {
    return <MotionConfig reducedMotion="user"><div className="app-shell" /></MotionConfig>;
  }

  if (!session) {
    return (
      <MotionConfig reducedMotion="user">
        <LanguageProvider lang="en">
          <AuthPortal onAuthenticated={handleAuthenticated} />
        </LanguageProvider>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <LanguageProvider lang={currentLang}>
    <div className={`app-shell ${fontSize === 'lg' ? 'font-scale-lg' : fontSize === 'xl' ? 'font-scale-xl' : ''}`}>
      <Header
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
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
          {currentMode === 'elderly' && (
            <motion.div key="elderly-home" {...pageTransition}>
              <ElderlyHome currentLang={currentLang} currentState={currentState} session={session} />
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
    </div>
    </LanguageProvider>
    </MotionConfig>
  );
}
