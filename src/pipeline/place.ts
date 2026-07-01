import { placeSvgPath } from '@/lib/geometry'
import type { Metrics, PlaceParams, PlacedGlyph, TraceResult } from '@/types/pipeline'

export type PlaceMetricsInput = Pick<Metrics, 'leftBearing' | 'rightBearing'>

export function place(
  traceResult: TraceResult,
  srcHeight: number,
  codepoint: number,
  placeParams: PlaceParams,
  metrics: PlaceMetricsInput,
  bitmapWidth?: number,
): PlacedGlyph {
  const pathD = traceResult.paths[0]?.d
  if (!pathD) {
    throw new Error('No traced path to place')
  }

  const { path, advanceWidth: bboxAdvance } = placeSvgPath(
    pathD,
    srcHeight,
    placeParams,
    metrics.leftBearing,
    metrics.rightBearing,
  )

  const s = placeParams.unitsPerEm / srcHeight
  const advanceWidth =
    bitmapWidth !== undefined
      ? Math.round(bitmapWidth * s + metrics.leftBearing + metrics.rightBearing)
      : bboxAdvance

  return {
    codepoint,
    path,
    metrics: {
      leftBearing: metrics.leftBearing,
      rightBearing: metrics.rightBearing,
      advanceWidth,
    },
  }
}