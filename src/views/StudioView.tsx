import { useCallback, useState } from 'react'
import { AgentSettings } from '@/components/AgentSettings'
import { PipelineGraph } from '@/components/console/PipelineGraph'
import { StageBay } from '@/components/console/StageBay'
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
import { deriveMillStage, type MillStage } from '@/lib/millStage'
import {
  buildBaySummary,
  exportBaySummary,
  reviewBaySummary,
  sourceBaySummary,
} from '@/lib/millBaySummaries'
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
  const [manualExpand, setManualExpand] = useState<MillStage | null>(null)
  const [manualExpandAt, setManualExpandAt] = useState<MillStage | null>(null)

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

  const summaryInput = {
    glyphsLength: glyphs.length,
    glyphStatus: glyph?.status,
    isGenerating,
    isAgentRunning,
    isReplaying,
    hasOutput: Boolean(output),
    hasPreview: Boolean(glyph?.previewPng),
    family: meta.family,
    atGate,
  }

  const bayExpanded = (stage: MillStage) =>
    activeStage === stage || (manualExpand === stage && manualExpandAt === activeStage)

  const pinBay = (stage: MillStage) => {
    setManualExpand(stage)
    setManualExpandAt(activeStage)
  }

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
    <main className="mill-view">
      {!wasmReady && <WasmWarmupBanner />}

      <div className="mill-toolbar">
        <MillStepIndicator activeStage={activeStage} />
        {statusPill}
      </div>

      <StageBay
        kicker="SOURCE"
        stage="source"
        activeStage={activeStage}
        expanded={bayExpanded('source')}
        onExpand={() => pinBay('source')}
        collapsedSummary={sourceBaySummary(summaryInput)}
      >
        <DropZone />
        <GlyphGrid />
        {!glyph && <IdleHint />}
      </StageBay>

      <StageBay
        kicker="BUILD"
        stage="build"
        activeStage={activeStage}
        expanded={bayExpanded('build')}
        onExpand={() => pinBay('build')}
        collapsedSummary={buildBaySummary(summaryInput)}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => generate()}
            disabled={!canGenerate}
            className="btn btn-primary"
          >
            {isGenerating ? 'Generating…' : 'Generate (no agent)'}
          </button>

          <button
            type="button"
            onClick={() => runAgent()}
            disabled={!canRunAgent}
            className="btn btn-secondary"
          >
            {isAgentRunning && !atGate ? 'Agent running…' : 'Run agent'}
          </button>

          {(isAgentRunning || atGate) && (
            <button type="button" onClick={() => cancelAgent()} className="btn btn-ghost">
              Cancel
            </button>
          )}

          {glyphs.length > 0 && !busy && (
            <button type="button" onClick={() => clearProject()} className="btn btn-ghost">
              Clear
            </button>
          )}
        </div>

        <details className="mill-disclosure stage-bay-nested">
          <summary>Agent settings</summary>
          <AgentSettings embedded />
        </details>

        {glyph && (isGenerating || isReplaying) && (
          <PipelineGraph currentStep={glyph.step} isActive={isGenerating || isReplaying} />
        )}

        {glyph?.status === 'exporting' && (
          <div role="status" className="mono-data text-muted">
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
          <div role="alert" className="alert-error stage-bay-nested">
            <span className="mono-data font-medium">Pipeline failed.</span> {glyph.error}
          </div>
        )}
      </StageBay>

      <StageBay
        kicker="REVIEW"
        stage="review"
        activeStage={activeStage}
        expanded={bayExpanded('review')}
        onExpand={() => pinBay('review')}
        collapsedSummary={reviewBaySummary(summaryInput)}
      >
        {glyphs.length > 0 && (
          <PartialFontWarning
            codepoints={recipe?.glyphs.map((g) => g.codepoint) ?? glyphs.map((g) => g.codepoint)}
          />
        )}

        <div className={atGate ? 'gate-slot' : undefined}>
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
        </div>

        {glyph && !atGate && (
          <PreviewPanel
            sourcePreviewUrl={glyph.sourcePreviewUrl}
            renderPreviewUrl={glyph.previewPng}
            validation={glyph.validation}
            character={previewCharacter}
          />
        )}

        {glyphs.length > 0 && !glyph?.previewPng && !atGate && (
          <p className="mono-data text-muted">Run Generate to populate preview.</p>
        )}
      </StageBay>

      <StageBay
        kicker="EXPORT"
        stage="export"
        activeStage={activeStage}
        expanded={bayExpanded('export')}
        onExpand={() => pinBay('export')}
        collapsedSummary={exportBaySummary(summaryInput)}
      >
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
      </StageBay>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </main>
  )
}

function WasmWarmupBanner() {
  return (
    <div
      role="status"
      className="card-static flex items-center gap-4"
      aria-label="Warming up WASM modules"
    >
      <div className="dropzone-mark">A</div>
      <div className="space-y-0.5">
        <p className="mono-data font-medium tracking-wide text-muted uppercase">
          warming up the mill…
        </p>
        <p className="text-xs text-subtle">First load fetches ~1.2 MB of WASM (potrace, wawoff2)</p>
      </div>
    </div>
  )
}

function IdleHint() {
  return (
    <p className="mono-data text-muted">
      Try <span className="text-ink">A-KaminoDeco.png</span> — or{' '}
      <a href={routeHref('how-it-works')} className="font-medium text-ink hover:underline">
        read how it works
      </a>
      .
    </p>
  )
}