import { useState } from 'react'
import type { FontExportBundle, Recipe } from '@/types/pipeline'

type ExportPanelProps = {
  family: string
  recipe?: Recipe
  output?: FontExportBundle
  onDownload: (format: 'ttf' | 'woff' | 'woff2' | 'zip') => void
  onCopyRecipe: () => Promise<void>
  onReplayRecipe: (json: string) => Promise<void>
  isReplaying: boolean
}

export function ExportPanel({
  family,
  recipe,
  output,
  onDownload,
  onCopyRecipe,
  onReplayRecipe,
  isReplaying,
}: ExportPanelProps) {
  const [recipeText, setRecipeText] = useState('')
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [replayError, setReplayError] = useState<string | null>(null)
  const base = family.replace(/\s+/g, '')

  async function handleCopy() {
    await onCopyRecipe()
    setCopyStatus('Copied')
    setTimeout(() => setCopyStatus(null), 2000)
  }

  async function handleReplay() {
    setReplayError(null)
    try {
      await onReplayRecipe(recipeText.trim())
    } catch (err) {
      setReplayError(err instanceof Error ? err.message : 'Replay failed')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-ink/10 bg-white/55 p-5">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold tracking-wide text-ink/70 uppercase">Export</h2>
        <p className="text-sm text-ink/60">
          TTF master + WOFF2 web font. WOFF is a passthrough stub until a WASM encoder lands.
        </p>
      </header>

      {output ? (
        <div className="flex flex-wrap gap-2">
          <DownloadChip label={`${base}.ttf`} onClick={() => onDownload('ttf')} />
          <DownloadChip label={`${base}.woff2`} onClick={() => onDownload('woff2')} />
          <DownloadChip label={`${base}.woff`} onClick={() => onDownload('woff')} />
          <DownloadChip label={`${base}-fonts.zip`} onClick={() => onDownload('zip')} primary />
        </div>
      ) : (
        <p className="text-sm text-ink/50">Build a font to enable downloads.</p>
      )}

      {recipe && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleCopy()}
            className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink"
          >
            Copy recipe
          </button>
          {copyStatus && <span className="text-xs text-ink/55">{copyStatus}</span>}
          <span className="text-xs text-ink/45">
            {recipe.glyphs.length} glyph{recipe.glyphs.length === 1 ? '' : 's'} · v{recipe.version}
          </span>
        </div>
      )}

      <div className="space-y-2 border-t border-ink/8 pt-4">
        <p className="text-xs font-medium text-ink/55 uppercase tracking-wide">Recipe replay</p>
        <p className="text-xs text-ink/50">
          Paste recipe JSON, upload matching PNGs (one per glyph, same order), replay with zero
          model calls.
        </p>
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste recipe JSON…"
          rows={4}
          className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 font-mono text-xs text-ink"
        />
        {replayError && <p className="text-xs text-red-800">{replayError}</p>}
        <button
          type="button"
          onClick={() => handleReplay()}
          disabled={!recipeText.trim() || isReplaying}
          className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream disabled:opacity-40"
        >
          {isReplaying ? 'Replaying…' : 'Replay recipe'}
        </button>
      </div>
    </section>
  )
}

function DownloadChip({
  label,
  onClick,
  primary,
}: {
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        primary
          ? 'bg-ink text-cream'
          : 'border border-ink/20 bg-white text-ink hover:bg-cream/80',
      ].join(' ')}
    >
      {label}
    </button>
  )
}