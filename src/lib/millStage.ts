import type { GlyphStatus } from '@/store/projectStore'

export type MillStage = 'source' | 'build' | 'review' | 'export'

export const MILL_STAGES: { id: MillStage; label: string }[] = [
  { id: 'source', label: 'Source' },
  { id: 'build', label: 'Build' },
  { id: 'review', label: 'Review' },
  { id: 'export', label: 'Export' },
]

type DeriveMillStageInput = {
  glyphsLength: number
  glyphStatus?: GlyphStatus
  isGenerating: boolean
  isAgentRunning: boolean
  isReplaying: boolean
  hasOutput: boolean
  hasPreview: boolean
}

export function deriveMillStage(input: DeriveMillStageInput): MillStage {
  const {
    glyphsLength,
    glyphStatus,
    isGenerating,
    isAgentRunning,
    isReplaying,
    hasOutput,
    hasPreview,
  } = input

  if (glyphsLength === 0) return 'source'

  if (glyphStatus === 'gate1' || glyphStatus === 'gate2') return 'review'

  if (glyphStatus === 'exporting' || (hasOutput && glyphStatus === 'done')) return 'export'

  if (
    isGenerating ||
    isReplaying ||
    glyphStatus === 'running' ||
    (isAgentRunning && glyphStatus === 'agent-running')
  ) {
    return 'build'
  }

  if (hasPreview || glyphStatus === 'done') return 'review'

  if (hasOutput) return 'export'

  return 'source'
}