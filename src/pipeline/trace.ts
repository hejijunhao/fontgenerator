import { bilevelToImageData } from '@/lib/bilevel'
import type { BilevelBitmap, TraceParams, TraceResult } from '@/types/pipeline'

type PotraceWasm = {
  loadFromCanvas: (canvas: HTMLCanvasElement | { getContext: (t: string) => unknown; width: number; height: number }) => Promise<string>
}

let potraceReady: Promise<PotraceWasm> | null = null

async function loadPotrace(): Promise<PotraceWasm> {
  if (!potraceReady) {
    potraceReady = import('potrace-wasm').then((mod) => {
      const m = mod as { default?: PotraceWasm; loadFromCanvas?: PotraceWasm['loadFromCanvas'] }
      if (m.loadFromCanvas) return m as PotraceWasm
      if (m.default?.loadFromCanvas) return m.default
      throw new Error('potrace-wasm: loadFromCanvas not found')
    })
  }
  return potraceReady
}

function bitmapToCanvas(bitmap: BilevelBitmap): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error('trace() requires a DOM canvas (browser or happy-dom)')
  }
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D unavailable')
  ctx.putImageData(bilevelToImageData(bitmap), 0, 0)
  return canvas
}

async function svgToPreviewDataUrl(
  svg: string,
  width: number,
  height: number,
): Promise<string> {
  if (typeof document === 'undefined') return ''
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = new Image()
  return new Promise<string>((resolve) => {
    img.onload = () => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('')
    }
    img.src = url
  })
}

/**
 * Trace bilevel bitmap → SVG paths.
 * TraceParams are recorded for recipes; potrace-wasm uses library defaults (match CLI defaults).
 */
export async function trace(
  bitmap: BilevelBitmap,
  params: TraceParams,
): Promise<TraceResult> {
  void params
  const potrace = await loadPotrace()
  const canvas = bitmapToCanvas(bitmap)
  const svg = await potrace.loadFromCanvas(canvas)

  const match = svg.match(/d="([^"]+)"/)
  if (!match) {
    throw new Error('Potrace produced SVG without path data')
  }

  let previewPng = ''
  if (typeof document !== 'undefined') {
    previewPng = await svgToPreviewDataUrl(svg, bitmap.width, bitmap.height)
  }

  return {
    paths: [{ d: match[1], svg }],
    previewPng,
  }
}