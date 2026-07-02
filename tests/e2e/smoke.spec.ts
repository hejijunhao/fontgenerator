import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const fixturePng = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/A-KaminoDeco.png',
)

test.describe('font generator smoke', () => {
  test('no-agent upload → generate → TTF download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })

    await page.goto('/')
    await page.getByLabel('Drop PNG glyph images here').click()
    await page.locator('input[type="file"]').setInputFiles(fixturePng)

    await expect(page.getByText('1 PNG ready')).toBeVisible()
    await page.getByRole('button', { name: 'Generate (no agent)' }).click()
    await expect(page.getByRole('button', { name: /KaminoDeco\.ttf/ })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByText('✓ Round-trip parse')).toBeVisible()

    await page.getByRole('button', { name: /KaminoDeco\.ttf/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/KaminoDeco\.ttf$/)
  })

  test('gate panels accept flow (scripted, no model)', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Drop PNG glyph images here').click()
    await page.locator('input[type="file"]').setInputFiles(fixturePng)

    await page.waitForFunction(() => window.__FONTGEN_E2E__?.useProjectStore)

    await page.evaluate(async () => {
      const store = window.__FONTGEN_E2E__!.useProjectStore
      const glyph = store.getState().glyphs[0]
      if (!glyph) throw new Error('missing glyph')

      const tracePreview =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

      store.setState({
        isAgentRunning: true,
        gateHandlers: {
          accept: () => {},
          retrace: () => {},
          fixCharacter: () => {},
          adjust: () => {},
        },
        glyphs: [
          {
            ...glyph,
            status: 'gate1',
            gate: {
              stage: 'trace',
              summary: 'Review the traced vector before building.',
              tracePreviewPng: tracePreview,
              proposedCharacter: 'A',
            },
          },
        ],
      })
    })

    await expect(page.getByLabel('Gate 1 — trace review')).toBeVisible()
    await page.getByRole('button', { name: 'Accept trace' }).click()

    await page.evaluate(async () => {
      const store = window.__FONTGEN_E2E__!.useProjectStore
      const glyph = store.getState().glyphs[0]
      if (!glyph) throw new Error('missing glyph')

      const renderPreview =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

      store.setState({
        glyphs: [
          {
            ...glyph,
            status: 'gate2',
            gate: {
              stage: 'font',
              summary: 'Review the built font render.',
              renderPreviewPng: renderPreview,
              proposedCharacter: 'A',
              validation: { roundTripOk: true, otsOk: false, warnings: [] },
            },
          },
        ],
      })
    })

    await expect(page.getByLabel('Gate 2 — font review')).toBeVisible()
    await page.getByRole('button', { name: 'Accept & export' }).click()
  })
})