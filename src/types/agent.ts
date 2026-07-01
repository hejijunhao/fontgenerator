import type { ValidationResult } from '@/types/pipeline'

export type AgentStep = {
  tool: string
  params: unknown
  verdict?: string
  previewPng?: string
  error?: string
  timestamp: number
}

export type AgentUsageNote = {
  totalTokens?: number
  cacheReadTokens?: number
  cost?: number
  reasoningEffort?: string
  modelSlug?: string
  raw?: unknown
}

export type GateSnapshot = {
  stage: 'trace' | 'font'
  summary: string
  tracePreviewPng?: string
  renderPreviewPng?: string
  proposedCharacter: string
  validation?: ValidationResult
}