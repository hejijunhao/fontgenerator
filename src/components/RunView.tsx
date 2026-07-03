import { useEffect, useState } from 'react'
import { errorHintForTool, formatStepDuration, labelForTool } from '@/lib/agentLabels'
import type { AgentStep, AgentUsageNote } from '@/types/agent'

type RunViewProps = {
  steps: AgentStep[]
  isRunning: boolean
  usageNote?: AgentUsageNote
}

type AgentElapsedProps = {
  runStarted: number
  frozenAt?: number
}

function AgentElapsed({ runStarted, frozenAt }: AgentElapsedProps) {
  const [now, setNow] = useState(() => Date.now())
  const live = frozenAt == null

  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [live])

  return <span>Elapsed {formatStepDuration((frozenAt ?? now) - runStarted)}</span>
}

export function RunView({ steps, isRunning, usageNote }: RunViewProps) {
  const runStarted = steps[0]?.timestamp
  const lastStepAt = steps[steps.length - 1]?.timestamp

  if (steps.length === 0 && !isRunning) return null

  return (
    <section className="stage-bay-nested space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="mill-kicker">Agent run</h2>
        <div className="mono-data flex flex-wrap items-center gap-2 text-muted">
          {runStarted != null && (
            <AgentElapsed
              key={runStarted}
              runStarted={runStarted}
              frozenAt={isRunning ? undefined : (lastStepAt ?? runStarted)}
            />
          )}
          {isRunning && <span className="font-medium">Waiting for next tool…</span>}
        </div>
      </div>

      <ol className="space-y-2">
        {steps.map((step, index) => {
          const prev = steps[index - 1]
          const duration = prev ? step.timestamp - prev.timestamp : undefined
          const hint = step.error ? errorHintForTool(step.tool) : undefined

          return (
            <li
              key={`${step.timestamp}-${step.tool}-${index}`}
              className="flex gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm"
            >
              <span className="w-5 shrink-0 pt-0.5 text-xs font-medium text-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono-data font-medium text-ink">{step.tool}</span>
                  <span className="text-xs text-muted">{labelForTool(step.tool)}</span>
                  {duration != null && (
                    <span className="text-xs text-muted">+{formatStepDuration(duration)}</span>
                  )}
                  {step.verdict && <span className="badge badge-default">{step.verdict}</span>}
                  {step.error && <span className="badge badge-error">error</span>}
                </div>
                <pre className="max-h-24 overflow-auto font-mono text-xs whitespace-pre-wrap text-muted">
                  {JSON.stringify(step.params, null, 2)}
                </pre>
                {step.error && (
                  <div className="space-y-0.5 text-xs text-error">
                    <p>{step.error}</p>
                    {hint && <p className="opacity-80">Recovery: {hint}</p>}
                  </div>
                )}
              </div>
              {step.previewPng && (
                <img
                  src={step.previewPng}
                  alt={`${step.tool} preview`}
                  className="h-16 w-16 shrink-0 rounded-lg border border-border bg-preview-frame object-contain"
                />
              )}
            </li>
          )
        })}
      </ol>

      {isRunning && steps.length > 0 && !steps[steps.length - 1]?.error && (
        <p className="text-xs text-muted">
          The agent is choosing parameters and calling WASM tools locally. Only preview images
          and messages go through the proxy.
        </p>
      )}

      {usageNote && (
        <p className="mono-data text-muted">
          Tokens: {usageNote.totalTokens ?? '—'}
          {usageNote.cacheReadTokens != null && usageNote.cacheReadTokens > 0
            ? ` · cache read: ${usageNote.cacheReadTokens}`
            : ' · cache read: 0 (verify provider options)'}
          {usageNote.cost != null ? ` · cost: $${usageNote.cost.toFixed(4)}` : ''}
          {usageNote.modelSlug ? ` · ${usageNote.modelSlug}` : ''}
        </p>
      )}
    </section>
  )
}