import { MILL_STAGES, type MillStage } from '@/lib/millStage'

type MillStepIndicatorProps = {
  activeStage: MillStage
}

export function MillStepIndicator({ activeStage }: MillStepIndicatorProps) {
  return (
    <nav aria-label="Mill stages" className="mill-steps">
      {MILL_STAGES.map((stage) => {
        const active = stage.id === activeStage
        return (
          <div
            key={stage.id}
            className={['mill-step', active ? 'mill-step--active' : ''].filter(Boolean).join(' ')}
          >
            <span className="mill-step-dot" aria-hidden />
            <span>{stage.label}</span>
          </div>
        )
      })}
    </nav>
  )
}