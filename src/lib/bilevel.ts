import type { BilevelBitmap, InkBounds } from '@/types/pipeline'

export function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export function isInk(lum: number, threshold: number, invert: boolean): boolean {
  const dark = lum < 255 * threshold
  return invert ? !dark : dark
}

/** 3×3 binary close (dilate ink then erode) on bilevel buffer. */
export function morphologyClose(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): Uint8ClampedArray {
  if (radius <= 0) return pixels

  let current = pixels
  for (let pass = 0; pass < radius; pass++) {
    current = dilateInk(current, width, height)
  }
  for (let pass = 0; pass < radius; pass++) {
    current = erodeInk(current, width, height)
  }
  return current
}

function dilateInk(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(pixels)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[y * width + x] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
              out[ny * width + nx] = 0
            }
          }
        }
      }
    }
  }
  return out
}

function erodeInk(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(pixels.length)
  out.fill(255)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[y * width + x] !== 0) continue
      let keep = true
      for (let dy = -1; dy <= 1 && keep; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height || pixels[ny * width + nx] !== 0) {
            keep = false
            break
          }
        }
      }
      if (keep) out[y * width + x] = 0
    }
  }
  return out
}

export function findInkBounds(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): InkBounds | null {
  let left = width
  let right = -1
  let top = height
  let bottom = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[y * width + x] === 0) {
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
  }

  if (right < 0) return null

  return {
    x: left,
    y: top,
    w: right - left + 1,
    h: bottom - top + 1,
  }
}

/** Horizontal-only crop: trim x to ink; keep full canvas height. */
export function horizontalCrop(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  bounds: InkBounds,
): BilevelBitmap {
  const out = new Uint8ClampedArray(bounds.w * height)
  out.fill(255)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < bounds.w; x++) {
      out[y * bounds.w + x] = pixels[y * width + (x + bounds.x)]
    }
  }
  return {
    width: bounds.w,
    height,
    canvasHeight: height,
    pixels: out,
  }
}

export function bilevelToImageData(bitmap: BilevelBitmap): ImageData {
  const { width, height, pixels } = bitmap
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const v = pixels[i]
    const o = i * 4
    rgba[o] = v
    rgba[o + 1] = v
    rgba[o + 2] = v
    rgba[o + 3] = 255
  }
  return new ImageData(rgba, width, height)
}

export function bilevelToDataUrl(bitmap: BilevelBitmap): string {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    ctx.putImageData(bilevelToImageData(bitmap), 0, 0)
    return canvas.toDataURL('image/png')
  }
  return ''
}