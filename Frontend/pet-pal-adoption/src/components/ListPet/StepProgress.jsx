// src/components/ListPet/StepProgress.jsx

const STEPS = [
  { number: 1, label: "Account Setup" },
  { number: 2, label: "Pet Information & Health" },
  { number: 3, label: "Review & Submit" },
];

export default function StepProgress({ currentStep = 2 }) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-xs font-medium text-slate-500">
          {STEPS[currentStep - 1]?.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent === 0 ? 10 : progressPercent}%` }}
        />
      </div>
    </div>
  );
}
