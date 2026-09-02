import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, LockKeyhole, UserPlus, ArrowRight } from 'lucide-react';
import { INDIAN_STATES_AND_UTS, INDIAN_LANGUAGES } from '../../data/regionalContent';
import { AuthService } from '../../services/authService';
import Magnetic from '../common/Magnetic';
import AvatarPicker from '../common/AvatarPicker';
import { useTranslation } from '../../hooks/useTranslation';

const initialLogin = { email: '', password: '' };
const initialRegister = { fullName: '', email: '', password: '', role: 'caregiver', state: 'Assam', language: 'en', avatar: null };

export default function AuthPortal({ onAuthenticated }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const result = await AuthService.login(loginForm);
    setIsSubmitting(false);
    if (!result.ok) { setError(result.error); return; }
    setError('');
    onAuthenticated(result.session);
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const result = await AuthService.register(registerForm);
    setIsSubmitting(false);
    if (!result.ok) { setError(result.error); return; }
    setError('');
    onAuthenticated(result.session);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60rem 46rem at 12% 8%, rgba(226,112,58,0.16), transparent 60%), radial-gradient(50rem 46rem at 92% 92%, rgba(79,174,142,0.14), transparent 60%), var(--canvas)'
        }}
      />

      <header className="relative rail-pad pt-8 md:pt-10 flex items-center gap-2.5">
        <span className="mark-glyph"><Feather className="w-4 h-4" /></span>
        <span className="eyebrow">SmritiSetu — Keeping Memories Close</span>
      </header>

      <main className="relative rail-pad flex-1 flex items-center py-12 md:py-0">
        <div className="content-col w-full grid lg:grid-cols-[1.3fr_0.9fr] gap-14 lg:gap-10 items-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-medium leading-[0.98] text-[clamp(2.8rem,7.5vw,6.4rem)]"
          >
            A gentle
            <br />
            bridge back to
            <br />
            <em className="italic" style={{ color: 'var(--ember)' }}>memory.</em>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-[var(--radius-lg)] p-7 md:p-8 w-full max-w-md lg:ml-auto"
          >
            <div className="flex gap-6 mb-6" style={{ borderBottom: '1px solid var(--hairline)' }}>
              {['login', 'register'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setError(''); }}
                  className={`tab-link capitalize ${activeTab === tab ? 'is-active' : ''}`}
                >
                  {tab === 'login' ? t('signIn') : t('register')}
                  {activeTab === tab && (
                    <motion.span layoutId="auth-tab-underline" className="absolute left-0 right-0 -bottom-px h-[2px]" style={{ background: 'var(--ember)' }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} />
                  )}
                </button>
              ))}
            </div>

            {error ? (
              <div className="notice-strip is-alert mb-5 text-sm" style={{ color: 'var(--alert)' }} role="alert">{error}</div>
            ) : null}

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={submitLogin}
                  className="space-y-5"
                >
                  <div>
                    <label className="field-label">{t('emailLabel')}</label>
                    <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="input" placeholder="name@example.com" required />
                  </div>
                  <div>
                    <label className="field-label">{t('passwordLabel')}</label>
                    <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="input" placeholder="••••••••" required />
                  </div>
                  <Magnetic strength={0.15} className="block">
                    <button type="submit" disabled={isSubmitting} className="btn btn-ember w-full mt-2">
                      <LockKeyhole className="w-4 h-4" /> {t('enterWorkspace')}
                    </button>
                  </Magnetic>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={submitRegister}
                  className="space-y-5"
                >
                  <div>
                    <label className="field-label">{t('fullNameLabel')}</label>
                    <input type="text" value={registerForm.fullName} onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })} className="input" placeholder="Kamala Devi" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="field-label">{t('emailLabel')}</label>
                      <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="input" placeholder="you@mail.com" required />
                    </div>
                    <div>
                      <label className="field-label">{t('passwordLabel')}</label>
                      <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="input" placeholder="Min. 6 chars" required minLength={6} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="field-label">{t('roleLabel')}</label>
                      <select value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })} className="select">
                        <option value="elderly">{t('modeElderlyLabel')}</option>
                        <option value="caregiver">{t('modeCaregiverLabel')}</option>
                        <option value="admin">{t('modeAdminLabel')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">{t('stateLabel')}</label>
                      <select value={registerForm.state} onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })} className="select">
                        {INDIAN_STATES_AND_UTS.map((state) => (<option key={state} value={state}>{state}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">{t('languageLabel')}</label>
                      <select value={registerForm.language} onChange={(e) => setRegisterForm({ ...registerForm, language: e.target.value })} className="select">
                        {INDIAN_LANGUAGES.map((lang) => (<option key={lang.code} value={lang.code}>{lang.name}</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="field-label">{t('profilePictureLabel')}</label>
                    <AvatarPicker
                      value={registerForm.avatar}
                      fullName={registerForm.fullName}
                      onChange={(avatar) => setRegisterForm({ ...registerForm, avatar })}
                    />
                  </div>
                  <Magnetic strength={0.15} className="block">
                    <button type="submit" disabled={isSubmitting} className="btn btn-ember w-full mt-2">
                      <UserPlus className="w-4 h-4" /> {t('createAccount')}
                    </button>
                  </Magnetic>
                </motion.form>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setError(''); }}
              className="mt-6 text-sm font-medium inline-flex items-center gap-1"
              style={{ color: 'var(--ink-faint)' }}
            >
              {activeTab === 'login' ? t('needAccountRegister') : t('alreadyRegisteredSignIn')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      </main>

      <footer className="relative rail-pad pb-8 md:pb-10">
        <p className="pin max-w-lg">
          Your memories. Your story. Your SmritiSetu.
        </p>
      </footer>
    </div>
  );
}
