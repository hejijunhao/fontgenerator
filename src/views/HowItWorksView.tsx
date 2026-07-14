import { SectionHeading } from '@/components/layout/SectionHeading'
import {
  FAQ,
  FONTFORGE_ROWS,
  HOW_IT_WORKS_LAST_UPDATED,
  PIPELINE_STAGES,
  QUICK_ANSWER,
  TEST_COUNT_METHODOLOGY,
  THREE_PATH_ROWS,
} from '@/lib/howItWorksContent'
import { routeHref } from '@/lib/navigation'

export function HowItWorksView() {
  return (
    <main className="flex flex-1 flex-col gap-12 pb-4">
      <header className="space-y-4 border-b border-border pb-6 pt-2">
        <p className="font-mono text-xs text-subtle">
          Last updated: {HOW_IT_WORKS_LAST_UPDATED} · Browser PNG-to-font pipeline, optional agent,
          Generate deferred
        </p>
        <ol className="card-static max-w-prose list-decimal space-y-2 pl-5">
          {QUICK_ANSWER.map((line) => (
            <li key={line} className="text-sm leading-relaxed text-muted">
              {line}
            </li>
          ))}
        </ol>
        <div className="space-y-4">
          <p className="section-eyebrow">Browser font pipeline</p>
          <h1 className="hero-title max-w-2xl">
            How does Glyphmill turn PNG images into fonts?
          </h1>
          <p className="hero-desc max-w-prose">
            Glyphmill is a browser-native mill: PNG letter art goes in, traced vectors get placed on a
            baseline, real TTF and WOFF2 files come out. The optional Claude agent does not invent
            letterforms — it turns knobs, checks previews, and asks you to approve before export.
          </p>
        </div>
      </header>

      <section className="section space-y-5" aria-labelledby="chambers-heading">
        <SectionHeading
          kicker="Platform"
          title="Two chambers"
          lead="Glyphmill is a two-chamber type workshop. One chamber sketches; one converts."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="card-inert space-y-3">
            <p className="section-eyebrow mb-0">
              Generate · <span className="badge badge-default normal-case tracking-normal">Soon</span>
            </p>
            <h2 className="card-title">Sketch letterforms first</h2>
            <p className="card-desc">
              Agentic style exploration and glyph grids, then handoff to Export. Image generation is
              not available yet — see the{' '}
              <a href={routeHref('generate')} className="font-medium text-ink underline-offset-2 hover:underline">
                Generate placeholder
              </a>{' '}
              for the planned workflow.
            </p>
          </article>
          <article className="card space-y-3">
            <p className="section-eyebrow mb-0">Export · Live</p>
            <h2 className="card-title">Convert artwork to fonts</h2>
            <p className="card-desc">
              Upload PNG glyphs into the SOURCE bay, run preprocess → trace → place → build in the
              browser console, export TTF / WOFF2 from EXPORT.{' '}
              <a href={routeHref('export')} className="font-medium text-ink underline-offset-2 hover:underline">
                Try Export with A-KaminoDeco.png
              </a>
              .
            </p>
          </article>
        </div>
      </section>

      <section className="section space-y-5" aria-labelledby="pipeline-heading">
        <SectionHeading
          kicker="The pipeline"
          title="Five deterministic stages"
          lead="Click Generate (no agent) and this entire chain runs locally. No LLM. No cloud conversion."
        />
        <ol className="pipeline-grid">
          {PIPELINE_STAGES.map((stage) => (
            <li key={stage.step} className="card-static">
              <div className="flex flex-wrap items-start gap-4">
                <span className="font-mono text-xs font-medium tracking-wider text-subtle" aria-hidden>
                  {stage.step}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h2 className="card-title">{stage.question}</h2>
                  <p className="card-desc">{stage.body}</p>
                  <p className="font-mono text-xs text-subtle">{stage.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="card-highlight space-y-3">
          <p className="section-eyebrow mb-0">Parameters, not sorcery</p>
          <h2 className="section-title mb-0">Small numbers, visible differences</h2>
          <p className="card-desc max-w-prose">
            Threshold <code className="font-mono text-subtle">0.60</code> or{' '}
            <code className="font-mono text-subtle">0.45</code>? Baseline at{' '}
            <code className="font-mono text-subtle">0.754385</code> or{' '}
            <code className="font-mono text-subtle">0.68</code>? Turdsize{' '}
            <code className="font-mono text-subtle">2</code> or <code className="font-mono text-subtle">8</code>?
            Small differences produce visibly different fonts — filled counters, floating letters,
            speckled edges. No-agent pins the numbers that worked on the reference glyph. The agent
            searches for numbers that work on yours.
          </p>
        </div>
      </section>

      <section className="section space-y-5" aria-labelledby="paths-heading">
        <SectionHeading
          kicker="Three paths"
          title="Same engine, different operators"
          lead="Pick how parameters get chosen. The WASM pipeline is identical underneath."
        />
        <div className="grid-2-plus-1">
          {THREE_PATH_ROWS.map(([path, cost, api, speed]) => (
            <article key={path} className="card-static space-y-3">
              <h3 className="card-title">{path}</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-subtle">Cost</dt>
                  <dd className="text-ink">{cost}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-subtle">API key</dt>
                  <dd className="text-ink">{api}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-subtle">Speed</dt>
                  <dd className="text-ink">{speed}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="section space-y-5" aria-labelledby="fontforge-heading">
        <SectionHeading
          id="fontforge-heading"
          kicker="Alternatives"
          title="Glyphmill vs manual FontForge workflow"
          lead="For teams comparing browser tooling to desktop outline editing."
        />
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Capability</th>
                <th scope="col">Glyphmill</th>
                <th scope="col">FontForge manual</th>
              </tr>
            </thead>
            <tbody>
              {FONTFORGE_ROWS.map(([cap, gm, ff]) => (
                <tr key={cap}>
                  <td>{cap}</td>
                  <td className="!text-ink">{gm}</td>
                  <td>{ff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section space-y-5" aria-labelledby="methodology-heading">
        <SectionHeading
          kicker="Methodology"
          title="How A-KaminoDeco.png validates the pipeline"
          lead="Phase 0 CLI reference pins parameters the no-agent recipe still uses."
        />
        <div className="card-static space-y-4 text-sm leading-relaxed text-muted">
          <p>
            The reference glyph <span className="font-medium text-ink">A-KaminoDeco.png</span> is a
            decorative capital A on a cream background with an open counter. Phase 0 validation locked
            preprocess threshold <code className="font-mono text-subtle">0.60</code>, baseline fraction{' '}
            <code className="font-mono text-subtle">0.754385</code>, Potrace turdsize{' '}
            <code className="font-mono text-subtle">2</code>, alphamax{' '}
            <code className="font-mono text-subtle">1.0</code>, and opttolerance{' '}
            <code className="font-mono text-subtle">0.2</code>. The resulting KaminoDeco family passes
            round-trip parse and renders with an open counter on the baseline.
          </p>
          <p>
            {TEST_COUNT_METHODOLOGY} Drop the same PNG in the{' '}
            <a href={routeHref('export')} className="font-medium text-ink underline-offset-2 hover:underline">
              Export console
            </a>{' '}
            to reproduce the reference build without an API key.
          </p>
        </div>
      </section>

      <section className="section space-y-5" aria-labelledby="faq-heading">
        <SectionHeading kicker="FAQ" title="Straight answers" id="faq-heading" />
        <div className="space-y-2">
          {FAQ.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card-highlight flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="card-title">Ready to try the browser font pipeline?</p>
            <p className="card-desc">
              Drop <span className="font-medium text-ink">A-KaminoDeco.png</span> in the Export SOURCE bay
              and hit Generate. No API key required.
            </p>
          </div>
          <a href={routeHref('export')} className="btn btn-primary shrink-0">
            Open Export
          </a>
        </div>
      </section>
    </main>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="details-card group">
      <summary>
        <span className="flex items-center justify-between gap-4">
          {question}
          <span className="text-subtle transition-transform group-open:rotate-45" aria-hidden>
            +
          </span>
        </span>
      </summary>
      <div className="details-card__body">{answer}</div>
    </details>
  )
}