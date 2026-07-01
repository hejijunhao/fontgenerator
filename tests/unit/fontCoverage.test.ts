import { describe, expect, it } from 'vitest'
import { analyzeFontCoverage } from '@/lib/fontCoverage'

describe('analyzeFontCoverage', () => {
  it('warns on partial uppercase sets', () => {
    const report = analyzeFontCoverage([0x41, 0x42])
    expect(report.present).toEqual(['A', 'B'])
    expect(report.missingUppercase).toHaveLength(24)
    expect(report.warnings.some((w) => w.includes('Partial uppercase'))).toBe(true)
  })

  it('notes missing space for multi-glyph fonts', () => {
    const report = analyzeFontCoverage([0x41, 0x42])
    expect(report.hasSpace).toBe(false)
    expect(report.warnings.some((w) => w.includes('space'))).toBe(true)
  })

  it('returns no warnings for full A–Z', () => {
    const codepoints = Array.from({ length: 26 }, (_, i) => 0x41 + i)
    const report = analyzeFontCoverage(codepoints)
    expect(report.missingUppercase).toHaveLength(0)
    expect(report.warnings.filter((w) => w.includes('Partial uppercase'))).toHaveLength(0)
  })
})