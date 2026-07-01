import { errorHintForTool, formatStepDuration, labelForTool } from '@/lib/agentLabels'
import type { AgentStep, AgentUsageNote } from '@/types/agent'

type RunViewProps = {
  steps: AgentStep[]
  isRunning: boolean
  usageNote?: AgentUsageNote
}

export function RunView({ steps, isRunning, usageNote }: RunViewProps) {
  if (steps.length === 0 && !isRunning) return null

  const runStarted = steps[0]?.timestamp

  return (
    <section className="space-y-3 rounded-2xl border border-ink/10 bg-white/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-ink/70 uppercase">
          Agent run
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink/55">
          {runStarted != null && (
            <span>
              Elapsed{' '}
              {formatStepDuration(
                (steps[steps.length - 1]?.timestamp ?? Date.now()) - runStarted,
              )}
            </span>
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
              className="flex gap-3 rounded-xl border border-ink/8 bg-cream/40 px-3 py-2.5 text-sm"
            >
              <span className="w-5 shrink-0 pt-0.5 text-xs font-medium text-ink/40">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{step.tool}</span>
                  <span className="text-xs text-ink/50">{labelForTool(step.tool)}</span>
                  {duration != null && (
                    <span className="text-xs text-ink/40">+{formatStepDuration(duration)}</span>
                  )}
                  {step.verdict && (
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/70">
                      {step.verdict}
                    </span>
                  )}
                  {step.error && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-900">
                      error
                    </span>
                  )}
                </div>
                <pre className="max-h-24 overflow-auto text-xs whitespace-pre-wrap text-ink/60">
                  {JSON.stringify(step.params, null, 2)}
                </pre>
                {step.error && (
                  <div className="space-y-0.5 text-xs text-red-800">
                    <p>{step.error}</p>
                    {hint && <p className="text-red-900/70">Recovery: {hint}</p>}
                  </div>
                )}
              </div>
              {step.previewPng && (
                <img
                  src={step.previewPng}
                  alt={`${step.tool} preview`}
                  className="h-16 w-16 shrink-0 rounded-lg border border-ink/10 bg-white object-contain"
                />
              )}
            </li>
          )
        })}
      </ol>

      {isRunning && steps.length > 0 && !steps[steps.length - 1]?.error && (
        <p className="text-xs text-ink/50">
          The agent is choosing parameters and calling WASM tools locally. Only preview images
          and messages go through the proxy.
        </p>
      )}

      {usageNote && (
        <p className="text-xs text-ink/50">
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