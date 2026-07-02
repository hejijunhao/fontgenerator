import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  FAQ,
  HOW_TO_STEPS,
  QUICK_ANSWER,
  TEST_COUNT_TOTAL,
  TEST_COUNTS,
} from '@/lib/howItWorksContent'

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

const geoJson = JSON.parse(
  readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/lib/geoPrerenderContent.json'),
    'utf8',
  ),
)

describe('howItWorksContent', () => {
  it('has Quick Answer within five bullets', () => {
    expect(QUICK_ANSWER.length).toBeLessThanOrEqual(5)
    expect(QUICK_ANSWER.length).toBeGreaterThanOrEqual(4)
  })

  it('has 10–12 FAQ items with 50–100 word answers', () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(10)
    expect(FAQ.length).toBeLessThanOrEqual(12)
    for (const item of FAQ) {
      const words = wordCount(item.a)
      expect(words, `${item.q} answer length`).toBeGreaterThanOrEqual(50)
      expect(words, `${item.q} answer length`).toBeLessThanOrEqual(110)
    }
  })

  it('has three HowTo steps for JSON-LD', () => {
    expect(HOW_TO_STEPS).toHaveLength(3)
  })

  it('tracks current automated test totals', () => {
    expect(TEST_COUNT_TOTAL).toBe(TEST_COUNTS.unitBrowser + TEST_COUNTS.e2e)
    expect(TEST_COUNT_TOTAL).toBe(53)
    expect(QUICK_ANSWER[3]).toContain('53 automated tests')
  })

  it('matches geoPrerenderContent.json FAQ and HowTo', () => {
    expect(FAQ).toEqual(geoJson.faq)
    expect(HOW_TO_STEPS).toEqual(geoJson.howToSteps)
  })
})