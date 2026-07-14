import { describe, expect, it } from 'vitest'
import {
  parseLegacyHash,
  parsePath,
  resolvePathRedirect,
  routeHref,
  routeLabel,
} from '@/lib/navigation'

describe('navigation', () => {
  it('parsePath maps known paths', () => {
    expect(parsePath('/')).toBe('landing')
    expect(parsePath('/export')).toBe('export')
    expect(parsePath('/generate')).toBe('generate')
    expect(parsePath('/how-it-works')).toBe('how-it-works')
    expect(parsePath('/export/')).toBe('export')
  })

  it('parsePath falls back to landing for unknown and superseded paths', () => {
    expect(parsePath('/unknown')).toBe('landing')
    expect(parsePath('/studio')).toBe('landing')
    expect(parsePath('/mill')).toBe('landing')
    expect(parsePath('/foundry')).toBe('landing')
  })

  it('resolvePathRedirect maps legacy and unknown paths', () => {
    expect(resolvePathRedirect('/mill')).toBe('/export')
    expect(resolvePathRedirect('/foundry')).toBe('/generate')
    expect(resolvePathRedirect('/unknown')).toBe('/')
    expect(resolvePathRedirect('/export')).toBeNull()
    expect(resolvePathRedirect('/export/')).toBeNull()
  })

  it('resolvePathRedirect sends /studio straight to /export without a second hop', () => {
    expect(resolvePathRedirect('/studio')).toBe('/export')
  })

  it('routeHref round-trips', () => {
    expect(routeHref('landing')).toBe('/')
    expect(routeHref('export')).toBe('/export')
    expect(parsePath(routeHref('how-it-works'))).toBe('how-it-works')
  })

  it('routeLabel uses Export and Generate, not Mill and Foundry', () => {
    expect(routeLabel('export')).toBe('Export')
    expect(routeLabel('generate')).toBe('Generate')
  })

  it('parseLegacyHash maps v0.2 hash routes', () => {
    expect(parseLegacyHash('#/')).toBe('export')
    expect(parseLegacyHash('#/how-it-works')).toBe('how-it-works')
    expect(parseLegacyHash('#')).toBe('export')
    expect(parseLegacyHash('')).toBeNull()
    expect(parseLegacyHash('#/foundry')).toBeNull()
  })
})
