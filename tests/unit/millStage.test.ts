import { describe, expect, it } from 'vitest'
import { deriveMillStage } from '@/lib/millStage'

describe('deriveMillStage', () => {
  it('returns source when no glyphs', () => {
    expect(
      deriveMillStage({
        glyphsLength: 0,
        isGenerating: false,
        isAgentRunning: false,
        isReplaying: false,
        hasOutput: false,
        hasPreview: false,
      }),
    ).toBe('source')
  })

  it('returns build while generating', () => {
    expect(
      deriveMillStage({
        glyphsLength: 1,
        glyphStatus: 'running',
        isGenerating: true,
        isAgentRunning: false,
        isReplaying: false,
        hasOutput: false,
        hasPreview: false,
      }),
    ).toBe('build')
  })

  it('returns review at gate', () => {
    expect(
      deriveMillStage({
        glyphsLength: 1,
        glyphStatus: 'gate1',
        isGenerating: false,
        isAgentRunning: true,
        isReplaying: false,
        hasOutput: false,
        hasPreview: false,
      }),
    ).toBe('review')
  })

  it('returns export when done with output', () => {
    expect(
      deriveMillStage({
        glyphsLength: 1,
        glyphStatus: 'done',
        isGenerating: false,
        isAgentRunning: false,
        isReplaying: false,
        hasOutput: true,
        hasPreview: true,
      }),
    ).toBe('export')
  })
})