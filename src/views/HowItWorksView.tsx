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
          Foundry deferred
        </p>
        <ol className="panel max-w-prose list-decimal space-y-2 px-5 py-4 pl-8 text-sm leading-relaxed text-muted">
          {QUICK_ANSWER.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.28em] text-subtle uppercase">
            Browser font pipeline
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            How does Glyphmill turn PNG images into fonts?
          </h1>
          <p className="max-w-prose text-base leading-relaxed text-muted">
            Glyphmill is a browser-native mill: PNG letter art goes in, traced vectors get placed on a
            baseline, real TTF and WOFF2 files come out. The optional Claude agent does not invent
            letterforms — it turns knobs, checks previews, and asks you to approve before export.
          </p>
        </div>
      </header>

      <section className="space-y-5" aria-labelledby="chambers-heading">
        <SectionHeading
          kicker="Platform"
          title="Two chambers"
          lead="Glyphmill is a two-chamber type workshop. One chamber sketches; one converts."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="inert-frame space-y-3 p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">
              Foundry · <span className="badge-inert normal-case tracking-normal">Soon</span>
            </p>
            <h2 className="text-base font-semibold text-ink">Sketch letterforms first</h2>
            <p className="text-sm leading-relaxed text-muted">
              Agentic style exploration and glyph grids, then handoff to the Mill. Image generation is
              not available yet — see the{' '}
              <a href={routeHref('foundry')} className="font-medium text-ink underline-offset-2 hover:underline">
                Foundry placeholder
              </a>{' '}
              for the planned workflow.
            </p>
          </article>
          <article className="panel space-y-3 p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">Mill · Live</p>
            <h2 className="text-base font-semibold text-ink">Convert artwork to fonts</h2>
            <p className="text-sm leading-relaxed text-muted">
              Upload PNG glyphs into the SOURCE bay, run preprocess → trace → place → build in the
              browser console, export TTF / WOFF2 from EXPORT.{' '}
              <a href={routeHref('mill')} className="font-medium text-ink underline-offset-2 hover:underline">
                Try the Mill with A-KaminoDeco.png
              </a>
              .
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="pipeline-heading">
        <SectionHeading
          kicker="The pipeline"
          title="Five deterministic stages"
          lead="Click Generate (no agent) and this entire chain runs locally. No LLM. No cloud conversion."
        />
        <ol className="grid gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <li key={stage.step} className="pipeline-step panel p-5">
              <div className="flex flex-wrap items-start gap-4">
                <span className="pipeline-step-num" aria-hidden>
                  {stage.step}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h2 className="text-base font-semibold text-ink">{stage.question}</h2>
                  <p className="text-sm leading-relaxed text-muted">{stage.body}</p>
                  <p className="font-mono text-xs text-subtle">{stage.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="callout panel space-y-3 p-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">
          Parameters, not sorcery
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Small numbers, visible differences
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted">
          Threshold <code className="text-subtle">0.60</code> or{' '}
          <code className="text-subtle">0.45</code>? Baseline at{' '}
          <code className="text-subtle">0.754385</code> or <code className="text-subtle">0.68</code>?
          Turdsize <code className="text-subtle">2</code> or <code className="text-subtle">8</code>?
          Small differences produce visibly different fonts — filled counters, floating letters,
          speckled edges. No-agent pins the numbers that worked on the reference glyph. The agent
          searches for numbers that work on yours.
        </p>
      </section>

      <section className="space-y-5" aria-labelledby="paths-heading">
        <SectionHeading
          kicker="Three paths"
          title="Same engine, different operators"
          lead="Pick how parameters get chosen. The WASM pipeline is identical underneath."
        />
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  Path
                </th>
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  Cost
                </th>
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  API key
                </th>
                <th className="px-4 py-3 font-semibold text-ink" scope="col">
                  Speed
                </th>
              </tr>
            </thead>
            <tbody>
              {THREE_PATH_ROWS.map(([path, cost, api, speed]) => (
                <tr key={path} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{path}</td>
                  <td className="px-4 py-3 text-muted">{cost}</td>
                  <td className="px-4 py-3 text-muted">{api}</td>
                  <td className="px-4 py-3 text-muted">{speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="fontforge-heading">
        <SectionHeading
          id="fontforge-heading"
          kicker="Alternatives"
          title="Glyphmill vs manual FontForge workflow"
          lead="For teams comparing browser tooling to desktop outline editing."
        />
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

      <section className="space-y-5" aria-labelledby="methodology-heading">
        <SectionHeading
          kicker="Methodology"
          title="How A-KaminoDeco.png validates the pipeline"
          lead="Phase 0 CLI reference pins parameters the no-agent recipe still uses."
        />
        <div className="panel space-y-4 p-6 text-sm leading-relaxed text-muted">
          <p>
            The reference glyph <span className="font-medium text-ink">A-KaminoDeco.png</span> is a
            decorative capital A on a cream background with an open counter. Phase 0 validation locked
            preprocess threshold <code className="text-subtle">0.60</code>, baseline fraction{' '}
            <code className="text-subtle">0.754385</code>, Potrace turdsize{' '}
            <code className="text-subtle">2</code>, alphamax <code className="text-subtle">1.0</code>,
            and opttolerance <code className="text-subtle">0.2</code>. The resulting KaminoDeco family
            passes round-trip parse and renders with an open counter on the baseline.
          </p>
          <p>
            {TEST_COUNT_METHODOLOGY} Drop the same PNG in the{' '}
            <a href={routeHref('mill')} className="font-medium text-ink underline-offset-2 hover:underline">
              Mill
            </a>{' '}
            to reproduce the reference build without an API key.
          </p>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="faq-heading">
        <SectionHeading kicker="FAQ" title="Straight answers" id="faq-heading" />
        <div className="space-y-2">
          {FAQ.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      <section className="panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">Ready to try the browser font pipeline?</p>
          <p className="text-sm text-muted">
            Drop <span className="font-medium text-ink">A-KaminoDeco.png</span> in the Mill SOURCE bay
            and hit Generate. No API key required.
          </p>
        </div>
        <a href={routeHref('mill')} className="btn-primary shrink-0">
          Open Mill
        </a>
      </section>
    </main>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="faq-item group panel">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-4">
          {question}
          <span className="text-subtle transition-transform group-open:rotate-45" aria-hidden>
            +
          </span>
        </span>
      </summary>
      <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
        {answer}
      </div>
    </details>
  )
}