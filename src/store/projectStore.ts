import { create } from 'zustand'
import { GateController, type GateHandlers } from '@/agent/gateController'
import {
  buildExportBundle,
  buildFontZip,
  downloadBlob,
  downloadBytes,
  ensureWoff2,
} from '@/lib/fontExport'
import { formatPipelineError } from '@/lib/pipelineError'
import {
  distillProjectRecipe,
  glyphRecipeFromPipeline,
  parseRecipeJson,
  serializeRecipe,
} from '@/lib/recipe'
import { renderSample, runProjectPipeline, validate } from '@/pipeline'
import type { PipelineProgressStep } from '@/pipeline/runPipeline'
import { REFERENCE_RECIPE } from '@/recipes/referenceRecipe'
import type { AgentStep, AgentUsageNote, GateSnapshot } from '@/types/agent'
import type { FontExportBundle, FontMeta, Recipe, ValidationResult } from '@/types/pipeline'

export type AgentModelChoice = 'opus' | 'sonnet'

export type GlyphStatus =
  | 'pending'
  | 'running'
  | 'agent-running'
  | 'gate1'
  | 'gate2'
  | 'exporting'
  | 'done'
  | 'error'

export type PipelineUiStep =
  | 'idle'
  | PipelineProgressStep
  | 'validate'
  | 'render'
  | 'done'

export type GlyphJob = {
  id: string
  sourcePng: Blob
  sourcePreviewUrl: string
  codepoint: number
  status: GlyphStatus
  step: PipelineUiStep
  error?: string
  fontBytes?: Uint8Array
  validation?: ValidationResult
  previewPng?: string
  agentLog: AgentStep[]
  gate?: GateSnapshot
}

export type Project = {
  glyphs: GlyphJob[]
  meta: FontMeta
  recipe?: Recipe
  output?: FontExportBundle
}

type ProjectStore = Project & {
  isGenerating: boolean
  isAgentRunning: boolean
  isReplaying: boolean
  agentModel: AgentModelChoice
  byoApiKey: string
  agentUsage?: AgentUsageNote
  agentAbort?: AbortController
  gateHandlers?: GateHandlers
  setSourcePngs: (files: File[]) => void
  removeGlyph: (id: string) => void
  setAgentModel: (model: AgentModelChoice) => void
  setByoApiKey: (key: string) => void
  clearProject: () => void
  generate: () => Promise<void>
  runAgent: () => Promise<void>
  replayRecipe: (json: string) => Promise<void>
  cancelAgent: () => void
  copyRecipe: () => Promise<void>
  downloadExport: (format: 'ttf' | 'woff' | 'woff2' | 'zip') => Promise<void>
}

const INITIAL_META = REFERENCE_RECIPE.meta

function revokePreviewUrl(url: string | undefined) {
  if (url) URL.revokeObjectURL(url)
}

function createGlyphJob(file: File, index: number): GlyphJob {
  return {
    id: crypto.randomUUID(),
    sourcePng: file,
    sourcePreviewUrl: URL.createObjectURL(file),
    codepoint: 0x41 + index,
    status: 'pending',
    step: 'idle',
    agentLog: [],
  }
}

function defaultBatchRecipe(glyphCount: number, meta: FontMeta): Recipe {
  const template = glyphRecipeFromPipeline(REFERENCE_RECIPE)
  return {
    version: 1,
    meta: { ...meta },
    notdefWidth: REFERENCE_RECIPE.notdefWidth,
    spaceWidth: REFERENCE_RECIPE.spaceWidth,
    glyphs: Array.from({ length: glyphCount }, (_, i) => ({
      ...template,
      preprocess: { ...template.preprocess },
      trace: { ...template.trace },
      place: { ...template.place },
      metrics: { ...template.metrics },
      codepoint: 0x41 + i,
    })),
  }
}

async function attachFontArtifacts(
  set: (partial: Partial<ProjectStore>) => void,
  fontBytes: Uint8Array,
  recipe: Recipe,
  previewText: string,
) {
  const validation = validate(fontBytes)
  const previewPng = await renderSample(fontBytes, previewText)
  const output = await buildExportBundle(fontBytes)
  set({ recipe, output, meta: recipe.meta })
  return { validation, previewPng, output }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  glyphs: [],
  meta: INITIAL_META,
  recipe: undefined,
  output: undefined,
  isGenerating: false,
  isAgentRunning: false,
  isReplaying: false,
  agentModel: 'opus',
  byoApiKey: '',
  agentUsage: undefined,
  agentAbort: undefined,
  gateHandlers: undefined,

  removeGlyph: (id) => {
    const { glyphs, isGenerating, isAgentRunning, isReplaying } = get()
    if (isGenerating || isAgentRunning || isReplaying || glyphs.length <= 1) return

    const target = glyphs.find((g) => g.id === id)
    if (!target) return
    revokePreviewUrl(target.sourcePreviewUrl)

    const next = glyphs
      .filter((g) => g.id !== id)
      .map((g, i) => ({ ...g, codepoint: 0x41 + i }))

    set({
      glyphs: next,
      recipe: undefined,
      output: undefined,
    })
  },

  setAgentModel: (model) => set({ agentModel: model }),

  setByoApiKey: (key) => set({ byoApiKey: key }),

  setSourcePngs: (files) => {
    get().agentAbort?.abort()
    const { glyphs } = get()
    for (const glyph of glyphs) revokePreviewUrl(glyph.sourcePreviewUrl)

    set({
      glyphs: files.map((f, i) => createGlyphJob(f, i)),
      meta: INITIAL_META,
      recipe: undefined,
      output: undefined,
      isGenerating: false,
      isAgentRunning: false,
      isReplaying: false,
      agentUsage: undefined,
      agentAbort: undefined,
      gateHandlers: undefined,
    })
  },

  clearProject: () => {
    get().agentAbort?.abort()
    const { glyphs } = get()
    for (const glyph of glyphs) revokePreviewUrl(glyph.sourcePreviewUrl)
    set({
      glyphs: [],
      meta: INITIAL_META,
      recipe: undefined,
      output: undefined,
      isGenerating: false,
      isAgentRunning: false,
      isReplaying: false,
      agentUsage: undefined,
      agentAbort: undefined,
      gateHandlers: undefined,
    })
  },

  generate: async () => {
    const { glyphs, isGenerating, isAgentRunning, isReplaying } = get()
    if (!glyphs.length || isGenerating || isAgentRunning || isReplaying) return

    const updateAll = (patch: Partial<GlyphJob>) => {
      set((state) => ({
        glyphs: state.glyphs.map((g) => ({ ...g, ...patch })),
      }))
    }

    updateAll({
      status: 'running',
      step: 'preprocess',
      error: undefined,
      fontBytes: undefined,
      validation: undefined,
      previewPng: undefined,
      agentLog: [],
      gate: undefined,
    })
    set({ isGenerating: true, agentUsage: undefined, gateHandlers: undefined, recipe: undefined, output: undefined })

    try {
      const recipe = defaultBatchRecipe(glyphs.length, get().meta)
      const sources = glyphs.map((g) => g.sourcePng)

      const result = await runProjectPipeline(sources, recipe, (_i, step) => {
        updateAll({ step: step === 'build' ? 'validate' : step })
      })

      updateAll({ step: 'render' })
      const previewText = recipe.glyphs.map((g) => String.fromCodePoint(g.codepoint)).join('')
      const { validation, previewPng } = await attachFontArtifacts(
        set,
        result.fontBytes,
        recipe,
        previewText || 'A',
      )

      updateAll({
        status: 'done',
        step: 'done',
        fontBytes: result.fontBytes,
        validation,
        previewPng,
        codepoint: recipe.glyphs[0]?.codepoint ?? 0x41,
      })
    } catch (err) {
      updateAll({
        status: 'error',
        step: 'idle',
        error: formatPipelineError(err),
      })
    } finally {
      set({ isGenerating: false })
    }
  },

  runAgent: async () => {
    const { glyphs, isGenerating, isAgentRunning, isReplaying } = get()
    const glyph = glyphs[0]
    if (!glyph || isGenerating || isAgentRunning || isReplaying) return

    const abort = new AbortController()
    const gateController = new GateController()

    const updateGlyph = (patch: Partial<GlyphJob>) => {
      set((state) => ({
        glyphs: state.glyphs.map((g) => (g.id === glyph.id ? { ...g, ...patch } : g)),
      }))
    }

    gateController.onGateOpen = (request) => {
      const status = request.stage === 'trace' ? 'gate1' : 'gate2'
      updateGlyph({
        status,
        gate: {
          stage: request.stage,
          summary: request.summary,
          tracePreviewPng: request.tracePreviewPng,
          renderPreviewPng: request.renderPreviewPng,
          proposedCharacter: request.proposedCharacter,
          validation: request.validation,
        },
      })
      set({ gateHandlers: gateController.toHandlers() })
    }

    gateController.onGateClose = () => {
      updateGlyph({ status: 'agent-running', gate: undefined })
      set({ gateHandlers: undefined })
    }

    updateGlyph({
      status: 'agent-running',
      step: 'idle',
      error: undefined,
      fontBytes: undefined,
      validation: undefined,
      previewPng: undefined,
      agentLog: [],
      gate: undefined,
    })
    set({
      isAgentRunning: true,
      agentUsage: undefined,
      agentAbort: abort,
      gateHandlers: undefined,
      recipe: undefined,
      output: undefined,
    })

    try {
      const { runGlyphAgent } = await import('@/agent/runAgent')
      const { agentModel, byoApiKey } = get()
      const result = await runGlyphAgent({
        sourcePng: glyph.sourcePng,
        sourcePreviewUrl: glyph.sourcePreviewUrl,
        gateController,
        modelChoice: agentModel,
        byoApiKey: byoApiKey || undefined,
        signal: abort.signal,
        onGateResume: () => updateGlyph({ status: 'agent-running' }),
        onExporting: () => updateGlyph({ status: 'exporting' }),
        onStep: (step) => {
          updateGlyph({
            agentLog: [...(get().glyphs[0]?.agentLog ?? []), step],
          })
        },
        onUsage: (note) => set({ agentUsage: note }),
      })

      const recipe = distillProjectRecipe(
        [{ agentLog: get().glyphs[0]?.agentLog ?? [], codepoint: result.codepoint }],
        result.meta,
      )

      const previewChar = String.fromCodePoint(result.codepoint)
      const { validation, previewPng } = await attachFontArtifacts(
        set,
        result.fontBytes,
        recipe,
        previewChar,
      )

      updateGlyph({
        status: 'done',
        step: 'done',
        codepoint: result.codepoint,
        fontBytes: result.fontBytes,
        validation,
        previewPng,
        gate: undefined,
      })

      if (!result.validation.roundTripOk) {
        updateGlyph({
          error: 'Agent built a font but structural validation failed. Try re-running.',
        })
      }
    } catch (err) {
      if (abort.signal.aborted) return
      gateController.cancel()
      updateGlyph({
        status: 'error',
        step: 'idle',
        gate: undefined,
        error: formatPipelineError(err),
      })
    } finally {
      set({ isAgentRunning: false, agentAbort: undefined, gateHandlers: undefined })
    }
  },

  replayRecipe: async (json: string) => {
    const { glyphs, isGenerating, isAgentRunning, isReplaying } = get()
    if (!glyphs.length || isGenerating || isAgentRunning || isReplaying) return

    const recipe = parseRecipeJson(json)
    const sources = glyphs.map((g) => g.sourcePng)

    const updateAll = (patch: Partial<GlyphJob>) => {
      set((state) => ({
        glyphs: state.glyphs.map((g) => ({ ...g, ...patch })),
      }))
    }

    updateAll({
      status: 'running',
      step: 'preprocess',
      error: undefined,
      fontBytes: undefined,
      validation: undefined,
      previewPng: undefined,
      agentLog: [],
      gate: undefined,
    })
    set({ isReplaying: true, recipe: undefined, output: undefined })

    try {
      const result = await runProjectPipeline(sources, recipe, (_i, step) => {
        updateAll({ step: step === 'build' ? 'validate' : step })
      })

      const previewText = recipe.glyphs.map((g) => String.fromCodePoint(g.codepoint)).join('')
      const { validation, previewPng } = await attachFontArtifacts(
        set,
        result.fontBytes,
        recipe,
        previewText || 'A',
      )

      updateAll({
        status: 'done',
        step: 'done',
        fontBytes: result.fontBytes,
        validation,
        previewPng,
        codepoint: recipe.glyphs[0]?.codepoint ?? 0x41,
      })

      recipe.glyphs.forEach((g, i) => {
        set((state) => ({
          glyphs: state.glyphs.map((job, j) =>
            j === i ? { ...job, codepoint: g.codepoint } : job,
          ),
        }))
      })
    } catch (err) {
      updateAll({
        status: 'error',
        step: 'idle',
        error: formatPipelineError(err),
      })
    } finally {
      set({ isReplaying: false })
    }
  },

  cancelAgent: () => {
    get().agentAbort?.abort()
    set({ isAgentRunning: false, agentAbort: undefined, gateHandlers: undefined })
    const glyph = get().glyphs[0]
    if (
      glyph &&
      (glyph.status === 'agent-running' || glyph.status === 'gate1' || glyph.status === 'gate2')
    ) {
      set({
        glyphs: get().glyphs.map((g) =>
          g.id === glyph.id ? { ...g, status: 'pending' as const, gate: undefined } : g,
        ),
      })
    }
  },

  copyRecipe: async () => {
    const recipe = get().recipe
    if (!recipe) throw new Error('No recipe available')
    const text = serializeRecipe(recipe)
    await navigator.clipboard.writeText(text)
  },

  downloadExport: async (format) => {
    const { output, meta, recipe } = get()
    const glyph = get().glyphs[0]
    if (!output || !glyph?.fontBytes) return

    const base = meta.family.replace(/\s+/g, '')

    if (format === 'ttf') {
      downloadBytes(output.ttf, `${base}.ttf`, 'font/ttf')
      return
    }
    if (format === 'woff2') {
      const ready = await ensureWoff2(output)
      set({ output: ready })
      downloadBytes(ready.woff2!, `${base}.woff2`, 'font/woff2')
      return
    }
    if (format === 'woff') {
      downloadBytes(output.woff, `${base}.woff`, 'font/woff')
      return
    }

    const zip = await buildFontZip(output, meta.family)
    downloadBlob(zip, `${base}-fonts.zip`)
    void recipe
  },
}))