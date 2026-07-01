export type RgbaImage = {
  width: number
  height: number
  data: Uint8ClampedArray
}

export async function loadRgbaFromBlob(blob: Blob): Promise<RgbaImage> {
  if (typeof createImageBitmap !== 'undefined' && typeof document !== 'undefined') {
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    ctx.drawImage(bitmap, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return { width, height, data }
  }

  const { PNG } = await import('pngjs')
  const buffer = await blob.arrayBuffer()
  const decoded = PNG.sync.read(Buffer.from(buffer))
  return {
    width: decoded.width,
    height: decoded.height,
    data: new Uint8ClampedArray(decoded.data),
  }
}

export function rgbaToDataUrl(image: RgbaImage): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const buf = new Uint8ClampedArray(image.data)
  ctx.putImageData(new ImageData(buf, image.width, image.height), 0, 0)
  return canvas.toDataURL('image/png')
}