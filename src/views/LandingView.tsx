import { SectionHeading } from '@/components/layout/SectionHeading'
import geoContent from '@/lib/geoPrerenderContent.json'
import { routeHref } from '@/lib/navigation'

const LANDING_QUICK_ANSWER = geoContent.landingQuickAnswer

const HOW_TO_STEPS = [
  { step: '1', title: 'Upload', body: 'Drop one or more PNG letter images into the Mill.' },
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
      className="panel flex items-center justify-center gap-4 p-4 sm:gap-6 sm:p-6"
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
    <main className="landing-page flex flex-1 flex-col gap-0 pb-4">
      <section
        id="hero"
        className="section-band section-band--hero -mx-6 px-6 py-12 sm:py-16"
        aria-labelledby="landing-hero-heading"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-[0.28em] text-subtle uppercase">
              Browser font mill
            </p>
            <h1
              id="landing-hero-heading"
              className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
            >
              Glyphmill is a browser tool that converts PNG letter images into installable fonts.
            </h1>
            <p className="max-w-prose text-base leading-relaxed text-muted">
              Drop letter art into the Mill, trace it to vectors, assemble a real typeface, and
              download TTF or WOFF2 — without FontForge and without uploading your artwork for
              conversion.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href={routeHref('mill')} className="btn-primary">
                Try with sample letter A
              </a>
              <a
                href={routeHref('how-it-works')}
                className="text-sm font-medium text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
              >
                How it works →
              </a>
            </div>
          </div>

          <HeroProof />
        </div>

        <details className="panel mt-8 max-w-prose">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            Quick answers
          </summary>
          <ol className="list-decimal space-y-2 border-t border-border px-5 py-4 pl-8 text-sm leading-relaxed text-muted">
            {LANDING_QUICK_ANSWER.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </details>
      </section>

      <section
        id="proof"
        className="landing-section mt-16 space-y-6"
        aria-labelledby="proof-heading"
      >
        <SectionHeading
          id="proof-heading"
          kicker="Proof"
          title="Reference glyph A-KaminoDeco"
          lead="Decorative capital A on cream — open counter, upright on baseline. The pinned no-agent recipe still uses these Phase 0 parameters."
        />
        <div className="panel flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-center">
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
        className="landing-section mt-16 space-y-6"
        aria-labelledby="chambers-heading"
      >
        <SectionHeading
          id="chambers-heading"
          kicker="Platform"
          title="Two chambers"
          lead="Sketch in the Foundry (coming soon). Convert in the Mill (live today)."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="panel space-y-3 p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">Mill · Live</p>
            <h3 className="text-base font-semibold text-ink">Convert artwork to fonts</h3>
            <p className="text-sm leading-relaxed text-muted">
              Upload PNG glyphs, run preprocess → trace → place → build, export TTF / WOFF2.
            </p>
            <a
              href={routeHref('mill')}
              className="inline-block text-sm font-medium text-ink underline-offset-2 hover:underline"
            >
              Open Mill →
            </a>
          </article>
          <article className="inert-frame space-y-3 p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">
              Foundry · <span className="badge-inert normal-case tracking-normal">Soon</span>
            </p>
            <h3 className="text-base font-semibold text-ink">Sketch letterforms first</h3>
            <p className="text-sm leading-relaxed text-muted">
              Agentic style exploration and glyph grids, then handoff to the Mill. Not available yet.
            </p>
            <a
              href={routeHref('foundry')}
              className="inline-block text-sm font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              See planned workflow →
            </a>
          </article>
        </div>
      </section>

      <section
        id="compare"
        className="section-band section-band--muted landing-section -mx-6 mt-16 px-6 py-12"
        aria-labelledby="compare-heading"
      >
        <div className="space-y-6">
          <SectionHeading
            id="compare-heading"
            kicker="Alternatives"
            title="Glyphmill vs manual FontForge"
            lead="A few reasons teams pick the browser mill over desktop outline editing."
          />
          <ul className="grid gap-3 sm:grid-cols-3">
            {COMPARE_HIGHLIGHTS.map((item) => (
              <li key={item.title} className="panel space-y-2 p-5">
                <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                <p className="text-sm text-ink">{item.glyphmill}</p>
                <p className="text-xs text-muted">{item.manual}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            <a
              href={`${routeHref('how-it-works')}#fontforge-heading`}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              See full comparison table →
            </a>
          </p>
        </div>
      </section>

      <section
        id="steps"
        className="landing-section mt-16 space-y-6"
        aria-labelledby="howto-heading"
      >
        <SectionHeading
          id="howto-heading"
          kicker="Workflow"
          title="Three steps"
          lead="From PNG art to installable font files in the Mill console."
        />
        <ol className="grid gap-3 sm:grid-cols-3">
          {HOW_TO_STEPS.map((item) => (
            <li key={item.step} className="panel p-5">
              <span className="font-mono text-xs font-medium text-subtle">{item.step}</span>
              <h3 className="mt-2 text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="cta"
        className="section-band callout landing-section -mx-6 mt-16 px-6 py-10"
        aria-labelledby="cta-heading"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 id="cta-heading" className="text-lg font-semibold text-ink">
              Ready to mill a font?
            </h2>
            <p className="text-sm text-muted">
              Drop <span className="font-medium text-ink">A-KaminoDeco.png</span> in the Mill and hit
              Generate. No API key required.
            </p>
          </div>
          <a href={routeHref('mill')} className="btn-primary shrink-0">
            Try with sample letter A
          </a>
        </div>
      </section>
    </main>
  )
}