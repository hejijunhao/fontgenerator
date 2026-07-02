import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const fixturePng = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/A-KaminoDeco.png',
)

test.describe('font generator smoke', () => {
  test('landing → Mill navigation', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.locator('main h1', {
        hasText: /Glyphmill is a browser tool that converts PNG letter images/i,
      }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Open Mill' }).first().click()
    await expect(page).toHaveURL(/\/mill$/)
    await expect(page.getByLabel('Drop PNG glyph images here')).toBeVisible()
  })

  test('no-agent upload → generate → TTF download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })

    await page.goto('/mill')
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
    await page.goto('/mill')
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

  test('prerendered landing HTML contains Quick Answer', async ({ request }) => {
    const res = await request.get('/')
    const html = await res.text()
    expect(html).toContain('Glyphmill converts PNG letter images into installable TTF and WOFF2 fonts')
  })

  test('foundry placeholder → Mill CTA', async ({ page }) => {
    await page.goto('/foundry')
    await expect(
      page.locator('main h1', {
        hasText: /Foundry — agentic glyph creation/i,
      }),
    ).toBeVisible()
    await expect(page.locator('.inert-frame').first()).toBeVisible()
    await page.getByRole('link', { name: 'Use the Mill today' }).first().click()
    await expect(page).toHaveURL(/\/mill$/)
    await expect(page.getByLabel('Drop PNG glyph images here')).toBeVisible()
  })
})