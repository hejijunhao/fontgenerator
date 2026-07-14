import { SectionHeading } from '@/components/layout/SectionHeading'
import geoContent from '@/lib/geoPrerenderContent.json'
import { routeHref } from '@/lib/navigation'

const LANDING_QUICK_ANSWER = geoContent.landingQuickAnswer

const HOW_TO_STEPS = [
  { step: '1', title: 'Upload', body: 'Drop one or more PNG letter images into Export.' },
  { step: '2', title: 'Generate', body: 'Run the pipeline — no agent, agent, or recipe replay.' },
  { step: '3', title: 'Download', body: 'Export TTF, WOFF2, or a zip bundle. Install or use on the web.' },
] as const

const COMPARE_HIGHLIGHTS = [
  {
    title: 'Runs in your browser',
    glyphmill: 'WASM pipeline — no FontForge install',
    manual: 'Desktop app per machine',
  },
  {
    title: 'Batch PNG upload',
    glyphmill: 'Drop A, B, C… — one font at export',
    manual: 'Trace each glyph by hand',
  },
  {
    title: 'Recipe replay',
    glyphmill: 'Copy JSON, rebuild free later',
    manual: 'Manual presets each time',
  },
] as const

function HeroProof() {
  return (
    <div
      className="card-static flex items-center justify-center gap-4 sm:gap-6"
      aria-label="Reference glyph before and after conversion"
    >
      <figure className="text-center">
        <img
          src="/A-KaminoDeco.png"
          alt="Source PNG — decorative letter A on cream background"
          width={200}
          height={267}
          loading="eager"
          fetchPriority="high"
          className="mx-auto max-h-40 w-auto rounded-lg border border-border bg-preview-frame object-contain sm:max-h-48"
        />
        <figcaption className="mt-2 text-xs text-muted">Source PNG</figcaption>
      </figure>
      <span className="text-xl text-subtle sm:text-2xl" aria-hidden>
        →
      </span>
      <figure className="text-center">
        <img
          src="/golden/A-render.png"
          alt="Rendered A in built font — open counter, upright on baseline"
          width={200}
          height={200}
          loading="eager"
          className="mx-auto max-h-40 w-auto rounded-lg border border-border bg-preview-frame object-contain sm:max-h-48"
        />
        <figcaption className="mt-2 text-xs text-muted">Built font</figcaption>
      </figure>
    </div>
  )
}

export function LandingView() {
  return (
    <main className="landing-page flex flex-1 flex-col pb-4">
      <section id="hero" className="hero landing-section" aria-labelledby="landing-hero-heading">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12">
          <div>
            <p className="hero-badge">
              <span className="pulse-dot" aria-hidden />
              Browser font mill
            </p>
            <h1 id="landing-hero-heading" className="hero-title max-w-xl">
              Glyphmill is a browser tool that converts PNG letter images into installable fonts.
            </h1>
            <p className="hero-desc">
              Drop letter art into Export, trace it to vectors, assemble a real typeface, and
              download TTF or WOFF2 — without FontForge and without uploading your artwork for
              conversion.
            </p>
            <div className="relative z-[1] flex flex-wrap items-center gap-4">
              <a href={routeHref('export')} className="btn btn-primary">
                Try with sample letter A
              </a>
              <a href={routeHref('how-it-works')} className="btn btn-ghost">
                How it works →
              </a>
            </div>
          </div>

          <HeroProof />
        </div>

        <details className="details-card relative z-[1] mt-8 max-w-prose">
          <summary>Quick answers</summary>
          <ol className="details-card__body list-decimal space-y-2 pl-5">
            {LANDING_QUICK_ANSWER.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </details>
      </section>

      <section
        id="proof"
        className="landing-section section mt-16 space-y-6"
        aria-labelledby="proof-heading"
      >
        <SectionHeading
          id="proof-heading"
          kicker="Proof"
          title="Reference glyph A-KaminoDeco"
          lead="Decorative capital A on cream — open counter, upright on baseline. The pinned no-agent recipe still uses these Phase 0 parameters."
        />
        <div className="card-static flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <figure className="text-center">
            <img
              src="/A-KaminoDeco.png"
              alt="Source PNG — decorative letter A on cream background"
              width={280}
              height={373}
              loading="lazy"
              className="mx-auto rounded-lg border border-border bg-preview-frame"
            />
            <figcaption className="mt-2 text-xs text-muted">Source PNG</figcaption>
          </figure>
          <span className="text-2xl text-subtle" aria-hidden>
            →
          </span>
          <figure className="text-center">
            <img
              src="/golden/A-render.png"
              alt="Rendered A in built font — open counter, upright on baseline"
              width={280}
              height={280}
              loading="lazy"
              className="mx-auto rounded-lg border border-border bg-preview-frame"
            />
            <figcaption className="mt-2 text-xs text-muted">Open counter, on baseline</figcaption>
          </figure>
        </div>
      </section>

      <section
        id="chambers"
        className="landing-section section space-y-6"
        aria-labelledby="chambers-heading"
      >
        <SectionHeading
          id="chambers-heading"
          kicker="Platform"
          title="Two chambers"
          lead="Sketch in Generate (coming soon). Convert in Export (live today)."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="card space-y-3">
            <p className="section-eyebrow mb-0">Export · Live</p>
            <h3 className="card-title">Convert artwork to fonts</h3>
            <p className="card-desc">
              Upload PNG glyphs, run preprocess → trace → place → build, export TTF / WOFF2.
            </p>
            <a href={routeHref('export')} className="btn btn-ghost inline-flex !px-0">
              Open Export →
            </a>
          </article>
          <article className="card-inert space-y-3">
            <p className="section-eyebrow mb-0">
              Generate · <span className="badge badge-default normal-case tracking-normal">Soon</span>
            </p>
            <h3 className="card-title">Sketch letterforms first</h3>
            <p className="card-desc">
              Agentic style exploration and glyph grids, then handoff to Export. Not available yet.
            </p>
            <a href={routeHref('generate')} className="btn btn-ghost inline-flex !px-0">
              See planned workflow →
            </a>
          </article>
        </div>
      </section>

      <section
        id="compare"
        className="landing-section section section-muted space-y-6 py-12"
        aria-labelledby="compare-heading"
      >
        <SectionHeading
          id="compare-heading"
          kicker="Alternatives"
          title="Glyphmill vs manual FontForge"
          lead="A few reasons teams pick the browser mill over desktop outline editing."
        />
        <ul className="grid-2-plus-1">
          {COMPARE_HIGHLIGHTS.map((item) => (
            <li key={item.title} className="card-static space-y-2">
              <h3 className="card-title">{item.title}</h3>
              <p className="text-sm text-ink">{item.glyphmill}</p>
              <p className="text-xs text-muted">{item.manual}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          <a
            href={`${routeHref('how-it-works')}#fontforge-heading`}
            className="btn btn-ghost inline-flex !px-0"
          >
            See full comparison table →
          </a>
        </p>
      </section>

      <section
        id="steps"
        className="landing-section section space-y-6"
        aria-labelledby="howto-heading"
      >
        <SectionHeading
          id="howto-heading"
          kicker="Workflow"
          title="Three steps"
          lead="From PNG art to installable font files in the Export console."
        />
        <ol className="grid-2-plus-1">
          {HOW_TO_STEPS.map((item) => (
            <li key={item.step} className="card-static">
              <span className="font-mono text-xs font-medium text-subtle">{item.step}</span>
              <h3 className="card-title mt-2">{item.title}</h3>
              <p className="card-desc mt-1.5">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="cta"
        className="landing-section section space-y-0"
        aria-labelledby="cta-heading"
      >
        <div className="card-highlight flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 id="cta-heading" className="card-title text-lg">
              Ready to mill a font?
            </h2>
            <p className="card-desc">
              Drop <span className="font-medium text-ink">A-KaminoDeco.png</span> in Export and hit
              Generate. No API key required.
            </p>
          </div>
          <a href={routeHref('export')} className="btn btn-primary shrink-0">
            Try with sample letter A
          </a>
        </div>
      </section>
    </main>
  )
}