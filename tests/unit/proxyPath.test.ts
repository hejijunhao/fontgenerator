import { describe, expect, it } from 'vitest'

function upstreamPath(requestPath: string): string {
  return requestPath.replace(/^\/api\/agent/, '/api')
}

describe('agent proxy path rewrite', () => {
  it('maps client baseURL to OpenRouter /api/v1', () => {
    expect(upstreamPath('/api/agent/v1/chat/completions')).toBe(
      '/api/v1/chat/completions',
    )
  })
})