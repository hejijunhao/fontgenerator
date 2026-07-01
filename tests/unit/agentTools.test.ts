import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createGlyphTools } from '@/agent/tools'

function loadFixtureBlob(): Blob {
  const buf = readFileSync(
    fileURLToPath(new URL('../fixtures/A-KaminoDeco.png', import.meta.url)),
  )
  return new Blob([buf], { type: 'image/png' })
}

describe('agent tools (node)', () => {
  it('preprocess tool stores bitmap context', async () => {
    const png = loadFixtureBlob()
    const steps: string[] = []
    const { tools, getContext } = createGlyphTools(png, {
      onStep: (s) => steps.push(s.tool),
    })

    await tools.preprocess.execute!(
      { threshold: 0.6, close: 1, invert: false },
      { toolCallId: 't1', messages: [] },
    )

    expect(steps).toEqual(['preprocess'])
    expect(getContext().preprocess?.bitmap.width).toBeGreaterThan(700)
    expect(tools.trace).toBeDefined()
    expect(tools.requestGate).toBeDefined()
  })
})