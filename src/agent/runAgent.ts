import { generateText, stepCountIs } from 'ai'
import type { GateController } from '@/agent/gateController'
import { createAgentProvider, resolveModelSlug } from '@/agent/provider'
import { SYSTEM_PROMPT } from '@/agent/systemPrompt'
import { createGlyphTools } from '@/agent/tools'
import { blobToDataUrl, dataUrlToBase64 } from '@/lib/dataUrl'
import { renderSample } from '@/pipeline/render'
import type { AgentStep, AgentUsageNote } from '@/types/agent'
import type { FontMeta, ValidationResult } from '@/types/pipeline'

export type RunGlyphAgentOptions = {
  sourcePng: Blob
  sourcePreviewUrl: string
  gateController: GateController
  modelChoice?: 'opus' | 'sonnet'
  byoApiKey?: string
  onStep: (step: AgentStep) => void
  onGatePause?: (stage: 'trace' | 'font') => void
  onGateResume?: () => void
  onExporting?: () => void
  onUsage?: (note: AgentUsageNote) => void
  signal?: AbortSignal
}

export type RunGlyphAgentResult = {
  fontBytes: Uint8Array
  validation: ValidationResult
  previewPng: string
  meta: FontMeta
  codepoint: number
  agentSummary?: string
  usageNote?: AgentUsageNote
}

export async function runGlyphAgent(
  options: RunGlyphAgentOptions,
): Promise<RunGlyphAgentResult> {
  const modelSlug = resolveModelSlug(options.modelChoice ?? 'opus')
  const reasoningEffort = options.modelChoice === 'sonnet' ? 'medium' : 'high'
  const openrouter = createAgentProvider({ apiKey: options.byoApiKey })
  const model = openrouter(modelSlug, { usage: { include: true } })
  const { tools, getContext } = createGlyphTools(options.sourcePng, {
    onStep: options.onStep,
    gateController: options.gateController,
    sourcePreviewUrl: options.sourcePreviewUrl,
    onGatePause: options.onGatePause,
    onGateResume: options.onGateResume,
  })

  const sourceDataUrl = await blobToDataUrl(options.sourcePng)

  const result = await generateText({
    model,
    abortSignal: options.signal,
    stopWhen: stepCountIs(12),
    providerOptions: {
      openrouter: {
        reasoning: { effort: reasoningEffort },
      },
    },
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
        providerOptions: {
          openrouter: {
            cacheControl: { type: 'ephemeral' },
          },
        },
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Convert this PNG letter into a single-glyph TTF. Use the toolchain tools in order. You MUST call requestGate at trace and font stages and wait for human approval. Finish when render QA passes.',
          },
          {
            type: 'image',
            image: dataUrlToBase64(sourceDataUrl),
            mediaType: 'image/png',
          },
        ],
      },
    ],
    tools,
    onFinish: ({ totalUsage, providerMetadata }) => {
      const openrouterMeta = providerMetadata?.openrouter as
        | { usage?: { totalTokens?: number; cost?: number; costDetails?: unknown } }
        | undefined
      const usage = openrouterMeta?.usage
      const note: AgentUsageNote = {
        totalTokens: totalUsage.totalTokens ?? usage?.totalTokens,
        cacheReadTokens: totalUsage.inputTokenDetails?.cacheReadTokens,
        cost: usage?.cost,
        reasoningEffort,
        modelSlug,
        raw: { totalUsage, providerMetadata },
      }
      options.onUsage?.(note)
      if (typeof console !== 'undefined') {
        console.info('[agent] provider usage', note)
      }
    },
  })

  const ctx = getContext()

  if (!ctx.fontBytes) {
    throw new Error(
      result.text ||
        'Agent finished without building a font. Try the no-agent Generate path or re-run.',
    )
  }

  if (!ctx.validation) {
    ctx.validation = { otsOk: false, roundTripOk: false, warnings: ['Agent skipped validate'] }
  }

  options.onExporting?.()

  const previewPng =
    ctx.renderPreview ?? (await renderSample(ctx.fontBytes, String.fromCodePoint(ctx.codepoint)))

  return {
    fontBytes: ctx.fontBytes,
    validation: ctx.validation,
    previewPng,
    meta: ctx.meta,
    codepoint: ctx.codepoint,
    agentSummary: result.text,
    usageNote: undefined,
  }
}