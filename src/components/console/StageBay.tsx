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
      <section className="console-bay">
        <button
          type="button"
          onClick={onExpand}
          className="console-bay-collapsed flex w-full items-center justify-between gap-4 p-4 text-left"
          aria-expanded={false}
          aria-label={`Expand ${kicker} — ${collapsedSummary}`}
        >
          <div className="min-w-0 space-y-1">
            <ReadoutLabel signal={false}>{kicker}</ReadoutLabel>
            <p className="console-mono-data truncate text-xs text-muted">{collapsedSummary}</p>
          </div>
          <span className="console-mono-data shrink-0 text-xs text-subtle" aria-hidden>
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