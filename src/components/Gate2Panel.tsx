import { useState } from 'react'
import type { GateHandlers } from '@/agent/gateController'
import type { GateSnapshot } from '@/types/agent'
import type { ValidationResult } from '@/types/pipeline'

type Gate2PanelProps = {
  gate: GateSnapshot
  handlers: GateHandlers
  onAcceptExport?: () => void
}

const gateShell =
  'space-y-4 rounded-2xl border-2 border-emerald-400/45 bg-emerald-50/70 p-5 dark:border-emerald-500/35 dark:bg-emerald-950/30'
const gateLabel =
  'text-xs font-semibold tracking-wide text-emerald-900/70 uppercase dark:text-emerald-200/80'
const gateBody = 'text-sm text-emerald-950/80 dark:text-emerald-100/85'
const gateField =
  'w-full rounded-xl border border-emerald-300/80 bg-preview-frame px-3 py-2 text-sm text-ink dark:border-emerald-500/30'

export function Gate2Panel({ gate, handlers, onAcceptExport }: Gate2PanelProps) {
  const [nudge, setNudge] = useState('')

  return (
    <section className={gateShell} aria-label="Gate 2 — font review">
      <header className="space-y-1">
        <p className={gateLabel}>Gate 2 — Font review</p>
        <p className={gateBody}>{gate.summary}</p>
      </header>

      <div className="flex flex-wrap items-start gap-4">
        {gate.renderPreviewPng ? (
          <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-preview-frame p-4 dark:border-emerald-500/25">
            <img
              src={gate.renderPreviewPng}
              alt={`Rendered ${gate.proposedCharacter}`}
              className="max-h-52 max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-emerald-200 text-sm text-emerald-900/50 dark:border-emerald-500/30 dark:text-emerald-200/50">
            No render preview
          </div>
        )}
        {gate.validation && <ValidationBadges validation={gate.validation} />}
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-emerald-900/70 dark:text-emerald-200/80">
          Adjust nudge (optional)
        </span>
        <textarea
          value={nudge}
          onChange={(e) => setNudge(e.target.value)}
          placeholder='e.g. "counter filled" or "sits too low"'
          rows={2}
          className={gateField}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            handlers.accept()
            onAcceptExport?.()
          }}
          className="btn-primary"
        >
          Accept &amp; export
        </button>
        <button
          type="button"
          onClick={() => handlers.adjust(nudge.trim() || 'counter filled')}
          className="btn-secondary border-emerald-500/50 dark:border-emerald-500/35"
        >
          Adjust
        </button>
      </div>
    </section>
  )
}

function ValidationBadges({ validation }: { validation: ValidationResult }) {
  return (
    <div className="flex flex-col gap-2">
      <Badge ok={validation.roundTripOk} label="Round-trip parse" />
      {validation.warnings.length > 0 && (
        <p className="max-w-xs text-xs text-emerald-900/60 dark:text-emerald-200/60">
          {validation.warnings.length} warning{validation.warnings.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        ok
          ? 'border border-emerald-300/50 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100'
          : 'border border-red-300/50 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100',
      ].join(' ')}
    >
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}