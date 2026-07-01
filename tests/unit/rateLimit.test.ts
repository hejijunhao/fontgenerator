import { describe, expect, it } from 'vitest'
import {
  checkRateLimit,
  clientIpFromHeaders,
  isByoAuthorization,
  type RateLimitEntry,
} from '@/lib/rateLimit'

describe('rateLimit', () => {
  it('allows requests under the cap', () => {
    const store = new Map<string, RateLimitEntry>()
    const config = { windowMs: 60_000, maxRequests: 3 }

    expect(checkRateLimit(store, '1.2.3.4', config, 0).allowed).toBe(true)
    expect(checkRateLimit(store, '1.2.3.4', config, 1000).allowed).toBe(true)
    expect(checkRateLimit(store, '1.2.3.4', config, 2000).allowed).toBe(true)
    expect(checkRateLimit(store, '1.2.3.4', config, 3000).allowed).toBe(false)
  })

  it('resets after the window', () => {
    const store = new Map<string, RateLimitEntry>()
    const config = { windowMs: 1000, maxRequests: 1 }

    expect(checkRateLimit(store, 'ip', config, 0).allowed).toBe(true)
    expect(checkRateLimit(store, 'ip', config, 500).allowed).toBe(false)
    expect(checkRateLimit(store, 'ip', config, 1001).allowed).toBe(true)
  })

  it('detects BYO authorization headers', () => {
    expect(isByoAuthorization(null)).toBe(false)
    expect(isByoAuthorization('Bearer sk-or-test')).toBe(true)
    expect(isByoAuthorization('Bearer sk-or-v1-test')).toBe(true)
    expect(isByoAuthorization('Bearer hosted-injected')).toBe(false)
  })

  it('reads client IP from forwarded headers', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.1, 70.41.3.18',
    })
    expect(clientIpFromHeaders(headers)).toBe('203.0.113.1')
  })
})