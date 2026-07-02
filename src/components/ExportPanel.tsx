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
  embedded?: boolean
}

export function ExportPanel({
  family,
  recipe,
  output,
  onDownload,
  onCopyRecipe,
  onReplayRecipe,
  isReplaying,
  embedded,
}: ExportPanelProps) {
  const [recipeText, setRecipeText] = useState('')
  const [replayError, setReplayError] = useState<string | null>(null)
  const base = family.replace(/\s+/g, '')

  async function handleReplay() {
    setReplayError(null)
    try {
      await onReplayRecipe(recipeText.trim())
    } catch (err) {
      setReplayError(err instanceof Error ? err.message : 'Replay failed')
    }
  }

  const content = (
    <>
      {!embedded && (
        <header className="space-y-1">
          <h2 className="panel-heading">Export</h2>
          <p className="text-sm text-muted">
            TTF master + WOFF2 web font. WOFF is a passthrough stub until a WASM encoder lands.
          </p>
        </header>
      )}
      {embedded && (
        <p className="text-sm text-muted">
          TTF master + WOFF2 web font. WOFF is a passthrough stub until a WASM encoder lands.
        </p>
      )}

      {output ? (
        <div className="flex flex-wrap gap-2">
          <DownloadChip label={`${base}.ttf`} onClick={() => onDownload('ttf')} />
          <DownloadChip label={`${base}.woff2`} onClick={() => onDownload('woff2')} />
          <DownloadChip label={`${base}.woff`} onClick={() => onDownload('woff')} />
          <DownloadChip label={`${base}-fonts.zip`} onClick={() => onDownload('zip')} primary />
        </div>
      ) : (
        <p className="text-sm text-muted">Build a font to enable downloads.</p>
      )}

      {recipe && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => onCopyRecipe()} className="btn-secondary px-4 py-2">
            Copy recipe
          </button>
          <span className="console-mono-data text-xs text-muted">
            {recipe.glyphs.length} glyph{recipe.glyphs.length === 1 ? '' : 's'} · v{recipe.version}
          </span>
        </div>
      )}

      <div className="space-y-2 border-t border-border pt-4">
        <p className="console-readout">Recipe replay</p>
        <p className="text-xs text-muted">
          Paste recipe JSON, upload matching PNGs (one per glyph, same order), replay with zero
          model calls.
        </p>
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste recipe JSON…"
          rows={4}
          className="field-input w-full font-mono text-xs"
        />
        {replayError && (
          <p className="console-mono-data text-xs" style={{ color: 'var(--state-fail)' }}>
            {replayError}
          </p>
        )}
        <button
          type="button"
          onClick={() => handleReplay()}
          disabled={!recipeText.trim() || isReplaying}
          className="btn-primary px-4 py-2"
        >
          {isReplaying ? 'Replaying…' : 'Replay recipe'}
        </button>
      </div>
    </>
  )

  if (embedded) return <div className="space-y-4">{content}</div>

  return <section className="panel space-y-4 p-5">{content}</section>
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
      className={
        primary
          ? 'btn-primary px-4 py-2'
          : 'btn-secondary px-4 py-2 text-sm font-medium'
      }
    >
      {label}
    </button>
  )
}