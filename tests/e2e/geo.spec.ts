import { expect, test } from '@playwright/test'

test.describe('GEO pillar', () => {
  test('static discovery files return 200', async ({ request }) => {
    for (const path of ['/robots.txt', '/llms.txt', '/sitemap.xml']) {
      const res = await request.get(path)
      expect(res.ok(), `${path} should return 200`).toBeTruthy()
    }
  })

  test('llms.txt lists Foundry under Deferred', async ({ request }) => {
    const text = await (await request.get('/llms.txt')).text()
    expect(text).toContain('## Deferred')
    expect(text).toContain('/foundry')
  })

  test('prerendered how-it-works HTML contains FAQ answer and JSON-LD', async ({ request }) => {
    const res = await request.get('/how-it-works')
    const html = await res.text()
    expect(html).toContain('How do I make a font from images without FontForge?')
    expect(html).toContain('Potrace WASM')
    expect(html).toContain('"@type":"FAQPage"')
    expect(html).toContain('53 automated tests')
  })

  test('how-it-works page has single h1 and comparison tables', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(
      page.locator('main h1', {
        hasText: /How does Glyphmill turn PNG images into fonts/i,
      }),
    ).toBeVisible()
    await expect(page.getByText('Last updated: July 2026')).toBeVisible()
    await expect(page.locator('main table')).toHaveCount(1)
    await expect(page.locator('main .table-wrap')).toBeVisible()
    await expect(page.locator('main .grid-2-plus-1')).toBeVisible()
    await expect(
      page.locator('main').getByText(/53 automated tests — unit, browser, and end-to-end/),
    ).toBeVisible()
  })

  test('per-route og:image meta on client nav', async ({ page }) => {
    const cases = [
      { path: '/', image: '/og/landing.png' },
      { path: '/mill', image: '/og/mill.png' },
      { path: '/how-it-works', image: '/og/how-it-works.png' },
      { path: '/foundry', image: '/og/foundry.png' },
    ] as const

    for (const { path, image } of cases) {
      await page.goto(path)
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        new RegExp(`${image.replace('.', '\\.')}$`),
      )
    }

    await page.goto('/how-it-works')
    await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute(
      'content',
      '2026-07-02',
    )
  })

  test('OG images are served at 1200×630 paths', async ({ request }) => {
    for (const path of ['/og/landing.png', '/og/how-it-works.png', '/og/mill.png', '/og/foundry.png']) {
      const res = await request.get(path)
      expect(res.ok(), `${path} should return 200`).toBeTruthy()
      expect(res.headers()['content-type']).toMatch(/image\/png/)
    }
  })

  test('legacy /studio redirects to /mill', async ({ page }) => {
    await page.goto('/studio')
    await expect(page).toHaveURL(/\/mill$/)
    await expect(page.getByLabel('Drop PNG glyph images here')).toBeVisible()
  })

  test('unknown paths redirect to landing', async ({ page }) => {
    await page.goto('/not-a-real-page')
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.locator('main h1', {
        hasText: /Glyphmill is a browser tool that converts PNG letter images/i,
      }),
    ).toBeVisible()
  })
})