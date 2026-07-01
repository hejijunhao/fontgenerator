import { Buffer } from 'buffer'

let woff2Ready: Promise<(buf: Uint8Array) => Promise<Uint8Array>> | null = null

async function loadWoff2Compress(): Promise<(buf: Uint8Array) => Promise<Uint8Array>> {
  if (!woff2Ready) {
    woff2Ready = import('wawoff2').then((mod) => {
      const compress = (mod as { default?: { compress: (b: Buffer) => Promise<Buffer> }; compress?: (b: Buffer) => Promise<Buffer> }).compress
        ?? (mod as { default: { compress: (b: Buffer) => Promise<Buffer> } }).default?.compress
      if (!compress) throw new Error('wawoff2 compress not found')
      return async (bytes: Uint8Array) => {
        const out = await compress(Buffer.from(bytes))
        return new Uint8Array(out)
      }
    })
  }
  return woff2Ready
}

export async function toWoff2(ttf: Uint8Array): Promise<Uint8Array> {
  const compress = await loadWoff2Compress()
  return compress(ttf)
}

/** WOFF1 not required for Phase 2 exit; stub returns TTF bytes until a WASM encoder lands. */
export async function toWoff(ttf: Uint8Array): Promise<Uint8Array> {
  return ttf
}