import { navigate, routeHref } from '@/lib/navigation'

const GLYPH_PLACEHOLDERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const

export function FoundryPlaceholderView() {
  return (
    <main className="flex flex-1 flex-col gap-10 pb-4">
      <div className="announce" role="status">
        <span className="pulse-dot" aria-hidden />
        <p>
          <span className="font-medium">Not available</span> — Mill is live today.{' '}
          <a
            href={routeHref('mill')}
            className="font-medium underline-offset-2 hover:underline"
            onClick={(e) => {
              e.preventDefault()
              navigate('mill')
            }}
          >
            Open Mill →
          </a>
        </p>
      </div>

      <section className="section space-y-5 pt-2" aria-labelledby="foundry-heading">
        <div className="space-y-4">
          <p className="section-eyebrow">Chamber · Not yet available</p>
          <h1 id="foundry-heading" className="hero-title max-w-2xl">
            Foundry — agentic glyph creation
          </h1>
          <p className="hero-desc max-w-prose">
            The Foundry chamber will let you describe a letter style, explore glyph variations with
            an agent, and hand finished artwork to the Mill. Image generation and Foundry-specific
            tooling are not wired yet — this page is a preview of the planned workflow.
          </p>
          <p className="max-w-prose text-sm leading-relaxed text-muted">
            Glyphmill is a{' '}
            <a href={routeHref('how-it-works')} className="font-medium text-ink underline-offset-2 hover:underline">
              two-chamber workshop
            </a>
            : sketch in the Foundry, convert in the Mill. The Mill is live today for PNG-to-font
            conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={routeHref('mill')}
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              navigate('mill')
            }}
          >
            Use the Mill today
          </a>
          <a href={routeHref('how-it-works')} className="btn btn-secondary">
            How it works
          </a>
        </div>
      </section>

      <section className="section space-y-4" aria-labelledby="foundry-preview-heading">
        <h2 id="foundry-preview-heading" className="section-title">
          Planned interface
        </h2>
        <p className="section-desc max-w-prose">
          A static wireframe of the future Foundry console — brief on the left, variation grid on
          the right. No API calls; nothing here is interactive.
        </p>

        <div
          className="card-inert grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
          aria-hidden
        >
          <div className="space-y-3 rounded-lg border border-dashed border-border bg-surface p-4">
            <p className="font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-subtle uppercase">
              Brief
            </p>
            <div className="space-y-2 rounded-md border border-dashed border-border bg-surface-strong/50 p-3">
              <div className="h-2.5 w-3/4 rounded-sm bg-border" />
              <div className="h-2.5 w-full rounded-sm bg-border" />
              <div className="h-2.5 w-5/6 rounded-sm bg-border" />
              <div className="mt-4 h-16 rounded-sm border border-dashed border-border-strong" />
            </div>
            <div className="inline-flex rounded-full border border-border bg-surface-muted/80 px-4 py-1.5 font-mono text-[0.6875rem] tracking-wide text-subtle">
              Generate variations
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-dashed border-border bg-surface p-4">
            <p className="font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-subtle uppercase">
              Glyph grid
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {GLYPH_PLACEHOLDERS.map((glyph) => (
                <div
                  key={glyph}
                  className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-surface-strong/40 font-mono text-sm text-subtle"
                >
                  {glyph}
                </div>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-border bg-surface-muted/80 px-4 py-1.5 font-mono text-[0.6875rem] tracking-wide text-subtle">
              Send to Mill
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card-highlight flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="card-title">Need a font from existing PNGs?</p>
            <p className="card-desc">
              Open the Mill, drop your letter art, and download TTF or WOFF2 — no API key required.
            </p>
          </div>
          <a
            href={routeHref('mill')}
            className="btn btn-primary shrink-0"
            onClick={(e) => {
              e.preventDefault()
              navigate('mill')
            }}
          >
            Use the Mill today
          </a>
        </div>
      </section>
    </main>
  )
}