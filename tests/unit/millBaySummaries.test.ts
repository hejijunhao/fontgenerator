import { describe, expect, it } from 'vitest'
import {
  buildBaySummary,
  exportBaySummary,
  reviewBaySummary,
  sourceBaySummary,
} from '@/lib/millBaySummaries'

const base = {
  glyphsLength: 1,
  isGenerating: false,
  isAgentRunning: false,
  isReplaying: false,
  hasOutput: false,
  hasPreview: false,
  family: 'KaminoDeco',
  atGate: false,
}

describe('millBaySummaries', () => {
  it('source summary reflects upload state', () => {
    expect(sourceBaySummary({ ...base, glyphsLength: 0 })).toMatch(/Awaiting PNG/)
    expect(sourceBaySummary({ ...base, glyphsLength: 2 })).toMatch(/2 PNGs loaded/)
  })

  it('build summary reflects pipeline state', () => {
    expect(buildBaySummary({ ...base, isGenerating: true })).toMatch(/Generating/)
    expect(buildBaySummary({ ...base, atGate: true })).toMatch(/gate/)
  })

  it('review summary reflects gate and preview', () => {
    expect(reviewBaySummary({ ...base, atGate: true })).toMatch(/gate/)
    expect(reviewBaySummary({ ...base, hasPreview: true })).toMatch(/Preview/)
  })

  it('export summary reflects output', () => {
    expect(exportBaySummary(base)).toMatch(/Build a font/)
    expect(exportBaySummary({ ...base, hasOutput: true })).toMatch(/KaminoDeco/)
  })
})