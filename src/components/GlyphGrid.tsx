import { useProjectStore } from '@/store/projectStore'

export function GlyphGrid() {
  const glyphs = useProjectStore((s) => s.glyphs)
  const recipe = useProjectStore((s) => s.recipe)
  const removeGlyph = useProjectStore((s) => s.removeGlyph)
  const isBusy = useProjectStore((s) => {
    const g = s.glyphs[0]
    return (
      s.isGenerating ||
      s.isReplaying ||
      s.isAgentRunning ||
      g?.status === 'gate1' ||
      g?.status === 'gate2'
    )
  })

  if (glyphs.length === 0) return null

  const recipeMismatch =
    recipe && recipe.glyphs.length !== glyphs.length
      ? `Recipe expects ${recipe.glyphs.length} glyph${recipe.glyphs.length === 1 ? '' : 's'}, but ${glyphs.length} PNG${glyphs.length === 1 ? '' : 's'} are loaded.`
      : null

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-heading">Glyphs ({glyphs.length})</h2>
        <p className="text-xs text-muted">Codepoints assigned A, B, C… by upload order</p>
      </div>

      {recipeMismatch && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/35 dark:text-amber-100"
        >
          {recipeMismatch}
        </p>
      )}

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {glyphs.map((glyph, index) => (
          <li
            key={glyph.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-surface-muted"
          >
            <div className="flex aspect-square items-center justify-center bg-preview p-2">
              <img
                src={glyph.sourcePreviewUrl}
                alt={`Glyph ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-1 border-t border-border bg-surface-strong px-2 py-1.5">
              <span className="truncate text-xs font-medium text-subtle">
                {String.fromCodePoint(glyph.codepoint)}
                <span className="ml-1 font-normal text-muted">
                  U+{glyph.codepoint.toString(16).toUpperCase().padStart(4, '0')}
                </span>
              </span>
              {!isBusy && glyphs.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove glyph ${String.fromCodePoint(glyph.codepoint)}`}
                  onClick={() => removeGlyph(glyph.id)}
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-muted hover:bg-red-50 hover:text-red-800 dark:hover:bg-red-950/50 dark:hover:text-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}