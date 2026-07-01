import type {
  FontMeta,
  PlaceParams,
  PlacedGlyph,
  PreprocessParams,
  PreprocessResult,
  TraceParams,
  TraceResult,
  ValidationResult,
} from '@/types/pipeline'

export type GlyphAgentContext = {
  sourcePng: Blob
  codepoint: number
  meta: FontMeta
  preprocess?: PreprocessResult & { params: PreprocessParams }
  trace?: TraceResult & { params: TraceParams }
  placed?: PlacedGlyph & {
    params: PlaceParams
    bearings: { leftBearing: number; rightBearing: number }
  }
  fontBytes?: Uint8Array
  validation?: ValidationResult
  renderPreview?: string
  finished: boolean
  notdefWidth: number
  spaceWidth: number
}

export function createGlyphAgentContext(sourcePng: Blob): GlyphAgentContext {
  return {
    sourcePng,
    codepoint: 0x41,
    meta: {
      family: 'KaminoDeco',
      style: 'Regular',
      unitsPerEm: 1000,
      baselineFraction: 0.754385,
    },
    finished: false,
    notdefWidth: 600,
    spaceWidth: 250,
  }
}