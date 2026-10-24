/**
 * WizardProgressBar.tsx
 * Visual progress stepper for the 4-step questionnaire wizard.
 */

interface WizardProgressBarProps {
  currentStep: number // 1 to 4
  onStepClick?: (step: number) => void
  canNavigateToStep?: (step: number) => boolean
}

const STEPS = [
  { step: 1, title: 'Profile', subtitle: 'Required' },
  { step: 2, title: 'Behavior', subtitle: 'Movement' },
  { step: 3, title: 'Safety Check', subtitle: 'Red Flags' },
  { step: 4, title: 'Lifestyle', subtitle: 'Context' },
]

export function WizardProgressBar({ currentStep, onStepClick, canNavigateToStep }: WizardProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        <span>Step {currentStep} of {STEPS.length}</span>
        <span className="font-bold" style={{ color: 'var(--text-accent)' }}>
          {STEPS[currentStep - 1]?.title}
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/40 border border-slate-700/50">
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${(currentStep / STEPS.length) * 100}%`,
            background: 'var(--accent)',
            boxShadow: '0 0 10px var(--accent-glow)',
          }}
        />
      </div>

      {/* Step Bubbles */}
      <div className="grid grid-cols-4 gap-1 pt-1">
        {STEPS.map((s) => {
          const isDone = s.step < currentStep
          const isCurrent = s.step === currentStep
          const canClick = onStepClick && (canNavigateToStep ? canNavigateToStep(s.step) : true)

          return (
            <button
              key={s.step}
              type="button"
              disabled={!canClick}
              onClick={() => onStepClick && onStepClick(s.step)}
              className={`flex flex-col items-center text-center transition py-1 rounded ${
                canClick ? 'cursor-pointer hover:opacity-90' : 'cursor-default opacity-70'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
                  isCurrent
                    ? 'ring-2 ring-cyan-400 bg-cyan-500 text-slate-950'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isDone ? '✓' : s.step}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
