import { routeHref } from '@/lib/navigation'

const PIPELINE = [
  {
    step: '01',
    title: 'Preprocess',
    body: 'Your PNG becomes a bilevel bitmap — ink vs background. Threshold, optional morphological close, invert when needed.',
    detail: 'Cream backgrounds need luminance thresholding, not alpha.',
  },
  {
    step: '02',
    title: 'Trace',
    body: 'Potrace WASM follows the bitmap edges and outputs SVG path data — the same family of algorithm FontForge has used for decades.',
    detail: 'Vectors, not pixels. The geometry is computed, not imagined.',
  },
  {
    step: '03',
    title: 'Place',
    body: 'Paths land in font coordinate space: baseline, side bearings, units-per-em, correct codepoint.',
    detail: 'Winding rules fix hole direction so counters stay open.',
  },
  {
    step: '04',
    title: 'Build',
    body: 'opentype.js assembles a real TTF — glyf outlines, hmtx, head, name tables.',
    detail: 'Installable font files, not a preview mockup.',
  },
  {
    step: '05',
    title: 'Export',
    body: 'TTF master, WOFF2 for the web, zip bundle. Validate and render a sample glyph before download.',
    detail: 'Structural checks — round-trip parse, basic sanity.',
  },
] as const

const PATHS = [
  {
    name: 'Generate (no agent)',
    cost: 'Free',
    api: 'None',
    best: 'Glyphs similar to the reference style, batch fonts, quick proofs',
  },
  {
    name: 'Run agent',
    cost: 'OpenRouter usage',
    api: 'Hosted or BYO key',
    best: 'Unfamiliar art, messy scans, finicky counters and baselines',
  },
  {
    name: 'Replay recipe',
    cost: 'Free',
    api: 'None',
    best: 'Rebuilding a font you already dialed in — zero model calls',
  },
] as const

const FAQ = [
  {
    q: 'How can this work without AI?',
    a: 'Font tools have traced bitmaps into vectors since the 1990s. Glyphmill runs that same class of pipeline in your browser via WASM — Potrace for tracing, opentype.js for assembly. No model generates letter shapes. The math is deterministic: same PNG + same parameters → same font, every time.',
  },
  {
    q: 'What runs in my browser vs on a server?',
    a: 'Everything in the conversion path — preprocess, trace, place, build, export — runs locally. The only server piece is an optional /api/agent proxy for agent mode, which forwards render previews and chat to OpenRouter. Your source PNGs and final font bytes never upload for conversion.',
  },
  {
    q: 'If no-agent works, why have an agent?',
    a: 'Because the pipeline needs dozens of numeric parameters, and the right values change per image. No-agent uses a pinned recipe tuned on the reference glyph A-KaminoDeco.png. That is fast and free when your art is similar. The agent inspects your PNG, picks parameters, checks its own previews, and recovers when traces fill counters or sit wrong on the baseline — then you can copy the recipe and never pay for that glyph again.',
  },
  {
    q: 'What is a recipe?',
    a: 'A JSON snapshot of every parameter the pipeline used: threshold, trace settings, baseline fraction, bearings, codepoints. Copy it after a good build. Paste it later with the same PNGs (same order) and Replay recipe rebuilds the font with zero API calls. Think saved preset, not magic.',
  },
  {
    q: 'What are the human gates?',
    a: 'Agent-only checkpoints. Gate 1 shows the traced vector before building; Gate 2 shows the rendered glyph in the assembled font. You accept or nudge in plain English — "sharper corners", "counter filled", "raise on baseline". The agent maps nudges to parameter changes and reruns only the stages that need it.',
  },
  {
    q: 'When should I use which path?',
    a: 'Try Generate (no agent) first — especially with A-KaminoDeco.png. If the trace looks wrong or the render fails validation, switch to Run agent or tune via recipe replay after an agent run. Batch multiple letters with no-agent when they share a consistent style (same background, similar weight).',
  },
  {
    q: 'What file formats do I get?',
    a: 'TTF as the master outline font, WOFF2 compressed for web use, and a zip with both plus a stub WOFF (passthrough until a WASM WOFF1 encoder lands). All built client-side.',
  },
  {
    q: 'What are the honest limitations?',
    a: 'Agent mode is single-glyph today — batch via no-agent or replay. Potrace WASM uses library defaults; trace params are recorded in recipes but not all are tunable at runtime yet. WOFF export is a stub. First load pulls ~1.2 MB of WASM (wawoff2). These are engineering tradeoffs, not roadmap fiction.',
  },
] as const

export function HowItWorksView() {
  return (
    <main className="flex flex-1 flex-col gap-12 pb-4">
      <Hero />

      <section className="space-y-5">
        <SectionHeading
          kicker="The pipeline"
          title="Five deterministic stages"
          lead="Click Generate (no agent) and this entire chain runs locally. No LLM. No cloud conversion."
        />
        <ol className="grid gap-3">
          {PIPELINE.map((stage) => (
            <li key={stage.step} className="pipeline-step panel p-5">
              <div className="flex flex-wrap items-start gap-4">
                <span className="pipeline-step-num" aria-hidden>
                  {stage.step}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold text-ink">{stage.title}</h3>
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
          The actual hard part
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Parameters, not sorcery
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted">
          Threshold <code className="text-subtle">0.60</code> or{' '}
          <code className="text-subtle">0.45</code>? Baseline at{' '}
          <code className="text-subtle">0.754</code> or <code className="text-subtle">0.68</code>?
          Turdsize <code className="text-subtle">2</code> or <code className="text-subtle">8</code>?
          Small differences produce visibly different fonts — filled counters, floating letters,
          speckled edges. Glyphmill does not hallucinate better shapes. It applies well-known
          algorithms with specific numbers. No-agent pins the numbers that worked on the reference
          glyph. The agent searches for numbers that work on yours.
        </p>
      </section>

      <section className="space-y-5">
        <SectionHeading
          kicker="Three paths"
          title="Same engine, different operators"
          lead="Pick how parameters get chosen. The WASM pipeline is identical underneath."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {PATHS.map((path) => (
            <article key={path.name} className="panel flex flex-col gap-3 p-4">
              <h3 className="text-sm font-semibold text-ink">{path.name}</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2 border-b border-border pb-2">
                  <dt className="text-muted">Cost</dt>
                  <dd className="font-medium text-ink">{path.cost}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border pb-2">
                  <dt className="text-muted">API key</dt>
                  <dd className="font-medium text-ink">{path.api}</dd>
                </div>
              </dl>
              <p className="mt-auto text-xs leading-relaxed text-muted">
                <span className="font-medium text-subtle">Best for: </span>
                {path.best}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          kicker="Side by side"
          title="No agent vs agent"
          lead="The agent does not do anything the toolchain cannot. It operates the toolchain."
        />
        <div className="grid gap-3 md:grid-cols-2">
          <CompareCard
            title="Generate (no agent)"
            tone="neutral"
            points={[
              'Uses a pinned reference recipe from Phase 0 validation',
              'Same parameters for every glyph in the batch',
              'Instant, free, fully offline-capable',
              'Perfect when your art matches the preset',
              'Fails gracefully when it does not — try agent or tune recipe',
            ]}
          />
          <CompareCard
            title="Run agent"
            tone="accent"
            points={[
              'Reads your PNG and picks preprocess / trace / place params',
              'Inspects trace and render previews before advancing',
              'Two human gates with plain-English nudges',
              'Retries and recovers from filled counters, baseline drift',
              'Distills a copyable recipe — pay once per style, replay free',
            ]}
          />
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading kicker="FAQ" title="Straight answers" />
        <div className="space-y-2">
          {FAQ.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      <section className="panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">Ready to try it?</p>
          <p className="text-sm text-muted">
            Drop <span className="font-medium text-ink">A-KaminoDeco.png</span> and hit Generate.
            No API key required.
          </p>
        </div>
        <a href={routeHref('studio')} className="btn-primary shrink-0">
          Open studio
        </a>
      </section>
    </main>
  )
}

function Hero() {
  return (
    <header className="space-y-4 pt-2">
      <p className="text-xs font-semibold tracking-[0.28em] text-subtle uppercase">
        How Glyphmill works
      </p>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Fonts from images are not magic. They are math.
      </h1>
      <p className="max-w-prose text-base leading-relaxed text-muted">
        Glyphmill is a browser-native mill: PNG letter art goes in, traced vectors get placed on a
        baseline, real TTF / WOFF2 files come out. The optional Claude agent does not invent
        letterforms — it turns knobs, checks previews, and asks you to approve before export.
      </p>
    </header>
  )
}

function SectionHeading({
  kicker,
  title,
  lead,
}: {
  kicker: string
  title: string
  lead?: string
}) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">{kicker}</p>
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {lead && <p className="max-w-prose text-sm leading-relaxed text-muted">{lead}</p>}
    </header>
  )
}

function CompareCard({
  title,
  tone,
  points,
}: {
  title: string
  tone: 'neutral' | 'accent'
  points: string[]
}) {
  return (
    <article
      className={[
        'panel space-y-4 p-5',
        tone === 'accent' ? 'ring-1 ring-border-strong' : '',
      ].join(' ')}
    >
      <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">{title}</h3>
      <ul className="space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-muted">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
    </article>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="faq-item group panel">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-4">
          {question}
          <span
            className="text-subtle transition-transform group-open:rotate-45"
            aria-hidden
          >
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