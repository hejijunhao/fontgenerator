import type { PipelineUiStep } from '@/store/projectStore'

const STEPS: { id: PipelineUiStep; label: string }[] = [
  { id: 'preprocess', label: 'Preprocess' },
  { id: 'trace', label: 'Trace' },
  { id: 'place', label: 'Place' },
  { id: 'build', label: 'Build' },
  { id: 'validate', label: 'Validate' },
  { id: 'render', label: 'Preview' },
]

const ORDER = STEPS.map((s) => s.id)

function stepIndex(step: PipelineUiStep): number {
  if (step === 'idle' || step === 'done') return -1
  return ORDER.indexOf(step)
}

type ProgressStepsProps = {
  currentStep: PipelineUiStep
  isActive: boolean
}

export function ProgressSteps({ currentStep, isActive }: ProgressStepsProps) {
  const activeIndex = stepIndex(currentStep)
  const complete = currentStep === 'done'

  return (
    <ol className="flex flex-wrap gap-2" aria-label="Pipeline progress">
      {STEPS.map((step, index) => {
        const isCurrent = isActive && step.id === currentStep
        const isComplete = complete || (activeIndex >= 0 && index < activeIndex)

        return (
          <li
            key={step.id}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              isCurrent
                ? 'bg-accent text-accent-fg'
                : isComplete
                  ? 'bg-surface-hover text-subtle'
                  : 'border border-border bg-surface-muted text-muted',
            ].join(' ')}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}