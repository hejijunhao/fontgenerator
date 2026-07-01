import { toArrayBuffer } from '@/lib/buffer'
import { toWoff, toWoff2 } from '@/pipeline/export'
import type { FontExportBundle } from '@/types/pipeline'

/** TTF + WOFF stub immediately; WOFF2 is encoded on first download request. */
export async function buildExportBundle(ttf: Uint8Array): Promise<FontExportBundle> {
  const woff = await toWoff(ttf)
  return { ttf, woff, woff2: undefined }
}

export async function ensureWoff2(bundle: FontExportBundle): Promise<FontExportBundle> {
  if (bundle.woff2?.byteLength) return bundle
  const woff2 = await toWoff2(bundle.ttf)
  return { ...bundle, woff2 }
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([toArrayBuffer(bytes)], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function buildFontZip(
  bundle: FontExportBundle,
  family: string,
): Promise<Blob> {
  const ready = await ensureWoff2(bundle)
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const base = family.replace(/\s+/g, '')
  zip.file(`${base}.ttf`, ready.ttf)
  zip.file(`${base}.woff2`, ready.woff2!)
  zip.file(`${base}.woff`, ready.woff)
  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}