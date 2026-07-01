import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { buildFontZip, buildExportBundle, ensureWoff2 } from '@/lib/fontExport'
import { buildFont } from '@/pipeline/buildFont'
import { place } from '@/pipeline/place'
import { REFERENCE_RECIPE } from '../helpers/referenceRecipe'

describe('zip export (node)', () => {
  it('zip contains ttf, woff2, and woff', async () => {
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
    const bundle = await ensureWoff2(await buildExportBundle(ttf))
    const zipBlob = await buildFontZip(bundle, REFERENCE_RECIPE.meta.family)
    const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer())

    expect(zip.file('KaminoDeco.ttf')).toBeTruthy()
    expect(zip.file('KaminoDeco.woff2')).toBeTruthy()
    expect(zip.file('KaminoDeco.woff')).toBeTruthy()
  }, 20_000)
})