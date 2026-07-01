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
    <section className="space-y-3 rounded-2xl border border-ink/10 bg-white/45 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-ink/70 uppercase">
          Glyphs ({glyphs.length})
        </h2>
        <p className="text-xs text-ink/50">Codepoints assigned A, B, C… by upload order</p>
      </div>

      {recipeMismatch && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {recipeMismatch}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {glyphs.map((glyph, index) => (
          <li
            key={glyph.id}
            className="group relative overflow-hidden rounded-xl border border-ink/10 bg-cream/60"
          >
            <div className="flex aspect-square items-center justify-center p-2">
              <img
                src={glyph.sourcePreviewUrl}
                alt={`Glyph ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-1 border-t border-ink/8 bg-white/70 px-2 py-1.5">
              <span className="truncate text-xs font-medium text-ink/80">
                {String.fromCodePoint(glyph.codepoint)}
                <span className="ml-1 font-normal text-ink/45">U+{glyph.codepoint.toString(16).toUpperCase().padStart(4, '0')}</span>
              </span>
              {!isBusy && glyphs.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove glyph ${String.fromCodePoint(glyph.codepoint)}`}
                  onClick={() => removeGlyph(glyph.id)}
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-ink/45 hover:bg-red-50 hover:text-red-800"
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