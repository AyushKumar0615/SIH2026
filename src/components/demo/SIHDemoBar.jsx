import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function SIHDemoBar({
  currentStep,
  setCurrentStep,
  onExecuteStep
}) {
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
    { num: 13, title: 'AI Family Story Mode', targetView: 'elderly_story', hint: 'FLAGSHIP WOW FEATURE: Narrated photo slideshow with regional tunes!' }
  ];

  const activeStepData = steps.find(s => s.num === currentStep) || steps[0];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const nextData = steps.find(s => s.num === next);
      if (nextData) onExecuteStep(nextData);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const prevData = steps.find(s => s.num === prev);
      if (prevData) onExecuteStep(prevData);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-6xl mx-auto">
      <div className="bg-slate-900/95 border-2 border-amber-500/80 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
              #{activeStepData.num}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-amber text-xs font-extrabold">SIH 3-MIN JUDGE FLOW</span>
                <span className="text-xs text-slate-400 font-semibold">Step {activeStepData.num} of 13</span>
              </div>
              <h4 className="text-lg md:text-xl font-extrabold text-white">{activeStepData.title}</h4>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-xs text-slate-200 font-medium flex-1 max-w-xl hidden lg:block">
            💡 <strong>Judge Note:</strong> {activeStepData.hint}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="p-3 rounded-2xl bg-slate-800 text-white disabled:opacity-40 hover:bg-slate-700 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
              {steps.map((st) => (
                <button
                  key={st.num}
                  onClick={() => {
                    setCurrentStep(st.num);
                    onExecuteStep(st);
                  }}
                  className={`w-7 h-7 rounded-xl font-black text-xs transition-all ${
                    currentStep === st.num
                      ? 'bg-amber-400 text-black font-extrabold scale-110 shadow-lg'
                      : currentStep > st.num
                      ? 'bg-teal-600/50 text-teal-200'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {st.num}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextStep}
              disabled={currentStep === steps.length}
              className="btn-primary py-2.5 px-5 text-sm font-extrabold flex items-center gap-1 shadow-lg shadow-amber-500/20"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
