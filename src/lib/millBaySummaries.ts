import type { GlyphStatus } from '@/store/projectStore'

type BaySummaryInput = {
  glyphsLength: number
  glyphStatus?: GlyphStatus
  isGenerating: boolean
  isAgentRunning: boolean
  isReplaying: boolean
  hasOutput: boolean
  hasPreview: boolean
  family: string
  atGate: boolean
}

export function sourceBaySummary({ glyphsLength }: BaySummaryInput): string {
  if (glyphsLength === 0) return 'Awaiting PNG upload'
  return `${glyphsLength} PNG${glyphsLength === 1 ? '' : 's'} loaded`
}

export function buildBaySummary(input: BaySummaryInput): string {
  if (input.glyphsLength === 0) return 'Upload glyphs in Source first'
  if (input.atGate) return 'Paused — awaiting gate review'
  if (input.isGenerating) return 'Generating font…'
  if (input.isReplaying) return 'Replaying recipe…'
  if (input.isAgentRunning) return 'Agent running…'
  if (input.glyphStatus === 'error') return 'Pipeline error — expand to retry'
  return 'Ready — generate or run agent'
}

export function reviewBaySummary(input: BaySummaryInput): string {
  if (input.atGate) return 'Human gate — approve or nudge'
  if (input.hasPreview) return 'Preview and validation ready'
  if (input.isGenerating || input.isReplaying) return 'Building — preview pending'
  return 'Run build to see preview'
}

export function exportBaySummary({ hasOutput, family }: BaySummaryInput): string {
  if (!hasOutput) return 'Build a font to enable downloads'
  return `${family.replace(/\s+/g, '')} — TTF / WOFF2 / zip ready`
}