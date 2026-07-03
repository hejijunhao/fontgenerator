import type { ReactNode } from 'react'
import { Bay } from '@/components/console/Bay'
import { ReadoutLabel } from '@/components/console/ReadoutLabel'
import type { MillStage } from '@/lib/millStage'

type StageBayProps = {
  kicker: string
  stage: MillStage
  activeStage: MillStage
  expanded: boolean
  onExpand: () => void
  collapsedSummary: string
  children: ReactNode
}

export function StageBay({
  kicker,
  stage,
  activeStage,
  expanded,
  onExpand,
  collapsedSummary,
  children,
}: StageBayProps) {
  if (!expanded) {
    return (
      <section className="stage-bay">
        <button
          type="button"
          onClick={onExpand}
          className="stage-bay-collapsed"
          aria-expanded={false}
          aria-label={`Expand ${kicker} — ${collapsedSummary}`}
        >
          <div className="min-w-0 space-y-1">
            <ReadoutLabel>{kicker}</ReadoutLabel>
            <p className="mono-data truncate text-muted">{collapsedSummary}</p>
          </div>
          <span className="mono-data shrink-0 text-subtle" aria-hidden>
            +
          </span>
        </button>
      </section>
    )
  }

  return (
    <Bay kicker={kicker} signal={activeStage === stage}>
      {children}
    </Bay>
  )
}