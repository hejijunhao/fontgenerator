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
import { routeHref } from '@/lib/navigation'
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
    <main className="flex flex-1 flex-col gap-6">
      <DropZone />

      <GlyphGrid />

      <AgentSettings />

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
        <div role="status" className="panel px-4 py-3 text-sm text-muted">
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
          className="rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-950 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100"
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
  )
}

function PrivacyNote() {
  return (
    <aside className="panel px-4 py-3 text-xs leading-relaxed text-muted">
      <p className="font-medium text-subtle">Privacy</p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5">
        <li>
          Source PNGs, SVG paths, and font bytes never leave your browser for conversion.
        </li>
        <li>
          Agent mode sends render previews and text through{' '}
          <code className="text-subtle">/api/agent</code> to OpenRouter for vision QA — not your
          original artwork.
        </li>
        <li>
          The proxy stores nothing. BYO keys are forwarded per request only. Recipe replay uses
          zero model calls.
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
    <div role="status" className="panel px-4 py-3 text-sm text-muted">
      Upload <span className="font-medium text-ink">A-KaminoDeco.png</span> (or multiple letters
      for a batch font). New here?{' '}
      <a href={routeHref('how-it-works')} className="font-medium text-ink hover:underline">
        Read how it works
      </a>{' '}
      — no AI required for the demo glyph.
    </div>
  )
}