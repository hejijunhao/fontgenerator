import { MILL_STAGES, type MillStage } from '@/lib/millStage'

type MillStepIndicatorProps = {
  activeStage: MillStage
}

export function MillStepIndicator({ activeStage }: MillStepIndicatorProps) {
  return (
    <nav aria-label="Mill stages" className="mb-2 flex flex-wrap items-center gap-4 sm:gap-6">
      {MILL_STAGES.map((stage) => {
        const active = stage.id === activeStage
        return (
          <div
            key={stage.id}
            className="console-stage console-step-transition flex items-center gap-2 transition-colors duration-200"
            data-active={active || undefined}
          >
            <span className="console-stage-dot" aria-hidden />
            <span className="console-stage-tick" aria-hidden />
            <span>{stage.label}</span>
          </div>
        )
      })}
    </nav>
  )
}