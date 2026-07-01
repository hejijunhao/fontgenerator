import {
  checkRateLimit,
  clientIpFromHeaders,
  isByoAuthorization,
  type RateLimitEntry,
} from '../../src/lib/rateLimit'

export const config = {
  runtime: 'edge',
}

const OPENROUTER_ORIGIN = 'https://openrouter.ai'

const RATE_WINDOW_MS = 60_000
const RATE_MAX_REQUESTS = 30

const rateLimitStore = new Map<string, RateLimitEntry>()

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const upstreamPath = url.pathname.replace(/^\/api\/agent/, '/api')
  const target = `${OPENROUTER_ORIGIN}${upstreamPath}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')

  const clientAuth = headers.get('authorization')
  const byo = isByoAuthorization(clientAuth)

  if (!byo) {
    const hostedKey = process.env.OPENROUTER_API_KEY
    if (!hostedKey) {
      return jsonError(
        503,
        'Hosted agent mode is unavailable. Add OPENROUTER_API_KEY on the server or supply your own OpenRouter key in Agent settings.',
      )
    }

    const ip = clientIpFromHeaders(headers)
    const limit = checkRateLimit(rateLimitStore, ip, {
      windowMs: RATE_WINDOW_MS,
      maxRequests: RATE_MAX_REQUESTS,
    })

    if (!limit.allowed) {
      return jsonError(
        429,
        `Rate limit exceeded for hosted agent mode. Retry in ${limit.retryAfterSec}s or use your own OpenRouter API key.`,
        { 'Retry-After': String(limit.retryAfterSec) },
      )
    }

    headers.set('Authorization', `Bearer ${hostedKey}`)
  }

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
    init.duplex = 'half'
  }

  const upstream = await fetch(target, init)

  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete('content-encoding')

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

function jsonError(status: number, message: string, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })
}