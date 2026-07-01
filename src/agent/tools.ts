import { tool } from 'ai'
import { z } from 'zod'
import { buildFont } from '@/pipeline/buildFont'
import { place } from '@/pipeline/place'
import { preprocess } from '@/pipeline/preprocess'
import { renderSample } from '@/pipeline/render'
import { trace } from '@/pipeline/trace'
import { validate } from '@/pipeline/validate'
import { formatPipelineError } from '@/lib/pipelineError'
import type { GateController } from '@/agent/gateController'
import type { AgentStep } from '@/types/agent'
import { createGlyphAgentContext, type GlyphAgentContext } from '@/agent/context'
import { jsonWithPreview } from '@/agent/toolOutput'

export type AgentToolHooks = {
  onStep: (step: AgentStep) => void
  gateController: GateController
  sourcePreviewUrl: string
  onGatePause?: (stage: 'trace' | 'font') => void
  onGateResume?: () => void
  toolCallCount?: () => number
}

function logStep(
  hooks: AgentToolHooks,
  entry: Omit<AgentStep, 'timestamp'>,
) {
  hooks.onStep({ ...entry, timestamp: Date.now() })
}

export function createGlyphTools(sourcePng: Blob, hooks: AgentToolHooks) {
  const ctx: GlyphAgentContext = createGlyphAgentContext(sourcePng)
  let toolCalls = 0

  const countTool = () => {
    toolCalls += 1
    return toolCalls
  }

  const preprocessTool = tool({
    description:
      'Threshold PNG to bilevel bitmap. Horizontal-only crop. Returns ink bounds and preview.',
    inputSchema: z.object({
      threshold: z.number().min(0).max(1).describe('Luminance threshold 0–1'),
      close: z.number().int().min(0).max(5).default(1).describe('Morphology close radius'),
      invert: z.boolean().default(false),
    }),
    execute: async (params) => {
      countTool()
      try {
        const result = await preprocess(ctx.sourcePng, params)
        ctx.preprocess = { ...result, params }
        const summary = {
          inkBounds: result.inkBounds,
          canvasHeight: result.canvasHeight,
          bitmapWidth: result.bitmap.width,
        }
        logStep(hooks, { tool: 'preprocess', params, verdict: 'ok', previewPng: result.previewPng })
        return summary
      } catch (err) {
        const message = formatPipelineError(err)
        logStep(hooks, { tool: 'preprocess', params, error: message })
        throw new Error(message)
      }
    },
    toModelOutput: ({ output }) => jsonWithPreview(output, ctx.preprocess?.previewPng),
  })

  const traceTool = tool({
    description: 'Potrace bitmap to SVG paths. Requires preprocess first.',
    inputSchema: z.object({
      turdsize: z.number().int().min(0).default(2),
      alphamax: z.number().min(0).max(1.34).default(1.0),
      opttolerance: z.number().min(0).max(1).default(0.2),
    }),
    execute: async (params) => {
      countTool()
      if (!ctx.preprocess) throw new Error('Call preprocess before trace')
      try {
        const result = await trace(ctx.preprocess.bitmap, params)
        ctx.trace = { ...result, params }
        const summary = { pathCount: result.paths.length }
        logStep(hooks, { tool: 'trace', params, verdict: 'ok', previewPng: result.previewPng })
        return summary
      } catch (err) {
        const message = formatPipelineError(err)
        logStep(hooks, { tool: 'trace', params, error: message })
        throw new Error(message)
      }
    },
    toModelOutput: ({ output }) => jsonWithPreview(output, ctx.trace?.previewPng),
  })

  const assignCharacterTool = tool({
    description: 'Assign Unicode codepoint for this glyph (e.g. "A" → 65).',
    inputSchema: z.object({
      character: z.string().min(1).max(1).describe('Single character label'),
    }),
    execute: async ({ character }) => {
      countTool()
      const codepoint = character.codePointAt(0)
      if (!codepoint) throw new Error('Invalid character')
      ctx.codepoint = codepoint
      logStep(hooks, { tool: 'assignCharacter', params: { character, codepoint }, verdict: 'ok' })
      return { codepoint, character }
    },
  })

  const placeTool = tool({
    description: 'Transform traced SVG to font units with baseline and bearings. Requires trace.',
    inputSchema: z.object({
      unitsPerEm: z.number().int().positive().default(1000),
      baselineFraction: z.number().min(0).max(1).default(0.754385),
      leftBearing: z.number().int().min(0).default(40),
      rightBearing: z.number().int().min(0).default(40),
    }),
    execute: async (params) => {
      countTool()
      if (!ctx.trace || !ctx.preprocess) throw new Error('Call preprocess and trace before place')
      try {
        const placeParams = {
          unitsPerEm: params.unitsPerEm,
          baselineFraction: params.baselineFraction,
        }
        const placed = place(
          ctx.trace,
          ctx.preprocess.canvasHeight,
          ctx.codepoint,
          placeParams,
          { leftBearing: params.leftBearing, rightBearing: params.rightBearing },
          ctx.preprocess.bitmap.width,
        )
        ctx.placed = {
          ...placed,
          params: placeParams,
          bearings: { leftBearing: params.leftBearing, rightBearing: params.rightBearing },
        }
        ctx.meta.unitsPerEm = params.unitsPerEm
        ctx.meta.baselineFraction = params.baselineFraction
        const bbox = placed.path.getBoundingBox()
        const summary = {
          codepoint: placed.codepoint,
          advanceWidth: placed.metrics.advanceWidth,
          bbox,
        }
        logStep(hooks, { tool: 'place', params, verdict: 'ok' })
        return summary
      } catch (err) {
        const message = formatPipelineError(err)
        logStep(hooks, { tool: 'place', params, error: message })
        throw new Error(message)
      }
    },
  })

  const buildFontTool = tool({
    description: 'Build TTF from placed glyph. Requires place.',
    inputSchema: z.object({
      family: z.string().default('KaminoDeco'),
      style: z.string().default('Regular'),
      notdefWidth: z.number().int().positive().default(600),
      spaceWidth: z.number().int().positive().default(250),
    }),
    execute: async (params) => {
      countTool()
      if (!ctx.placed) throw new Error('Call place before buildFont')
      try {
        ctx.meta.family = params.family
        ctx.meta.style = params.style
        ctx.notdefWidth = params.notdefWidth
        ctx.spaceWidth = params.spaceWidth
        ctx.fontBytes = buildFont([ctx.placed], ctx.meta, {
          notdefWidth: params.notdefWidth,
          spaceWidth: params.spaceWidth,
        })
        logStep(hooks, { tool: 'buildFont', params, verdict: 'ok' })
        return { byteLength: ctx.fontBytes.byteLength, family: params.family }
      } catch (err) {
        const message = formatPipelineError(err)
        logStep(hooks, { tool: 'buildFont', params, error: message })
        throw new Error(message)
      }
    },
  })

  const validateTool = tool({
    description: 'Structural round-trip parse of built font bytes.',
    inputSchema: z.object({}),
    execute: async () => {
      countTool()
      if (!ctx.fontBytes) throw new Error('Call buildFont before validate')
      ctx.validation = validate(ctx.fontBytes)
      logStep(hooks, {
        tool: 'validate',
        params: {},
        verdict: ctx.validation.roundTripOk ? 'ok' : 'warn',
      })
      return ctx.validation
    },
  })

  const renderSampleTool = tool({
    description: 'Render sample text with built font for visual QA.',
    inputSchema: z.object({
      text: z.string().min(1).max(8).default('A'),
    }),
    execute: async ({ text }) => {
      countTool()
      if (!ctx.fontBytes) throw new Error('Call buildFont before renderSample')
      try {
        const previewPng = await renderSample(ctx.fontBytes, text)
        ctx.renderPreview = previewPng
        logStep(hooks, { tool: 'renderSample', params: { text }, verdict: 'ok', previewPng })
        return { text, rendered: true }
      } catch (err) {
        const message = formatPipelineError(err)
        logStep(hooks, { tool: 'renderSample', params: { text }, error: message })
        throw new Error(message)
      }
    },
    toModelOutput: ({ output }) => jsonWithPreview(output, ctx.renderPreview),
  })

  const requestGateTool = tool({
    description:
      'Pause for human review at trace or font stage. Blocks until the user accepts or sends a nudge.',
    inputSchema: z.object({
      stage: z.enum(['trace', 'font']),
      summary: z.string(),
    }),
    execute: async (params) => {
      countTool()
      const callCount = hooks.toolCallCount?.() ?? toolCalls
      const summarySuffix =
        callCount >= 8 ? ' (max tool calls — human review required)' : ''

      hooks.onGatePause?.(params.stage)
      const response = await hooks.gateController.waitForHuman({
        stage: params.stage,
        summary: `${params.summary}${summarySuffix}`,
        sourcePreviewUrl: hooks.sourcePreviewUrl,
        tracePreviewPng: ctx.trace?.previewPng,
        renderPreviewPng: ctx.renderPreview,
        proposedCharacter: String.fromCodePoint(ctx.codepoint),
        validation: ctx.validation,
      })
      hooks.onGateResume?.()

      if (response.action === 'fixCharacter') {
        const codepoint = response.character.codePointAt(0)
        if (codepoint) ctx.codepoint = codepoint
      }

      const verdict =
        response.action === 'accept'
          ? 'accepted'
          : response.action === 'retrace'
            ? 'retrace-nudge'
            : response.action === 'fixCharacter'
              ? 'fix-character'
              : 'adjust-nudge'

      logStep(hooks, {
        tool: 'requestGate',
        params: { ...params, response },
        verdict,
      })

      return {
        accepted: response.action === 'accept',
        stage: params.stage,
        summary: params.summary,
        action: response.action,
        nudge:
          response.action === 'retrace' || response.action === 'adjust'
            ? response.nudge
            : undefined,
        character: response.action === 'fixCharacter' ? response.character : undefined,
        codepoint: ctx.codepoint,
      }
    },
  })

  const finishTool = tool({
    description: 'Mark glyph complete after visual QA passes.',
    inputSchema: z.object({
      summary: z.string(),
    }),
    execute: async (params) => {
      countTool()
      ctx.finished = true
      logStep(hooks, { tool: 'finish', params, verdict: 'done' })
      return { finished: true, summary: params.summary }
    },
  })

  return {
    tools: {
      preprocess: preprocessTool,
      trace: traceTool,
      assignCharacter: assignCharacterTool,
      place: placeTool,
      buildFont: buildFontTool,
      validate: validateTool,
      renderSample: renderSampleTool,
      requestGate: requestGateTool,
      finish: finishTool,
    },
    getContext: () => ctx,
  }
}