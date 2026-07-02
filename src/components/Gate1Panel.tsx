import { useState } from 'react'
import type { GateHandlers } from '@/agent/gateController'
import type { GateSnapshot } from '@/types/agent'

type Gate1PanelProps = {
  gate: GateSnapshot
  sourcePreviewUrl: string
  handlers: GateHandlers
}

const gateShell =
  'space-y-4 rounded-2xl border-2 border-amber-400/45 bg-amber-50/80 p-5 dark:border-amber-500/35 dark:bg-amber-950/30'
const gateLabel = 'text-xs font-semibold tracking-wide text-amber-900/70 uppercase dark:text-amber-200/80'
const gateBody = 'text-sm text-amber-950/80 dark:text-amber-100/85'
const gateField =
  'rounded-xl border border-amber-300/80 bg-preview-frame px-3 py-2 text-sm text-ink dark:border-amber-500/30'

export function Gate1Panel({ gate, sourcePreviewUrl, handlers }: Gate1PanelProps) {
  const [nudge, setNudge] = useState('')
  const [character, setCharacter] = useState(gate.proposedCharacter)

  return (
    <section className={gateShell} aria-label="Gate 1 — trace review">
      <header className="space-y-1">
        <p className={gateLabel}>Gate 1 — Trace review</p>
        <p className={gateBody}>{gate.summary}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-amber-900/60 dark:text-amber-200/70">
            Source PNG
          </figcaption>
          <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-preview p-3 dark:border-amber-500/25">
            <img
              src={sourcePreviewUrl}
              alt="Source glyph"
              className="max-h-44 max-w-full object-contain"
            />
          </div>
        </figure>
        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-amber-900/60 dark:text-amber-200/70">
            Traced vector
          </figcaption>
          {gate.tracePreviewPng ? (
            <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-preview-frame p-3 dark:border-amber-500/25">
              <img
                src={gate.tracePreviewPng}
                alt="Trace preview"
                className="max-h-44 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-amber-200 text-sm text-amber-900/50 dark:border-amber-500/30 dark:text-amber-200/50">
              No trace preview yet
            </div>
          )}
        </figure>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-amber-900/70 dark:text-amber-200/80">
            Proposed character
          </span>
          <input
            type="text"
            maxLength={2}
            value={character}
            onChange={(e) => setCharacter(e.target.value.slice(0, 1))}
            className="w-16 rounded-lg border border-amber-300 bg-preview-frame px-3 py-2 text-center text-lg font-medium dark:border-amber-500/30"
          />
        </label>
        <button
          type="button"
          onClick={() => character && handlers.fixCharacter(character)}
          className="btn-secondary border-amber-400/50 px-4 py-2 dark:border-amber-500/35"
        >
          Fix character
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-amber-900/70 dark:text-amber-200/80">
          Re-trace nudge (optional)
        </span>
        <textarea
          value={nudge}
          onChange={(e) => setNudge(e.target.value)}
          placeholder='e.g. "sharper corners" or "remove speckles"'
          rows={2}
          className={`w-full ${gateField}`}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => handlers.accept()} className="btn-primary">
          Accept trace
        </button>
        <button
          type="button"
          onClick={() => handlers.retrace(nudge.trim() || 'sharper corners')}
          className="btn-secondary border-amber-500/50 dark:border-amber-500/35"
        >
          Re-trace
        </button>
      </div>
    </section>
  )
}