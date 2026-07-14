/** Shared GEO pillar content — visible page and JSON-LD must use these exact strings. */

import geoContent from '@/lib/geoPrerenderContent.json'

export const HOW_IT_WORKS_LAST_UPDATED = 'July 2026'
export const HOW_IT_WORKS_MODIFIED_ISO = '2026-07-02'

export const TEST_COUNTS = geoContent.testCounts
export const TEST_COUNT_TOTAL = TEST_COUNTS.unitBrowser + TEST_COUNTS.e2e

export const TEST_COUNT_QUICK_ANSWER = `${TEST_COUNT_TOTAL} automated tests (${TEST_COUNTS.unitBrowser} unit and browser, ${TEST_COUNTS.e2e} end-to-end) validate the pipeline on the reference glyph A-KaminoDeco.png.`

export const TEST_COUNT_METHODOLOGY = `${TEST_COUNT_TOTAL} automated tests — unit, browser, and end-to-end — exercise preprocess, full pipeline, recipe replay, export, and gate flows.`

export const QUICK_ANSWER = [
  geoContent.quickAnswer[0],
  geoContent.quickAnswer[1],
  geoContent.quickAnswer[2],
  TEST_COUNT_QUICK_ANSWER,
  geoContent.quickAnswer[3],
] as const

export const PIPELINE_STAGES = [
  {
    step: '01',
    question: 'What happens during preprocessing?',
    body: 'Your PNG becomes a bilevel bitmap — ink versus background. Glyphmill applies a luminance threshold, optional morphological close, and invert when cream backgrounds need it instead of alpha.',
    detail: 'Cream backgrounds need luminance thresholding, not alpha alone.',
  },
  {
    step: '02',
    question: 'How does Potrace tracing work?',
    body: 'Potrace WASM follows bitmap edges and outputs SVG path data — the same family of algorithm desktop tools have used since the 1990s. Vectors are computed from pixels, not imagined by a model.',
    detail: 'Trace parameters such as turdsize and opttolerance are recorded in recipes.',
  },
  {
    step: '03',
    question: 'How are glyphs placed on the baseline?',
    body: 'Paths land in font coordinate space with baseline fraction, side bearings, units-per-em, and the correct Unicode codepoint. Winding rules fix hole direction so counters stay open.',
    detail: 'Baseline placement is numeric — small shifts are visible in renders.',
  },
  {
    step: '04',
    question: 'How is the TTF assembled?',
    body: 'opentype.js assembles a real TTF with glyf outlines, hmtx, head, and name tables. You get installable font files, not a preview mockup.',
    detail: 'Round-trip parse validation runs before export.',
  },
  {
    step: '05',
    question: 'What happens during export?',
    body: 'Glyphmill writes TTF as the master outline font, compresses WOFF2 for the web, and can bundle a zip. A sample glyph render is checked before download.',
    detail: 'Structural checks include round-trip parse and basic sanity gates.',
  },
] as const

export const THREE_PATH_ROWS = [
  ['Generate (no agent)', 'Free', 'None', 'Seconds per glyph; batch-friendly'],
  ['Run agent', 'OpenRouter usage', 'Hosted or BYO key', 'Minutes per glyph with two human gates'],
  ['Replay recipe', 'Free', 'None', 'Seconds; deterministic; zero model calls'],
] as const

export const FONTFORGE_ROWS = [
  ['Runs in browser', 'Yes — WASM pipeline', 'Desktop install'],
  ['PNG batch upload', 'Yes — Export SOURCE bay', 'Manual per glyph'],
  ['Agent parameter tuning', 'Optional — BUILD bay', 'Manual sliders'],
  ['Recipe replay', 'Yes — pinned JSON preset', 'Manual presets'],
  ['Privacy', 'Conversion stays local', 'Local desktop'],
] as const

export const HOW_TO_STEPS = geoContent.howToSteps

export const FAQ = geoContent.faq