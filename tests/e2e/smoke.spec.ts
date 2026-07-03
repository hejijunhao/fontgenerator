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
    await page.getByRole('link', { name: 'Try with sample letter A' }).first().click()
    await expect(page).toHaveURL(/\/mill$/)
    await expect(page.getByLabel('Drop PNG glyph images here')).toBeVisible()
  })

  test('landing has distinct section chapters', async ({ page }) => {
    await page.goto('/')

    for (const id of ['hero', 'proof', 'chambers', 'compare', 'steps', 'cta']) {
      await expect(page.locator(`#${id}`)).toBeVisible()
    }

    await expect(page.locator('.hero')).toBeVisible()
    await expect(page.locator('#compare .grid-2-plus-1')).toBeVisible()
    await expect(page.getByRole('link', { name: 'See full comparison table →' })).toBeVisible()
    await expect(page.locator('details summary', { hasText: 'Quick answers' })).toBeVisible()
  })

  test('mill collapses inactive stage bays', async ({ page }) => {
    await page.goto('/mill')
    await page.getByLabel('Drop PNG glyph images here').click()
    await page.locator('input[type="file"]').setInputFiles(fixturePng)

    await expect(page.getByRole('button', { name: 'Generate (no agent)' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Expand SOURCE/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Expand EXPORT/i })).toBeVisible()
  })

  test('no-agent upload → generate → TTF download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })

    await page.goto('/mill')
    await page.getByLabel('Drop PNG glyph images here').click()
    await page.locator('input[type="file"]').setInputFiles(fixturePng)

    await expect(page.getByRole('button', { name: /1 PNG loaded/i })).toBeVisible()
    await page.getByRole('button', { name: 'Generate (no agent)' }).click()
    await expect(page.getByRole('button', { name: /KaminoDeco\.ttf/ })).toBeVisible({
      timeout: 60_000,
    })

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

  test('header height stable across routes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    const paths = ['/', '/foundry', '/mill', '/how-it-works'] as const
    const heights: number[] = []

    for (const path of paths) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')
      const box = await page.locator('header.app-header').boundingBox()
      expect(box).not.toBeNull()
      heights.push(box!.height)
    }

    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2)
  })

  test('foundry placeholder → Mill CTA', async ({ page }) => {
    await page.goto('/foundry')
    await expect(page.locator('.announce')).toContainText('Not available')
    await expect(page.locator('.announce')).toContainText('Mill is live today')
    await expect(
      page.locator('main h1', {
        hasText: /Foundry — agentic glyph creation/i,
      }),
    ).toBeVisible()
    await expect(page.locator('.card-inert').first()).toBeVisible()
    await page.getByRole('link', { name: 'Use the Mill today' }).first().click()
    await expect(page).toHaveURL(/\/mill$/)
    await expect(page.getByLabel('Drop PNG glyph images here')).toBeVisible()
  })

  test('primary nav prioritizes Mill and de-emphasizes Foundry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: 'Primary' })
    const links = nav.getByRole('link')
    await expect(links.nth(0)).toHaveText(/Mill/)
    await expect(links.nth(2)).toHaveText(/Foundry/)
    await expect(links.nth(2)).toHaveClass(/nav-link--muted/)
  })

  test('mill has working theme toggle', async ({ page }) => {
    await page.goto('/mill')

    const toggle = page.getByRole('button', { name: /Switch to (light|dark) mode/ })
    await expect(toggle).toBeVisible()
    await expect(toggle).toBeEnabled()
  })

  test('mill primary bays use VOID card styling', async ({ page }) => {
    await page.goto('/mill')

    const bay = page.locator('.stage-bay').first()
    await expect(bay).toBeVisible()

    const radius = await bay.evaluate((el) => getComputedStyle(el).borderRadius)
    expect(parseFloat(radius)).toBeGreaterThanOrEqual(12)
  })
})