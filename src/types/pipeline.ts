import type { Path } from 'opentype.js'

/** Bilevel bitmap: 0 = ink, 255 = paper (RGBA all same). */
export type BilevelBitmap = {
  width: number
  height: number
  /** Shared canvas height (equals height when horizontal-only crop). */
  canvasHeight: number
  pixels: Uint8ClampedArray
}

export type InkBounds = { x: number; y: number; w: number; h: number }

export type PreprocessParams = {
  threshold: number
  close: number
  invert: boolean
}

export type PreprocessResult = {
  bitmap: BilevelBitmap
  inkBounds: InkBounds
  canvasHeight: number
  previewPng: string
}

export type TraceParams = {
  turdsize: number
  alphamax: number
  opttolerance: number
}

export type SvgPath = {
  d: string
  svg: string
}

export type TraceResult = {
  paths: SvgPath[]
  previewPng: string
}

export type Point = { x: number; y: number }

export type Contour = { points: Point[]; clockwise: boolean }

export type Metrics = {
  leftBearing: number
  rightBearing: number
  advanceWidth: number
}

export type PlaceParams = {
  unitsPerEm: number
  baselineFraction: number
  baselinePixelRow?: number
  verticalOverride?: { dyEm: number; scale: number }
}

export type PlacedGlyph = {
  codepoint: number
  path: Path
  metrics: Metrics
}

export type FontMeta = {
  family: string
  style: string
  unitsPerEm: number
  baselineFraction: number
}

export type ValidationResult = {
  otsOk: boolean
  roundTripOk: boolean
  warnings: string[]
}

export type MasterFormat = 'ttf'

export type GlyphRecipe = {
  codepoint: number
  preprocess: PreprocessParams
  trace: TraceParams
  place: PlaceParams
  metrics: Pick<Metrics, 'leftBearing' | 'rightBearing'>
}

export type Recipe = {
  version: 1
  meta: FontMeta
  glyphs: GlyphRecipe[]
  notdefWidth?: number
  spaceWidth?: number
}

export type FontExportBundle = {
  ttf: Uint8Array
  woff: Uint8Array
  /** Encoded lazily on first WOFF2/zip download. */
  woff2?: Uint8Array
}