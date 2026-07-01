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
    <section className="space-y-3 rounded-2xl border border-ink/10 bg-white/45 p-4">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold tracking-wide text-ink/70 uppercase">
          Agent settings
        </h2>
        <p className="text-xs text-ink/50">
          Hosted mode uses the server key. BYO-key sends your OpenRouter key per request only —
          never stored.
        </p>
      </header>

      <fieldset className="space-y-2" disabled={isBusy}>
        <legend className="text-xs font-medium text-ink/60">Model</legend>
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

      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink/60">
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
            className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 font-mono text-xs text-ink disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            disabled={isBusy}
            className="rounded-xl border border-ink/15 px-3 py-2 text-xs text-ink/60"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {byoApiKey && (
          <p className="text-xs text-ink/45">
            Key stays in memory until you refresh. Routed through{' '}
            <code className="text-ink/55">/api/agent</code> — not saved server-side.
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
          ? 'border-ink bg-ink text-cream'
          : 'border-ink/20 bg-white text-ink hover:bg-cream/80',
      ].join(' ')}
    >
      <span className="font-medium">{label}</span>
      <span className={['block text-xs', active ? 'text-cream/75' : 'text-ink/50'].join(' ')}>
        {detail} · <span className="font-mono">{slug}</span>
      </span>
    </button>
  )
}