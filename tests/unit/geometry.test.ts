import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { placeSvgPath, pxToEm, signedArea, splitContours } from '@/lib/geometry'
import { Path } from 'opentype.js'

const goldenSvg = readFileSync(
  fileURLToPath(new URL('../fixtures/golden/A.svg', import.meta.url)),
  'utf8',
)
const pathD = goldenSvg.match(/d="([^"]+)"/)![1]

describe('pxToEm', () => {
  it('maps baseline row to y=0', () => {
    const H = 1254
    const U = 1000
    const b = 946
    const foot = pxToEm(100, b, U, H, b, 40)
    expect(foot.y).toBeCloseTo(0, 5)
    const top = pxToEm(100, 238, U, H, b, 40)
    expect(top.y).toBeCloseTo(((b - 238) * U) / H, 1)
  })
})

describe('placeSvgPath on golden A', () => {
  it('anchors foot at ymin≈0 and cap height ~451', () => {
    const { path } = placeSvgPath(pathD, 1254, {
      unitsPerEm: 1000,
      baselineFraction: 946 / 1254,
      baselinePixelRow: 946,
    }, 40, 40)

    const bb = path.getBoundingBox()
    expect(bb.y1).toBeCloseTo(0, 0)
    expect(bb.y2).toBeGreaterThan(500)
    expect(bb.y2).toBeLessThan(580)
    expect(bb.x1).toBeGreaterThan(35)
    expect(bb.x1).toBeLessThan(50)
  })

  it('splits outer and counter contours', () => {
    const { path } = placeSvgPath(pathD, 1254, {
      unitsPerEm: 1000,
      baselineFraction: 946 / 1254,
      baselinePixelRow: 946,
    }, 40, 40)
    expect(splitContours(path).length).toBe(2)
  })

  it('counter winds opposite outer', () => {
    const { path } = placeSvgPath(pathD, 1254, {
      unitsPerEm: 1000,
      baselineFraction: 946 / 1254,
      baselinePixelRow: 946,
    }, 40, 40)
    const contours = splitContours(path)
    const areas = contours.map((c) => signedArea(c))
    expect(Math.sign(areas[0])).not.toBe(Math.sign(areas[1]))
  })
})

describe('signedArea', () => {
  it('is positive for CCW square', () => {
    const p = new Path()
    p.moveTo(0, 0)
    p.lineTo(100, 0)
    p.lineTo(100, 100)
    p.lineTo(0, 100)
    p.close()
    expect(signedArea(p)).toBeGreaterThan(0)
  })
})