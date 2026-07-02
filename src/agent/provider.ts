import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const DEFAULT_MODEL = 'anthropic/claude-opus-4.8'
export const FALLBACK_MODEL = 'anthropic/claude-sonnet-5'

export type AgentProviderOptions = {
  /** BYO OpenRouter key — sent per request, never persisted. */
  apiKey?: string
}

function agentBaseUrl(): string {
  if (typeof window === 'undefined') return '/api/agent/v1'
  return `${window.location.origin}/api/agent/v1`
}

/** OpenRouter client — hosted auth from `/api/agent` proxy unless BYO key is set. */
export function createAgentProvider(options: AgentProviderOptions = {}) {
  return createOpenRouter({
    baseURL: agentBaseUrl(),
    apiKey: options.apiKey,
    compatibility: 'strict',
    appName: 'Glyphmill',
    appUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
  })
}

export function resolveModelSlug(choice: 'opus' | 'sonnet'): string {
  return choice === 'sonnet' ? FALLBACK_MODEL : DEFAULT_MODEL
}