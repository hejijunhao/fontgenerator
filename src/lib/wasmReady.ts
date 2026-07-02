import { useEffect, useState } from 'react'

let warmupPromise: Promise<void> | null = null

/** Preload potrace-wasm and wawoff2 (~1.2 MB combined on first run). */
export function warmupWasm(): Promise<void> {
  if (!warmupPromise) {
    warmupPromise = Promise.all([import('potrace-wasm'), import('wawoff2')]).then(() => undefined)
  }
  return warmupPromise
}

export function useWasmWarmup(): { ready: boolean; warming: boolean } {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    warmupWasm().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { ready, warming: !ready }
}