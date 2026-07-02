import { useState } from 'react'
import { FALLBACK_MODEL, DEFAULT_MODEL } from '@/agent/provider'
import { useProjectStore } from '@/store/projectStore'

export function AgentSettings() {
  const agentModel = useProjectStore((s) => s.agentModel)
  const byoApiKey = useProjectStore((s) => s.byoApiKey)
  const setAgentModel = useProjectStore((s) => s.setAgentModel)
  const setByoApiKey = useProjectStore((s) => s.setByoApiKey)
  const isBusy = useProjectStore(
    (s) => s.isAgentRunning || s.isGenerating || s.isReplaying,
  )
  const [showKey, setShowKey] = useState(false)

  return (
    <section className="panel p-4">
      <header className="space-y-1">
        <h2 className="panel-heading">Agent settings</h2>
        <p className="text-xs text-muted">
          Hosted mode uses the server key. BYO-key sends your OpenRouter key per request only —
          never stored.
        </p>
      </header>

      <fieldset className="mt-3 space-y-2" disabled={isBusy}>
        <legend className="text-xs font-medium text-subtle">Model</legend>
        <div className="flex flex-wrap gap-2">
          <ModelChip
            active={agentModel === 'opus'}
            label="Opus 4.8"
            detail="Best quality"
            slug={DEFAULT_MODEL}
            onClick={() => setAgentModel('opus')}
          />
          <ModelChip
            active={agentModel === 'sonnet'}
            label="Sonnet 5"
            detail="Faster, cheaper"
            slug={FALLBACK_MODEL}
            onClick={() => setAgentModel('sonnet')}
          />
        </div>
      </fieldset>

      <label className="mt-3 block space-y-1">
        <span className="text-xs font-medium text-subtle">
          OpenRouter API key (optional BYO)
        </span>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={byoApiKey}
            onChange={(e) => setByoApiKey(e.target.value.trim())}
            placeholder="sk-or-…"
            disabled={isBusy}
            autoComplete="off"
            spellCheck={false}
            className="field-input min-w-0 flex-1 font-mono text-xs disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            disabled={isBusy}
            className="btn-secondary px-3 py-2 text-xs"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {byoApiKey && (
          <p className="text-xs text-muted">
            Key stays in memory until you refresh. Routed through{' '}
            <code className="text-subtle">/api/agent</code> — not saved server-side.
          </p>
        )}
      </label>
    </section>
  )
}

function ModelChip({
  active,
  label,
  detail,
  slug,
  onClick,
}: {
  active: boolean
  label: string
  detail: string
  slug: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl border px-4 py-2 text-left text-sm transition-colors',
        active
          ? 'border-accent bg-accent text-accent-fg'
          : 'border-border-strong bg-surface-strong text-ink hover:bg-surface-hover',
      ].join(' ')}
    >
      <span className="font-medium">{label}</span>
      <span
        className={['block text-xs', active ? 'text-accent-fg/75' : 'text-muted'].join(' ')}
      >
        {detail} · <span className="font-mono">{slug}</span>
      </span>
    </button>
  )
}