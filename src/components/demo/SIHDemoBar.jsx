import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function SIHDemoBar({ currentStep, setCurrentStep, onExecuteStep }) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, titleKey: 'demoStep1', targetView: 'elderly', hint: 'Judge View: High-contrast, 72px buttons, Assamese greeting for Kamala Devi.' },
    { num: 2, titleKey: 'demoStep2', targetView: 'elderly_games', hint: 'Cognitive Game: Matching Jaapi, Pepa & Muga Silk cards.' },
    { num: 3, titleKey: 'demoStep3', targetView: 'elderly_games', hint: 'AI Engine dynamically scales Easy -> Medium -> Hard.' },
    { num: 4, titleKey: 'demoStep4', targetView: 'elderly_games', hint: 'AI scores session accuracy, response time & mistakes.' },
    { num: 5, titleKey: 'demoStep5', targetView: 'caregiver_analytics', hint: 'Compare vs individual 30-day baseline, not population norms.' },
    { num: 6, titleKey: 'demoStep6', targetView: 'elderly_memories', hint: 'Family photos, Ananya, Bihu 2025 memories & audio notes.' },
    { num: 7, titleKey: 'demoStep7', targetView: 'elderly_voice', hint: 'Voice RAG: Tap voice prompt button to query family store.' },
    { num: 8, titleKey: 'demoStep8', targetView: 'elderly_voice', hint: 'AI answers: "Ananya is your granddaughter studying CS in Cotton Uni".' },
    { num: 9, titleKey: 'demoStep9', targetView: 'elderly_reminders', hint: 'Medication alerts & hot Assam tea schedule.' },
    { num: 10, titleKey: 'demoStep10', targetView: 'caregiver', hint: 'Remote daughter Priya monitors daily completion & trends.' },
    { num: 11, titleKey: 'demoStep11', targetView: 'caregiver_analytics', hint: 'Accuracy & response time matrix across 6 domains.' },
    { num: 12, titleKey: 'demoStep12', targetView: 'caregiver_insights', hint: 'Explainable AI rationale cards for caregiver peace of mind.' },
    { num: 13, titleKey: 'demoStep13', targetView: 'elderly_story', hint: 'Flagship feature: narrated photo slideshow with regional tunes.' }
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
          <p className="text-[11px] font-medium truncate" style={{ color: 'var(--ink-faint)' }}>{t(activeStepData.titleKey)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={handlePrevStep} disabled={currentStep === 1} className="trigger-btn !w-6 !h-6 !border-0 disabled:opacity-30" style={{ background: 'transparent' }} title={t('previousLabel')}>
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono px-1" style={{ color: 'var(--ink-faint)' }}>{activeStepData.num}/13</span>
          <button type="button" onClick={handleNextStep} disabled={currentStep === steps.length} className="trigger-btn !w-6 !h-6 !border-0 disabled:opacity-30" style={{ background: 'transparent', color: 'var(--ink-faint)' }} title={t('nextLabel')}>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
