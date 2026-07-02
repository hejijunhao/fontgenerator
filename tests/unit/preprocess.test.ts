import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { preprocessRgba } from '@/pipeline/preprocess'
import { REFERENCE_RECIPE } from '../helpers/referenceRecipe'

function loadFixtureRgba() {
  const buf = readFileSync(
    fileURLToPath(new URL('../fixtures/A-KaminoDeco.png', import.meta.url)),
  )
  const decoded = PNG.sync.read(buf)
  return {
    width: decoded.width,
    height: decoded.height,
    data: new Uint8ClampedArray(decoded.data),
  }
}

describe('preprocess', () => {
  it('matches Phase 0 ink bounds on A-KaminoDeco.png', () => {
    const { width, height, data } = loadFixtureRgba()
    const result = preprocessRgba(data, width, height, REFERENCE_RECIPE.preprocess)

    expect(result.canvasHeight).toBe(1254)
    expect(result.bitmap.width).toBeGreaterThanOrEqual(719)
    expect(result.bitmap.width).toBeLessThanOrEqual(721)
    expect(result.bitmap.height).toBe(1254)
    expect(result.inkBounds.x).toBeGreaterThanOrEqual(266)
    expect(result.inkBounds.x).toBeLessThanOrEqual(268)
    expect(result.inkBounds.y).toBeGreaterThanOrEqual(236)
    expect(result.inkBounds.y).toBeLessThanOrEqual(238)
    expect(result.inkBounds.h).toBeGreaterThanOrEqual(707)
    expect(result.inkBounds.h).toBeLessThanOrEqual(711)
  })
})