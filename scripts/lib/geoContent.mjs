import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

let cached

export function loadGeoContent() {
  if (cached) return cached
  const jsonPath = path.join(root, '../../src/lib/geoPrerenderContent.json')
  cached = JSON.parse(readFileSync(jsonPath, 'utf8'))
  return cached
}

export function testCountQuickAnswerBullet(content) {
  const { unitBrowser, e2e } = content.testCounts
  const total = unitBrowser + e2e
  return `${total} automated tests (${unitBrowser} unit and browser, ${e2e} end-to-end) validate the pipeline on the reference glyph A-KaminoDeco.png.`
}