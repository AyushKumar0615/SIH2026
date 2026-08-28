import React, { useState } from 'react';
import {
  Brain,
  HeartPulse,
  LayoutDashboard,
  Shield,
  Contrast,
  TextCursorInput,
  LogOut,
  Menu,
  X,
  Languages,
  MapPinned,
  PanelTop
} from 'lucide-react';
import { CULTURAL_CATALOG } from '../../data/regionalContent';

export default function Header({
  currentMode,
  setCurrentMode,
  currentLang,
  setCurrentLang,
  currentState,
  setCurrentState,
  highContrast,
  setHighContrast,
  fontSize,
  setFontSize,
  session,
  onLogout
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const modes = [
    { id: 'elderly', label: 'Elder', icon: HeartPulse },
    { id: 'caregiver', label: 'Caregiver', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'demo', label: 'Demo', icon: Brain }
  ];

  const activeMode = modes.find((mode) => mode.id === currentMode) || modes[0];
  const ActiveModeIcon = activeMode.icon;

  const handleModeChange = (modeId) => {
    setCurrentMode(modeId);
    setIsMenuOpen(false);
  };

  const ControlCluster = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col gap-4' : 'items-center gap-3'}`}>
      <div className={`glass-card ${mobile ? 'p-4' : 'px-3 py-2'} border-0 shadow-none bg-slate-900/70`}>
        <div className={`flex ${mobile ? 'flex-col gap-3' : 'items-center gap-3'}`}>
          <div className={`${mobile ? 'space-y-2' : 'flex items-center gap-2'}`}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <Languages className="w-3.5 h-3.5" />
              <span>Language</span>
            </div>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="min-h-11 rounded-2xl bg-slate-950 border border-slate-700 px-3 text-sm font-bold text-white"
              aria-label="Language"
            >
              <option value="as">Assamese profile</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className={`${mobile ? 'space-y-2' : 'flex items-center gap-2'}`}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <MapPinned className="w-3.5 h-3.5" />
              <span>Region</span>
            </div>
            <select
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              className="min-h-11 rounded-2xl bg-slate-950 border border-slate-700 px-3 text-sm font-bold text-white"
              aria-label="NER state"
            >
              {Object.values(CULTURAL_CATALOG).map((state) => (
                <option key={state.id} value={state.name}>{state.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`glass-card ${mobile ? 'p-4' : 'px-3 py-2'} border-0 shadow-none bg-slate-900/70`}>
        <div className={`flex ${mobile ? 'flex-col gap-3' : 'items-center gap-2'}`}>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <PanelTop className="w-3.5 h-3.5" />
            <span>Accessibility</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`min-h-11 rounded-2xl px-3 text-sm font-bold inline-flex items-center gap-2 border ${
                highContrast
                  ? 'bg-teal-500 text-slate-950 border-teal-400'
                  : 'bg-slate-950 text-slate-200 border-slate-700'
              }`}
              title="Toggle high contrast"
              aria-pressed={highContrast}
            >
              <Contrast className="w-4 h-4" />
              <span>{highContrast ? 'High contrast on' : 'Contrast'}</span>
            </button>

            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'lg' : fontSize === 'lg' ? 'xl' : 'normal')}
              className="min-h-11 rounded-2xl px-3 text-sm font-bold inline-flex items-center gap-2 bg-slate-950 border border-slate-700 text-slate-200"
              title="Increase text size"
            >
              <TextCursorInput className="w-4 h-4" />
              <span>{fontSize === 'normal' ? 'Text size' : fontSize === 'lg' ? 'Large text' : 'Extra large'}</span>
            </button>
          </div>
        </div>
      </div>

      {session ? (
        <div className={`glass-card ${mobile ? 'p-4' : 'px-3 py-2'} border-0 shadow-none bg-slate-900/70`}>
          <div className={`flex ${mobile ? 'items-start justify-between' : 'items-center gap-3'}`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Signed in</p>
              <p className="text-sm font-extrabold text-white">{session.fullName}</p>
              <p className="text-xs font-semibold capitalize text-slate-300">{session.role} workspace</p>
            </div>

            <button
              onClick={onLogout}
              className="min-h-11 rounded-2xl bg-slate-950 border border-slate-700 px-4 text-sm font-extrabold text-white inline-flex items-center gap-2"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/88 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-teal-500/16 border border-teal-500/20 grid place-items-center shadow-sm">
              <Brain className="w-6 h-6 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-black text-white font-display truncate">SmritiSetu NER</h1>
              <p className="hidden md:block text-xs text-slate-400 font-medium truncate">
                Cognitive care workspace for elders, caregivers and administrators
              </p>
              <div className="md:hidden flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-slate-400">Workspace</span>
                <span className={`badge ${currentMode === 'demo' ? 'badge-amber' : 'badge-teal'} text-[11px]`}>
                  <ActiveModeIcon className="w-3 h-3" />
                  {activeMode.label}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center flex-1 px-6">
            <nav
              className="inline-flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/78 p-1.5 shadow-sm"
              aria-label="Workspace navigation"
            >
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = currentMode === mode.id;
                const isDemo = mode.id === 'demo';
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className={`min-h-11 rounded-xl px-4 text-sm font-extrabold inline-flex items-center gap-2 transition-colors ${
                      isActive
                        ? isDemo
                          ? 'bg-amber-500/90 text-slate-950'
                          : 'bg-teal-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/74 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Signed in</span>
              <div className="w-px h-5 bg-slate-800" />
              <span className="text-sm font-semibold text-white">{session?.fullName}</span>
              <span className={`badge ${currentMode === 'demo' ? 'badge-amber' : 'badge-teal'} text-[11px]`}>
                {activeMode.label}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="lg:hidden min-h-11 min-w-11 rounded-2xl border border-slate-700 bg-slate-900 px-3 text-white inline-flex items-center justify-center"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close header menu' : 'Open header menu'}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between gap-4">
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Current workspace</span>
            <span className={`badge ${currentMode === 'demo' ? 'badge-amber' : 'badge-teal'} text-[11px]`}>
              <ActiveModeIcon className="w-3 h-3" />
              {activeMode.label}
            </span>
          </div>

          <ControlCluster />
        </div>

        {isMenuOpen ? (
          <div className="lg:hidden glass-card p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Workspaces</p>
                <span className={`badge ${currentMode === 'demo' ? 'badge-amber' : 'badge-teal'} text-[11px]`}>
                  <ActiveModeIcon className="w-3 h-3" />
                  {activeMode.label}
                </span>
              </div>

              <nav className="grid grid-cols-2 gap-2" aria-label="Workspace navigation">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;
                  const isDemo = mode.id === 'demo';
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={`min-h-12 rounded-2xl px-4 text-sm font-extrabold inline-flex items-center gap-2 justify-center ${
                        isActive
                          ? isDemo
                            ? 'bg-amber-500/90 text-slate-950'
                            : 'bg-teal-500 text-slate-950'
                          : 'bg-slate-900 text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <ControlCluster mobile />
          </div>
        ) : null}
      </div>
    </header>
  );
}
