export type FontCoverageReport = {
  present: string[]
  missingUppercase: string[]
  missingDigits: string[]
  hasSpace: boolean
  glyphCount: number
  warnings: string[]
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'

export function analyzeFontCoverage(codepoints: number[]): FontCoverageReport {
  const chars = new Set(codepoints.map((cp) => String.fromCodePoint(cp)))
  const present = [...chars].sort()

  const missingUppercase = [...UPPERCASE].filter((c) => !chars.has(c))
  const missingDigits = [...DIGITS].filter((c) => !chars.has(c))
  const hasSpace = chars.has(' ')

  const warnings: string[] = []

  if (glyphCount(codepoints) === 0) {
    warnings.push('No glyphs in font yet.')
  } else if (missingUppercase.length > 0 && missingUppercase.length < UPPERCASE.length) {
    warnings.push(
      `Partial uppercase set — missing ${missingUppercase.length} letter${missingUppercase.length === 1 ? '' : 's'} (${formatRange(missingUppercase)}).`,
    )
  } else if (missingUppercase.length === UPPERCASE.length && glyphCount(codepoints) > 0) {
    warnings.push('No uppercase A–Z coverage — fine for a logo font, but not a full alphabet.')
  }

  if (!hasSpace && glyphCount(codepoints) > 1) {
    warnings.push('No explicit space glyph — a synthetic space is added at build time.')
  }

  if (missingDigits.length < DIGITS.length && missingDigits.length > 0) {
    warnings.push(`No digits (${formatRange(missingDigits)}).`)
  }

  return {
    present,
    missingUppercase,
    missingDigits,
    hasSpace,
    glyphCount: glyphCount(codepoints),
    warnings,
  }
}

function glyphCount(codepoints: number[]): number {
  return new Set(codepoints).size
}

function formatRange(chars: string[]): string {
  if (chars.length <= 8) return chars.join('')
  return `${chars.slice(0, 6).join('')}…`
}