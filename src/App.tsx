import { AgentSettings } from '@/components/AgentSettings'
import { DropZone } from '@/components/DropZone'
import { ExportPanel } from '@/components/ExportPanel'
import { Gate1Panel } from '@/components/Gate1Panel'
import { Gate2Panel } from '@/components/Gate2Panel'
import { GlyphGrid } from '@/components/GlyphGrid'
import { PartialFontWarning } from '@/components/PartialFontWarning'
import { PreviewPanel } from '@/components/PreviewPanel'
import { ProgressSteps } from '@/components/ProgressSteps'
import { RunView } from '@/components/RunView'
import { useProjectStore } from '@/store/projectStore'

function App() {
  const glyph = useProjectStore((s) => s.glyphs[0])
  const glyphs = useProjectStore((s) => s.glyphs)
  const meta = useProjectStore((s) => s.meta)
  const recipe = useProjectStore((s) => s.recipe)
  const output = useProjectStore((s) => s.output)
  const isGenerating = useProjectStore((s) => s.isGenerating)
  const isReplaying = useProjectStore((s) => s.isReplaying)
  const isAgentRunning = useProjectStore((s) => s.isAgentRunning)
  const agentUsage = useProjectStore((s) => s.agentUsage)
  const gateHandlers = useProjectStore((s) => s.gateHandlers)
  const generate = useProjectStore((s) => s.generate)
  const runAgent = useProjectStore((s) => s.runAgent)
  const replayRecipe = useProjectStore((s) => s.replayRecipe)
  const cancelAgent = useProjectStore((s) => s.cancelAgent)
  const copyRecipe = useProjectStore((s) => s.copyRecipe)
  const downloadExport = useProjectStore((s) => s.downloadExport)
  const clearProject = useProjectStore((s) => s.clearProject)

  const atGate = glyph?.status === 'gate1' || glyph?.status === 'gate2'
  const busy = isGenerating || isAgentRunning || isReplaying || atGate
  const canGenerate = glyphs.length > 0 && !busy
  const canRunAgent = glyphs.length > 0 && !busy
  const previewCharacter =
    glyph?.previewPng && recipe
      ? recipe.glyphs.map((g) => String.fromCodePoint(g.codepoint)).join('')
      : glyph
        ? String.fromCodePoint(glyph.codepoint)
        : 'A'

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-12">
      <header className="mb-10 space-y-2">
        <p className="text-sm font-medium tracking-wide text-ink/60 uppercase">
          Agentic font generator
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Font Generator</h1>
        <p className="max-w-xl text-base leading-relaxed text-ink/70">
          Drop letter PNGs, run the agent or replay a recipe, approve two gates, download
          TTF / WOFF2 / zip — all in the browser.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-6">
        <DropZone />

        <GlyphGrid />

        <AgentSettings />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => generate()}
            disabled={!canGenerate}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? 'Generating…' : 'Generate (no agent)'}
          </button>

          <button
            type="button"
            onClick={() => runAgent()}
            disabled={!canRunAgent}
            className="rounded-xl border border-ink/25 bg-white/70 px-5 py-2.5 text-sm font-medium text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAgentRunning && !atGate ? 'Agent running…' : 'Run agent'}
          </button>

          {(isAgentRunning || atGate) && (
            <button
              type="button"
              onClick={() => cancelAgent()}
              className="text-sm text-ink/55 underline-offset-2 hover:text-ink/75 hover:underline"
            >
              Cancel
            </button>
          )}

          {glyphs.length > 0 && !busy && (
            <button
              type="button"
              onClick={() => clearProject()}
              className="text-sm text-ink/50 underline-offset-2 hover:text-ink/70 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <PrivacyNote />

        {glyphs.length > 0 && (
          <PartialFontWarning
            codepoints={
              recipe?.glyphs.map((g) => g.codepoint) ?? glyphs.map((g) => g.codepoint)
            }
          />
        )}

        <ExportPanel
          family={meta.family}
          recipe={recipe}
          output={output}
          isReplaying={isReplaying}
          onCopyRecipe={() => copyRecipe()}
          onReplayRecipe={(json) => replayRecipe(json)}
          onDownload={(format) => downloadExport(format)}
        />

        {glyph?.status === 'gate1' && glyph.gate && gateHandlers && (
          <Gate1Panel
            gate={glyph.gate}
            sourcePreviewUrl={glyph.sourcePreviewUrl}
            handlers={gateHandlers}
          />
        )}

        {glyph?.status === 'gate2' && glyph.gate && gateHandlers && (
          <Gate2Panel
            gate={glyph.gate}
            handlers={gateHandlers}
            onAcceptExport={() => downloadExport('zip')}
          />
        )}

        {glyph && (isGenerating || isReplaying) && (
          <ProgressSteps currentStep={glyph.step} isActive={isGenerating || isReplaying} />
        )}

        {glyph?.status === 'exporting' && (
          <div
            role="status"
            className="rounded-xl border border-ink/10 bg-white/50 px-4 py-3 text-sm text-ink/70"
          >
            Exporting font…
          </div>
        )}

        {(glyph?.agentLog.length || (isAgentRunning && !atGate)) ? (
          <RunView
            steps={glyph?.agentLog ?? []}
            isRunning={isAgentRunning && !atGate}
            usageNote={agentUsage}
          />
        ) : null}

        {glyph?.error && (
          <div
            role="alert"
            className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-950"
          >
            <span className="font-medium">Something failed.</span> {glyph.error}
          </div>
        )}

        {glyph && glyph.status !== 'gate1' && glyph.status !== 'gate2' && (
          <PreviewPanel
            sourcePreviewUrl={glyph.sourcePreviewUrl}
            renderPreviewUrl={glyph.previewPng}
            validation={glyph.validation}
            character={previewCharacter}
          />
        )}

        {!glyph && <IdleHint />}
      </main>

      <footer className="mt-12 text-sm text-ink/50">
        v1 — conversion stays in your browser; agent QA previews go to the model via the
        proxy.
      </footer>
    </div>
  )
}

function PrivacyNote() {
  return (
    <aside className="rounded-xl border border-ink/8 bg-white/35 px-4 py-3 text-xs leading-relaxed text-ink/55">
      <p className="font-medium text-ink/70">Privacy</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5">
        <li>
          Source PNGs, SVG paths, and font bytes never leave your browser for conversion.
        </li>
        <li>
          Agent mode sends render previews and text through{' '}
          <code className="text-ink/60">/api/agent</code> to OpenRouter for vision QA — not your
          original artwork.
        </li>
        <li>
          The proxy stores nothing. BYO keys are forwarded per request only. Recipe replay uses
          zero model calls.
        </li>
      </ul>
    </aside>
  )
}

function IdleHint() {
  return (
    <div
      role="status"
      className="rounded-xl border border-ink/10 bg-white/40 px-4 py-3 text-sm text-ink/65"
    >
      Upload <span className="font-medium">A-KaminoDeco.png</span> (or multiple letters for a
      batch font). Try recipe replay with{' '}
      <span className="font-medium">tests/fixtures/kamino-deco-recipe.json</span>.
    </div>
  )
}

export default App