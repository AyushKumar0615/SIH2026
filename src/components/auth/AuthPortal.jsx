import React, { useState } from 'react';
import {
  Brain,
  LockKeyhole,
  UserPlus,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { NER_STATES } from '../../data/regionalContent';
import { AuthService } from '../../services/authService';

const initialLogin = { email: '', password: '' };
const initialRegister = { fullName: '', email: '', password: '', role: 'caregiver', state: NER_STATES.ASSAM, language: 'en' };

export default function AuthPortal({ onAuthenticated }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState('');

  const submitLogin = (e) => {
    e.preventDefault();
    const result = AuthService.login(loginForm);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    onAuthenticated(result.session);
  };

  const submitRegister = (e) => {
    e.preventDefault();
    const result = AuthService.register(registerForm);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    onAuthenticated(result.session);
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-6 lg:gap-8 items-stretch">
        <section className="glass-card p-7 md:p-9 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/16 border border-teal-500/20 grid place-items-center">
                <Brain className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <p className="text-lg font-black text-white font-display">SmritiSetu NER</p>
                <p className="text-xs text-slate-400 font-medium">AI-assisted cognitive care and memory support</p>
              </div>
            </div>

            <div className="mt-8 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300/90">Secure care access</p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black text-white font-display leading-[1.05]">
                Trusted access to a calmer care workspace.
              </h1>
              <p className="mt-5 text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                Support daily cognitive care, family memory assistance, and caregiver coordination through a simple, reassuring sign-in experience.
              </p>
            </div>

            <div className="mt-8 space-y-4 max-w-xl">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/50 px-5 py-4">
                <div className="flex items-start gap-4">
                  <HeartHandshake className="w-5 h-5 text-teal-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold">Designed for elders, caregivers, and platform teams</p>
                    <p className="text-sm text-slate-400 font-medium mt-1">Each account enters the same existing role-based workflow already built into the application.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/50 px-5 py-4">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold">AI-assisted, human-centered support</p>
                    <p className="text-sm text-slate-400 font-medium mt-1">Memory assistance and cognitive engagement remain accessible without overwhelming the user.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/50 px-5 py-4">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-teal-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold">Private prototype environment</p>
                    <p className="text-sm text-slate-400 font-medium mt-1">Accounts are still stored locally in this prototype. The existing authentication behavior is unchanged.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 hidden md:flex items-center gap-3 text-sm text-slate-400 font-medium">
            <LockKeyhole className="w-4 h-4 text-slate-500" />
            <span>Simple account access for care teams and family support workflows.</span>
          </div>
        </section>

        <section className="glass-card p-5 md:p-7 lg:p-8 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Account</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-black text-white font-display">
                {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-400 font-medium">
                {activeTab === 'login'
                  ? 'Sign in with your saved details to continue.'
                  : 'Register with the role, state, and language you want to use.'}
              </p>
            </div>

            <div className="flex gap-2 rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`flex-1 min-h-12 rounded-xl px-4 py-3 font-extrabold transition-colors ${
                  activeTab === 'login' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className={`flex-1 min-h-12 rounded-xl px-4 py-3 font-extrabold transition-colors ${
                  activeTab === 'register' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-100 font-semibold" role="alert">
                {error}
              </div>
            ) : null}

            {activeTab === 'login' ? (
              <form onSubmit={submitLogin} className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-200">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-200">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full min-h-14 py-4 text-base">
                  <LockKeyhole className="w-5 h-5" /> Sign in
                </button>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Successful sign-in continues into the same existing application flow.
                </p>
              </form>
            ) : (
              <form onSubmit={submitRegister} className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-200">Full name</label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-200">Email</label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-200">Password</label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-200">Role</label>
                    <select
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                    >
                      <option value="elderly">Elder</option>
                      <option value="caregiver">Caregiver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-200">State</label>
                    <select
                      value={registerForm.state}
                      onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })}
                      className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                    >
                      {Object.values(NER_STATES).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-200">Language</label>
                    <select
                      value={registerForm.language}
                      onChange={(e) => setRegisterForm({ ...registerForm, language: e.target.value })}
                      className="mt-2 w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-4 text-white outline-none focus:border-teal-400"
                    >
                      <option value="as">Assamese profile</option>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full min-h-14 py-4 text-base">
                  <UserPlus className="w-5 h-5" /> Create account
                </button>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/45 px-4 py-3">
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Registration keeps the existing role selection, account creation flow, and local prototype storage behavior exactly as before.
                  </p>
                </div>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span>{activeTab === 'login' ? 'Need access first? Switch to Register.' : 'Already registered? Switch back to Login.'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
