import { describe, expect, it } from 'vitest'
import { runPipeline } from '@/pipeline/runPipeline'
import { validate } from '@/pipeline/validate'
import { renderSample } from '@/pipeline/render'
import { REFERENCE_RECIPE } from '../helpers/referenceRecipe'
import fixtureUrl from '../fixtures/A-KaminoDeco.png?url'

async function loadFixtureBlob(): Promise<Blob> {
  const res = await fetch(fixtureUrl)
  return res.blob()
}

async function samplePixel(dataUrl: string, x: number, y: number): Promise<number> {
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = dataUrl
  })
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const pixel = ctx.getImageData(x, y, 1, 1).data
  return pixel[0]
}

describe('full pipeline (browser)', () => {
  it('builds KaminoDeco A with open counter', async () => {
    const png = await loadFixtureBlob()
    const result = await runPipeline(png, REFERENCE_RECIPE)

    expect(result.placed.codepoint).toBe(0x41)
    expect(result.placed.metrics.advanceWidth).toBeGreaterThanOrEqual(654)
    expect(result.placed.metrics.advanceWidth).toBeLessThanOrEqual(656)

    const bb = result.placed.path.getBoundingBox()
    expect(bb.y1).toBeCloseTo(0, 0)
    expect(bb.y2).toBeGreaterThan(400)

    const validation = validate(result.fontBytes)
    expect(validation.roundTripOk).toBe(true)

    const render = await renderSample(result.fontBytes, 'A')
    expect(render.startsWith('data:image/png')).toBe(true)

    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = render
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    let counterX = 0
    let counterY = 0
    let foundInk = false
    const { width, height } = canvas
    const data = ctx.getImageData(0, 0, width, height).data
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4] === 0) {
          foundInk = true
          counterX = Math.floor(width / 2)
          counterY = Math.floor(y + (height - y) * 0.35)
          break
        }
      }
      if (foundInk) break
    }

    const counter = await samplePixel(render, counterX, counterY)
    expect(counter).toBeGreaterThan(200)
  }, 30_000)
})