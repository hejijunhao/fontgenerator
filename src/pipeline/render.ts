import { parse as parseFont } from 'opentype.js'
import { toArrayBuffer } from '@/lib/buffer'

export async function renderSample(fontBytes: Uint8Array, text: string): Promise<string> {
  const font = parseFont(toArrayBuffer(fontBytes))

  if (typeof document !== 'undefined') {
    return renderWithFontFace(fontBytes, text)
  }

  return renderWithOpentypeDraw(font, text)
}

async function renderWithFontFace(fontBytes: Uint8Array, text: string): Promise<string> {
  const blob = new Blob([toArrayBuffer(fontBytes)], { type: 'font/ttf' })
  const url = URL.createObjectURL(blob)
  try {
    const face = new FontFace('PipelineRender', `url(${url})`)
    await face.load()
    document.fonts.add(face)

    const fontSize = 200
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')

    ctx.font = `${fontSize}px PipelineRender`
    const metrics = ctx.measureText(text)
    const margin = 40
    canvas.width = Math.ceil(metrics.width + margin * 2)
    canvas.height = Math.ceil(fontSize + margin * 2)

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    ctx.font = `${fontSize}px PipelineRender`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(text, margin, canvas.height - margin)

    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}

function renderWithOpentypeDraw(
  font: ReturnType<typeof parseFont>,
  text: string,
): string {
  const fontSize = 200
  const path = font.getPath(text, 40, fontSize + 40, fontSize)
  const bbox = path.getBoundingBox()
  const width = Math.ceil(bbox.x2 - bbox.x1 + 80)
  const height = Math.ceil(bbox.y2 - bbox.y1 + 80)

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    path.draw(ctx)
    return canvas.toDataURL('image/png')
  }

  return ''
}