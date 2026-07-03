import { useState } from 'react'
import type { GateHandlers } from '@/agent/gateController'
import type { GateSnapshot } from '@/types/agent'

type Gate1PanelProps = {
  gate: GateSnapshot
  sourcePreviewUrl: string
  handlers: GateHandlers
}

export function Gate1Panel({ gate, sourcePreviewUrl, handlers }: Gate1PanelProps) {
  const [nudge, setNudge] = useState('')
  const [character, setCharacter] = useState(gate.proposedCharacter)

  return (
    <section className="gate-panel gate-panel--trace" aria-label="Gate 1 — trace review">
      <header className="space-y-1">
        <p className="gate-panel-label">
          Gate 1 — Trace review{' '}
          <span className="badge badge-warning">Review required</span>
        </p>
        <p className="text-sm text-muted">{gate.summary}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="mill-kicker">Source PNG</figcaption>
          <div className="flex items-center justify-center border border-border bg-preview p-3">
            <img
              src={sourcePreviewUrl}
              alt="Source glyph"
              className="max-h-44 max-w-full object-contain"
            />
          </div>
        </figure>
        <figure className="space-y-2">
          <figcaption className="mill-kicker">Traced vector</figcaption>
          {gate.tracePreviewPng ? (
            <div className="flex items-center justify-center border border-border bg-preview-frame p-3">
              <img
                src={gate.tracePreviewPng}
                alt="Trace preview"
                className="max-h-44 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center border border-dashed border-border text-sm text-muted">
              No trace preview yet
            </div>
          )}
        </figure>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="mill-kicker">Proposed character</span>
          <input
            type="text"
            maxLength={2}
            value={character}
            onChange={(e) => setCharacter(e.target.value.slice(0, 1))}
            className="field-input w-16 text-center text-lg font-medium"
          />
        </label>
        <button
          type="button"
          onClick={() => character && handlers.fixCharacter(character)}
          className="btn btn-secondary"
        >
          Fix character
        </button>
      </div>

      <label className="block space-y-1">
        <span className="mill-kicker">Re-trace nudge (optional)</span>
        <textarea
          value={nudge}
          onChange={(e) => setNudge(e.target.value)}
          placeholder='e.g. "sharper corners" or "remove speckles"'
          rows={2}
          className="field-input w-full text-sm"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => handlers.accept()} className="btn btn-primary">
          Accept trace
        </button>
        <button
          type="button"
          onClick={() => handlers.retrace(nudge.trim() || 'sharper corners')}
          className="btn btn-secondary"
        >
          Re-trace
        </button>
      </div>
    </section>
  )
}