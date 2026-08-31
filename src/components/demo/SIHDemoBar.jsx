import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function SIHDemoBar({ currentStep, setCurrentStep, onExecuteStep }) {
  const steps = [
    { num: 1, title: 'Elderly Dashboard', targetView: 'elderly', hint: 'Judge View: High-contrast, 72px buttons, Assamese greeting for Kamala Devi.' },
    { num: 2, title: 'Play Bihu Memory Pair', targetView: 'elderly_games', hint: 'Cognitive Game: Matching Jaapi, Pepa & Muga Silk cards.' },
    { num: 3, title: 'Adaptive Difficulty', targetView: 'elderly_games', hint: 'AI Engine dynamically scales Easy -> Medium -> Hard.' },
    { num: 4, title: 'Session Analytics', targetView: 'elderly_games', hint: 'AI scores session accuracy, response time & mistakes.' },
    { num: 5, title: 'Personal Baseline', targetView: 'caregiver_analytics', hint: 'Compare vs individual 30-day baseline, not population norms.' },
    { num: 6, title: 'Memory Journal', targetView: 'elderly_memories', hint: 'Family photos, Ananya, Bihu 2025 memories & audio notes.' },
    { num: 7, title: 'Ask Assistant: "Who is Ananya?"', targetView: 'elderly_voice', hint: 'Voice RAG: Tap voice prompt button to query family store.' },
    { num: 8, title: 'AI Family Answer', targetView: 'elderly_voice', hint: 'AI answers: "Ananya is your granddaughter studying CS in Cotton Uni".' },
    { num: 9, title: 'Smart Reminders', targetView: 'elderly_reminders', hint: 'Medication alerts & hot Assam tea schedule.' },
    { num: 10, title: 'Caregiver Dashboard', targetView: 'caregiver', hint: 'Remote daughter Priya monitors daily completion & trends.' },
    { num: 11, title: 'Cognitive Trends', targetView: 'caregiver_analytics', hint: 'Accuracy & response time matrix across 6 domains.' },
    { num: 12, title: 'Explainable AI Rationale', targetView: 'caregiver_insights', hint: 'Explainable AI rationale cards for caregiver peace of mind.' },
    { num: 13, title: 'AI Family Story Mode', targetView: 'elderly_story', hint: 'Flagship feature: narrated photo slideshow with regional tunes.' }
  ];

  const activeStepData = steps.find((s) => s.num === currentStep) || steps[0];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const nextData = steps.find((s) => s.num === next);
      if (nextData) onExecuteStep(nextData);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const prevData = steps.find((s) => s.num === prev);
      if (prevData) onExecuteStep(prevData);
    }
  };

  return (
    <div className="judge-bar fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto">
      <div className="rounded-full px-3 py-1.5 flex items-center gap-2.5" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="w-6 h-6 rounded-full grid place-items-center font-mono text-[10px] shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--ink-faint)' }}>
          {activeStepData.num}
        </span>

        <div className="min-w-0 flex-1 hidden sm:block">
          <p className="text-[11px] font-medium truncate" style={{ color: 'var(--ink-faint)' }}>{activeStepData.title}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={handlePrevStep} disabled={currentStep === 1} className="trigger-btn !w-6 !h-6 !border-0 disabled:opacity-30" style={{ background: 'transparent' }} title="Previous">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono px-1" style={{ color: 'var(--ink-faint)' }}>{activeStepData.num}/13</span>
          <button type="button" onClick={handleNextStep} disabled={currentStep === steps.length} className="trigger-btn !w-6 !h-6 !border-0 disabled:opacity-30" style={{ background: 'transparent', color: 'var(--ink-faint)' }} title="Next">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
