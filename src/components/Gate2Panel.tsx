import { useState } from 'react'
import type { GateHandlers } from '@/agent/gateController'
import type { GateSnapshot } from '@/types/agent'
import type { ValidationResult } from '@/types/pipeline'

type Gate2PanelProps = {
  gate: GateSnapshot
  handlers: GateHandlers
  onAcceptExport?: () => void
}

export function Gate2Panel({ gate, handlers, onAcceptExport }: Gate2PanelProps) {
  const [nudge, setNudge] = useState('')

  return (
    <section
      className="console-gate console-gate--font space-y-4 p-5"
      aria-label="Gate 2 — font review"
    >
      <header className="space-y-1">
        <p className="console-gate-label">Gate 2 — Font review</p>
        <p className="text-sm text-muted">{gate.summary}</p>
      </header>

      <div className="flex flex-wrap items-start gap-4">
        {gate.renderPreviewPng ? (
          <div className="flex items-center justify-center border border-border bg-preview-frame p-4">
            <img
              src={gate.renderPreviewPng}
              alt={`Rendered ${gate.proposedCharacter}`}
              className="max-h-52 max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-52 w-full items-center justify-center border border-dashed border-border text-sm text-muted">
            No render preview
          </div>
        )}
        {gate.validation && <ValidationBadges validation={gate.validation} />}
      </div>

      <label className="block space-y-1">
        <span className="console-readout">Adjust nudge (optional)</span>
        <textarea
          value={nudge}
          onChange={(e) => setNudge(e.target.value)}
          placeholder='e.g. "counter filled" or "sits too low"'
          rows={2}
          className="field-input w-full text-sm"
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
          className="btn-secondary"
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
        <span className="console-badge-warn px-2.5 py-0.5 text-xs font-medium">
          {validation.warnings.length} warning{validation.warnings.length === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        'inline-flex px-2.5 py-0.5 text-xs font-medium',
        ok ? 'console-badge-ok' : 'console-badge-fail',
      ].join(' ')}
    >
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}