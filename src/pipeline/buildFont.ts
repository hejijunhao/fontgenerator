import { Font, Glyph, Path } from 'opentype.js'
import type { FontMeta, MasterFormat, PlacedGlyph } from '@/types/pipeline'

export const MASTER_FORMAT: MasterFormat = 'ttf'

export type BuildFontOptions = {
  notdefWidth?: number
  spaceWidth?: number
}

export function buildFont(
  glyphs: PlacedGlyph[],
  meta: FontMeta,
  options: BuildFontOptions = {},
): Uint8Array {
  const notdefWidth = options.notdefWidth ?? 600
  const spaceWidth = options.spaceWidth ?? 250
  const ascender = Math.round(meta.baselineFraction * meta.unitsPerEm)
  const descender = -Math.round((1 - meta.baselineFraction) * meta.unitsPerEm)

  const otGlyphs: Glyph[] = [
    new Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: notdefWidth,
      path: new Path(),
    }),
    new Glyph({
      name: 'space',
      unicode: 0x20,
      advanceWidth: spaceWidth,
      path: new Path(),
    }),
  ]

  for (const g of glyphs) {
    const charName =
      g.codepoint === 0x20
        ? 'space'
        : g.codepoint > 0x20 && g.codepoint < 0x7f
          ? String.fromCharCode(g.codepoint)
          : `uni${g.codepoint.toString(16).toUpperCase().padStart(4, '0')}`

    otGlyphs.push(
      new Glyph({
        name: charName,
        unicode: g.codepoint,
        advanceWidth: g.metrics.advanceWidth,
        path: g.path,
      }),
    )
  }

  const font = new Font({
    familyName: meta.family,
    styleName: meta.style,
    unitsPerEm: meta.unitsPerEm,
    ascender,
    descender,
    glyphs: otGlyphs,
  })

  return new Uint8Array(font.toArrayBuffer())
}