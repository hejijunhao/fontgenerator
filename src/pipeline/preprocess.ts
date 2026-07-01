import {
  bilevelToDataUrl,
  findInkBounds,
  horizontalCrop,
  isInk,
  luminance,
  morphologyClose,
} from '@/lib/bilevel'
import { loadRgbaFromBlob } from '@/lib/raster'
import type { PreprocessParams, PreprocessResult } from '@/types/pipeline'

export function preprocessRgba(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  params: PreprocessParams,
): PreprocessResult {
  const full = new Uint8ClampedArray(width * height)
  for (let i = 0; i < width * height; i++) {
    const o = i * 4
    const lum = luminance(rgba[o], rgba[o + 1], rgba[o + 2])
    full[i] = isInk(lum, params.threshold, params.invert) ? 0 : 255
  }

  const closed = morphologyClose(full, width, height, params.close)
  const bounds = findInkBounds(closed, width, height)
  if (!bounds) {
    throw new Error('No ink found after preprocessing')
  }

  const bitmap = horizontalCrop(closed, width, height, bounds)

  return {
    bitmap,
    inkBounds: bounds,
    canvasHeight: height,
    previewPng: bilevelToDataUrl(bitmap),
  }
}

export async function preprocess(
  png: Blob,
  params: PreprocessParams,
): Promise<PreprocessResult> {
  const { width, height, data } = await loadRgbaFromBlob(png)
  return preprocessRgba(data, width, height, params)
}