import { parse as parseFont } from 'opentype.js'
import { toArrayBuffer } from '@/lib/buffer'
import type { ValidationResult } from '@/types/pipeline'

function isWoff2(bytes: Uint8Array): boolean {
  return (
    bytes.length > 4 &&
    bytes[0] === 0x77 &&
    bytes[1] === 0x4f &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x32
  )
}

export function validate(fontBytes: Uint8Array): ValidationResult {
  const warnings: string[] = []
  let roundTripOk = false

  if (isWoff2(fontBytes)) {
    return {
      otsOk: false,
      roundTripOk: fontBytes.byteLength > 48,
      warnings: ['WOFF2 validated by signature and size; full parse requires decompress'],
    }
  }

  try {
    const font = parseFont(toArrayBuffer(fontBytes))
    roundTripOk = font.glyphs.length >= 2
    const validationWarnings = font.validate?.() ?? []
    warnings.push(...validationWarnings)
  } catch (err) {
    warnings.push(err instanceof Error ? err.message : 'Round-trip parse failed')
  }

  return {
    otsOk: false,
    roundTripOk,
    warnings,
  }
}