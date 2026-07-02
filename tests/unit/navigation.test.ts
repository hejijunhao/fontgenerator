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
    expect(parsePath('/mill')).toBe('mill')
    expect(parsePath('/foundry')).toBe('foundry')
    expect(parsePath('/how-it-works')).toBe('how-it-works')
    expect(parsePath('/mill/')).toBe('mill')
  })

  it('parsePath falls back to landing for unknown paths', () => {
    expect(parsePath('/unknown')).toBe('landing')
    expect(parsePath('/studio')).toBe('landing')
  })

  it('resolvePathRedirect maps legacy and unknown paths', () => {
    expect(resolvePathRedirect('/studio')).toBe('/mill')
    expect(resolvePathRedirect('/unknown')).toBe('/')
    expect(resolvePathRedirect('/mill')).toBeNull()
    expect(resolvePathRedirect('/mill/')).toBeNull()
  })

  it('routeHref round-trips', () => {
    expect(routeHref('landing')).toBe('/')
    expect(routeHref('mill')).toBe('/mill')
    expect(parsePath(routeHref('how-it-works'))).toBe('how-it-works')
  })

  it('routeLabel uses Mill not Studio', () => {
    expect(routeLabel('mill')).toBe('Mill')
    expect(routeLabel('foundry')).toBe('Foundry')
  })

  it('parseLegacyHash maps v0.2 hash routes', () => {
    expect(parseLegacyHash('#/')).toBe('mill')
    expect(parseLegacyHash('#/how-it-works')).toBe('how-it-works')
    expect(parseLegacyHash('#')).toBe('mill')
    expect(parseLegacyHash('')).toBeNull()
    expect(parseLegacyHash('#/foundry')).toBeNull()
  })
})