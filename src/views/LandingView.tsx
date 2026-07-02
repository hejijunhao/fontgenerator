import { routeHref } from '@/lib/navigation'

const QUICK_ANSWER = [
  'Glyphmill converts PNG letter images into installable TTF and WOFF2 fonts.',
  'The conversion pipeline runs entirely in your browser via WASM.',
  'An optional Claude agent tunes trace parameters; a free no-agent path exists.',
  'Foundry — agentic glyph creation — is coming soon.',
  'No accounts, no uploads of source PNGs for conversion.',
] as const

const HOW_TO_STEPS = [
  { step: '1', title: 'Upload', body: 'Drop one or more PNG letter images into the Mill.' },
  { step: '2', title: 'Generate', body: 'Run the pipeline — no agent, agent, or recipe replay.' },
  { step: '3', title: 'Download', body: 'Export TTF, WOFF2, or a zip bundle. Install or use on the web.' },
] as const

const FONTFORGE_ROWS = [
  ['Runs in browser', 'Yes', 'Desktop install'],
  ['PNG batch upload', 'Yes', 'Manual per glyph'],
  ['Agent parameter tuning', 'Optional', 'Manual sliders'],
  ['Recipe replay', 'Yes', 'Manual presets'],
  ['Privacy', 'Conversion stays local', 'Local desktop'],
] as const

export function LandingView() {
  return (
    <main className="flex flex-1 flex-col gap-14 pb-4">
      <section className="space-y-6 pt-2" aria-labelledby="landing-quick-answer">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.28em] text-subtle uppercase">
            Browser font mill
          </p>
          <h1 id="landing-quick-answer" className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Glyphmill is a browser tool that converts PNG letter images into installable fonts.
          </h1>
          <p className="max-w-prose text-base leading-relaxed text-muted">
            Drop letter art into the Mill, trace it to vectors, assemble a real typeface, and
            download TTF or WOFF2 — without FontForge and without uploading your artwork for
            conversion.
          </p>
        </div>

        <ol className="panel max-w-prose list-decimal space-y-2 px-5 py-4 pl-8 text-sm leading-relaxed text-muted">
          {QUICK_ANSWER.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-3">
          <a href={routeHref('mill')} className="btn-primary">
            Open Mill
          </a>
          <a href={routeHref('how-it-works')} className="btn-secondary">
            How it works
          </a>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="proof-heading">
        <h2 id="proof-heading" className="text-xl font-semibold tracking-tight text-ink">
          Proof on the reference glyph
        </h2>
        <div className="panel flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-center">
          <figure className="text-center">
            <img
              src="/A-KaminoDeco.png"
              alt="Source PNG — decorative letter A on cream background"
              width={280}
              height={373}
              loading="eager"
              fetchPriority="high"
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
            <figcaption className="mt-2 text-xs text-muted">
              Open counter, on baseline
            </figcaption>
          </figure>
        </div>
        <p className="text-sm text-muted">
          Try it: open the Mill and drop <span className="font-medium text-ink">A-KaminoDeco.png</span>{' '}
          from the repo — no API key required.
        </p>
      </section>

      <section className="space-y-5" aria-labelledby="chambers-heading">
        <h2 id="chambers-heading" className="text-xl font-semibold tracking-tight text-ink">
          Two chambers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="panel space-y-3 p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">Mill</p>
            <h3 className="text-base font-semibold text-ink">Convert artwork to fonts</h3>
            <p className="text-sm leading-relaxed text-muted">
              Upload PNG glyphs, run preprocess → trace → place → build, export TTF / WOFF2. Live
              today.
            </p>
            <a href={routeHref('mill')} className="btn-primary inline-block text-sm">
              Open Mill
            </a>
          </article>
          <article className="inert-frame space-y-3 p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">
              Foundry · <span className="badge-inert normal-case tracking-normal">Soon</span>
            </p>
            <h3 className="text-base font-semibold text-ink">Sketch letterforms first</h3>
            <p className="text-sm leading-relaxed text-muted">
              Agentic style exploration and glyph grids, then one-click handoff to the Mill. Not
              available yet — see the planned workflow.
            </p>
            <a href={routeHref('foundry')} className="btn-secondary inline-block text-sm">
              Foundry placeholder
            </a>
          </article>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="compare-heading">
        <h2 id="compare-heading" className="text-xl font-semibold tracking-tight text-ink">
          Glyphmill vs manual FontForge workflow
        </h2>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  Capability
                </th>
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  Glyphmill
                </th>
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  FontForge manual
                </th>
              </tr>
            </thead>
            <tbody>
              {FONTFORGE_ROWS.map(([cap, gm, ff]) => (
                <tr key={cap} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted">{cap}</td>
                  <td className="px-4 py-3 text-ink">{gm}</td>
                  <td className="px-4 py-3 text-muted">{ff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-xl font-semibold tracking-tight text-ink">
          Three steps
        </h2>
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

      <section className="panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">Ready to mill a font?</p>
          <p className="text-sm text-muted">
            Drop <span className="font-medium text-ink">A-KaminoDeco.png</span> and hit Generate. No
            API key required.
          </p>
        </div>
        <a href={routeHref('mill')} className="btn-primary shrink-0">
          Open Mill
        </a>
      </section>
    </main>
  )
}