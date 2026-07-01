export type RateLimitConfig = {
  windowMs: number
  maxRequests: number
}

export type RateLimitEntry = {
  count: number
  resetAt: number
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number }

export function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  config: RateLimitConfig,
  now = Date.now(),
): RateLimitResult {
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true }
  }

  if (entry.count < config.maxRequests) {
    entry.count += 1
    return { allowed: true }
  }

  const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
  return { allowed: false, retryAfterSec }
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return headers.get('x-real-ip') ?? 'unknown'
}

export function isByoAuthorization(authHeader: string | null): boolean {
  if (!authHeader) return false
  const match = authHeader.match(/^Bearer\s+(\S+)/i)
  if (!match) return false
  const token = match[1]
  return token.startsWith('sk-or-') || token.startsWith('sk-or-v1-')
}