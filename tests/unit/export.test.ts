import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildFont } from '@/pipeline/buildFont'
import { place } from '@/pipeline/place'
import { validate } from '@/pipeline/validate'
import { toWoff2 } from '@/pipeline/export'
import { REFERENCE_RECIPE } from '../helpers/referenceRecipe'

describe('export (node)', () => {
  it('compresses pipeline TTF to WOFF2', async () => {
    const goldenSvg = readFileSync(
      fileURLToPath(new URL('../fixtures/golden/A.svg', import.meta.url)),
      'utf8',
    )
    const pathD = goldenSvg.match(/d="([^"]+)"/)![1]
    const placed = place(
      { paths: [{ d: pathD, svg: goldenSvg }], previewPng: '' },
      1254,
      0x41,
      REFERENCE_RECIPE.place,
      REFERENCE_RECIPE.metrics,
      720,
    )
    const ttf = buildFont([placed], REFERENCE_RECIPE.meta)

    const woff2 = await toWoff2(ttf)
    expect(woff2.byteLength).toBeGreaterThan(100)
    expect(validate(woff2).roundTripOk).toBe(true)
    expect(validate(ttf).roundTripOk).toBe(true)
  }, 15_000)
})