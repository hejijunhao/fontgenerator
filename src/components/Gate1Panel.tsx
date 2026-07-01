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
    <section
      className="space-y-4 rounded-2xl border-2 border-amber-400/50 bg-amber-50/80 p-5"
      aria-label="Gate 1 — trace review"
    >
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-wide text-amber-900/70 uppercase">
          Gate 1 — Trace review
        </p>
        <p className="text-sm text-amber-950/80">{gate.summary}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-amber-900/60">Source PNG</figcaption>
          <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-cream p-3">
            <img
              src={sourcePreviewUrl}
              alt="Source glyph"
              className="max-h-44 max-w-full object-contain"
            />
          </div>
        </figure>
        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-amber-900/60">Traced vector</figcaption>
          {gate.tracePreviewPng ? (
            <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-white p-3">
              <img
                src={gate.tracePreviewPng}
                alt="Trace preview"
                className="max-h-44 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-amber-200 text-sm text-amber-900/50">
              No trace preview yet
            </div>
          )}
        </figure>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-amber-900/70">Proposed character</span>
          <input
            type="text"
            maxLength={2}
            value={character}
            onChange={(e) => setCharacter(e.target.value.slice(0, 1))}
            className="w-16 rounded-lg border border-amber-300 bg-white px-3 py-2 text-center text-lg font-medium"
          />
        </label>
        <button
          type="button"
          onClick={() => character && handlers.fixCharacter(character)}
          className="rounded-xl border border-amber-400/60 bg-white px-4 py-2 text-sm font-medium text-amber-950"
        >
          Fix character
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-amber-900/70">Re-trace nudge (optional)</span>
        <textarea
          value={nudge}
          onChange={(e) => setNudge(e.target.value)}
          placeholder='e.g. "sharper corners" or "remove speckles"'
          rows={2}
          className="w-full rounded-xl border border-amber-300/80 bg-white px-3 py-2 text-sm text-ink"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handlers.accept()}
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream"
        >
          Accept trace
        </button>
        <button
          type="button"
          onClick={() => handlers.retrace(nudge.trim() || 'sharper corners')}
          className="rounded-xl border border-amber-500/50 bg-white px-5 py-2.5 text-sm font-medium text-amber-950"
        >
          Re-trace
        </button>
      </div>
    </section>
  )
}