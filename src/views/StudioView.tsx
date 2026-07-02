import { useCallback, useState } from 'react'
import { AgentSettings } from '@/components/AgentSettings'
import { Bay } from '@/components/console/Bay'
import { PipelineGraph } from '@/components/console/PipelineGraph'
import { StatusPill } from '@/components/console/StatusPill'
import { Toast } from '@/components/console/Toast'
import { DropZone } from '@/components/DropZone'
import { ExportPanel } from '@/components/ExportPanel'
import { Gate1Panel } from '@/components/Gate1Panel'
import { Gate2Panel } from '@/components/Gate2Panel'
import { GlyphGrid } from '@/components/GlyphGrid'
import { PartialFontWarning } from '@/components/PartialFontWarning'
import { PreviewPanel } from '@/components/PreviewPanel'
import { RunView } from '@/components/RunView'
import { MillStepIndicator } from '@/components/layout/MillStepIndicator'
import { deriveMillStage } from '@/lib/millStage'
import { routeHref } from '@/lib/navigation'
import { useWasmWarmup } from '@/lib/wasmReady'
import { useProjectStore } from '@/store/projectStore'

export function StudioView() {
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

  const { ready: wasmReady } = useWasmWarmup()
  const [toast, setToast] = useState<string | null>(null)

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

  const activeStage = deriveMillStage({
    glyphsLength: glyphs.length,
    glyphStatus: glyph?.status,
    isGenerating,
    isAgentRunning,
    isReplaying,
    hasOutput: Boolean(output),
    hasPreview: Boolean(glyph?.previewPng),
  })

  const handleCopyRecipe = useCallback(async () => {
    await copyRecipe()
    setToast('Recipe copied to clipboard')
  }, [copyRecipe])

  const handleDownload = useCallback(
    async (format: 'ttf' | 'woff' | 'woff2' | 'zip') => {
      await downloadExport(format)
      const ext = format === 'zip' ? 'zip' : format
      setToast(`Download started — .${ext}`)
    },
    [downloadExport],
  )

  const statusPill = glyph?.error ? (
    <StatusPill label="Pipeline error" tone="error" />
  ) : atGate ? (
    <StatusPill label="Gate — awaiting review" tone="gate" />
  ) : isAgentRunning && !atGate ? (
    <StatusPill label="Agent running" tone="run" live />
  ) : isGenerating || isReplaying ? (
    <StatusPill label="Pipeline running" tone="run" live />
  ) : null

  return (
    <main className="console-mill flex flex-1 flex-col gap-6">
      {!wasmReady && <WasmWarmupBanner />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <MillStepIndicator activeStage={activeStage} />
        {statusPill}
      </div>

      <Bay kicker="SOURCE" signal={activeStage === 'source'}>
        <DropZone />
        <GlyphGrid />
        {!glyph && <IdleHint />}
      </Bay>

      <Bay kicker="BUILD" signal={activeStage === 'build'}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => generate()}
            disabled={!canGenerate}
            className="btn-primary"
          >
            {isGenerating ? 'Generating…' : 'Generate (no agent)'}
          </button>

          <button
            type="button"
            onClick={() => runAgent()}
            disabled={!canRunAgent}
            className="btn-secondary"
          >
            {isAgentRunning && !atGate ? 'Agent running…' : 'Run agent'}
          </button>

          {(isAgentRunning || atGate) && (
            <button type="button" onClick={() => cancelAgent()} className="btn-ghost">
              Cancel
            </button>
          )}

          {glyphs.length > 0 && !busy && (
            <button type="button" onClick={() => clearProject()} className="btn-ghost">
              Clear
            </button>
          )}
        </div>

        <details className="console-disclosure console-bay-nested p-3">
          <summary>Agent settings</summary>
          <AgentSettings embedded />
        </details>

        {glyph && (isGenerating || isReplaying) && (
          <PipelineGraph
            currentStep={glyph.step}
            isActive={isGenerating || isReplaying}
          />
        )}

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
            onAcceptExport={() => handleDownload('zip')}
          />
        )}

        {glyph?.status === 'exporting' && (
          <div role="status" className="console-mono-data text-xs text-muted">
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
            className="console-bay-nested border-l-2 p-3 text-sm"
            style={{ borderColor: 'var(--state-fail)', color: 'var(--state-fail)' }}
          >
            <span className="console-mono-data font-medium">Pipeline failed.</span>{' '}
            {glyph.error}
          </div>
        )}

        <PrivacyNote />
      </Bay>

      <Bay kicker="REVIEW" signal={activeStage === 'review'}>
        {glyphs.length > 0 && (
          <PartialFontWarning
            codepoints={
              recipe?.glyphs.map((g) => g.codepoint) ?? glyphs.map((g) => g.codepoint)
            }
          />
        )}

        {glyph && glyph.status !== 'gate1' && glyph.status !== 'gate2' && (
          <PreviewPanel
            sourcePreviewUrl={glyph.sourcePreviewUrl}
            renderPreviewUrl={glyph.previewPng}
            validation={glyph.validation}
            character={previewCharacter}
          />
        )}
      </Bay>

      <Bay kicker="EXPORT" signal={activeStage === 'export'}>
        <ExportPanel
          family={meta.family}
          recipe={recipe}
          output={output}
          isReplaying={isReplaying}
          onCopyRecipe={handleCopyRecipe}
          onReplayRecipe={(json) => replayRecipe(json)}
          onDownload={handleDownload}
          embedded
        />
      </Bay>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </main>
  )
}

function WasmWarmupBanner() {
  return (
    <div
      role="status"
      className="console-bay flex items-center gap-4 p-4"
      aria-label="Warming up WASM modules"
    >
      <ConsoleEmblem />
      <div className="space-y-0.5">
        <p className="console-mono-data text-xs tracking-wide text-muted uppercase">
          warming up the mill…
        </p>
        <p className="text-xs text-subtle">First load fetches ~1.2 MB of WASM (potrace, wawoff2)</p>
      </div>
    </div>
  )
}

function ConsoleEmblem() {
  return (
    <div className="console-emblem" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink">
        <path
          d="M7 1.5 3 12.5h2l.8-2.2h4.4L11 12.5h2L9 1.5H7zm-.8 5.2 1.6-4.4 1.6 4.4H6.2z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

function PrivacyNote() {
  return (
    <aside className="text-xs leading-relaxed text-muted">
      <p className="console-readout">Privacy</p>
      <ul className="mt-2 list-inside list-disc space-y-0.5">
        <li>
          Source PNGs, SVG paths, and font bytes never leave your browser for conversion.
        </li>
        <li>
          Agent mode sends render previews and text through{' '}
          <code className="console-mono-data text-subtle">/api/agent</code> to OpenRouter for vision
          QA — not your original artwork.
        </li>
        <li>
          The proxy stores nothing. BYO keys are forwarded per request only. Recipe replay uses zero
          model calls.
        </li>
      </ul>
      <p className="mt-2">
        <a href={routeHref('how-it-works')} className="font-medium text-subtle hover:text-ink">
          How it works →
        </a>
      </p>
    </aside>
  )
}

function IdleHint() {
  return (
    <div role="status" className="flex items-center gap-4 py-2">
      <ConsoleEmblem />
      <div className="space-y-1 text-sm">
        <p className="console-mono-data text-xs tracking-wide text-muted uppercase">
          awaiting source png
        </p>
        <p className="text-muted">
          Upload <span className="font-medium text-ink">A-KaminoDeco.png</span> (or multiple letters
          for a batch font). New here?{' '}
          <a href={routeHref('how-it-works')} className="font-medium text-ink hover:underline">
            Read how it works
          </a>{' '}
          — no AI required for the demo glyph.
        </p>
      </div>
    </div>
  )
}