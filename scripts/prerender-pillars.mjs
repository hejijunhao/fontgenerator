/**
 * Post-build GEO pass: crawler snippets, JSON-LD, sitemap, and robots.txt.
 * Runs after `vite build` — no Playwright required.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGeoContent, testCountQuickAnswerBullet } from './lib/geoContent.mjs'
import { absoluteUrl, resolveSiteUrl } from './lib/siteUrl.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(root, '../dist')
const indexPath = path.join(distDir, 'index.html')

const geo = loadGeoContent()
const siteUrl = resolveSiteUrl()
const testCountBullet = testCountQuickAnswerBullet(geo)

const landingSnippet = `
<div id="glyphmill-prerender-landing" data-prerender="landing" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)" aria-hidden="true">
  <p class="prerender-title">Glyphmill — PNG letter images to installable fonts</p>
  <p>Glyphmill is a browser tool that converts PNG letter images into installable fonts.</p>
  <ol>
${geo.landingQuickAnswer.map((line) => `    <li>${line}</li>`).join('\n')}
  </ol>
</div>`

const faqHtml = geo.faq
  .map(
    (item) =>
      `<div class="prerender-faq"><p class="prerender-q">${item.q}</p><p class="prerender-a">${item.a}</p></div>`,
  )
  .join('\n  ')

const howItWorksSnippet = `
<div id="glyphmill-prerender-how-it-works" data-prerender="how-it-works" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)" aria-hidden="true">
  <p class="prerender-title">How Glyphmill turns PNG images into fonts</p>
  <p>How does Glyphmill turn PNG images into fonts? Glyphmill runs preprocess, Potrace trace, place, and opentype.js build in the browser. Agent mode adds parameter tuning and two human review gates.</p>
  <ol>
    <li>${geo.quickAnswer[0]}</li>
    <li>${geo.quickAnswer[1]}</li>
    <li>${geo.quickAnswer[2]}</li>
    <li>${testCountBullet}</li>
    <li>${geo.quickAnswer[3]}</li>
  </ol>
  ${faqHtml}
</div>`

function landingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Glyphmill',
        url: siteUrl,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Glyphmill',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'Glyphmill',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Browser-native tool that converts PNG letter images into installable TTF and WOFF2 fonts using client-side WASM.',
        url: absoluteUrl('/export'),
      },
    ],
  }
}

function howItWorksJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/how-it-works#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'How it works',
            item: absoluteUrl('/how-it-works'),
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/how-it-works#software`,
        name: 'Glyphmill',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Browser-native tool that converts PNG letter images into installable TTF and WOFF2 fonts using client-side WASM.',
        url: absoluteUrl('/export'),
      },
      {
        '@type': 'HowTo',
        '@id': `${siteUrl}/how-it-works#howto`,
        name: 'Convert PNG letter images to a font in Glyphmill',
        description:
          'Upload PNG glyphs to Export, run the browser pipeline, and download TTF or WOFF2.',
        step: geo.howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/how-it-works#faq`,
        mainEntity: geo.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}

function jsonLdScript(graph) {
  return `<script type="application/ld+json" data-prerender="jsonld">${JSON.stringify(graph)}</script>`
}

function injectBeforeClose(html, tag, snippet) {
  if (!snippet) return html
  if (html.includes(tag)) {
    return html.replace(tag, `${snippet}\n${tag}`)
  }
  return html + snippet
}

function writeSitemap() {
  const routes = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/how-it-works', changefreq: 'monthly', priority: '0.9' },
    { path: '/export', changefreq: 'weekly', priority: '0.9' },
    { path: '/generate', changefreq: 'monthly', priority: '0.5' },
  ]
  const lastmod = '2026-07-02'
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join('\n')

  writeFileSync(
    path.join(distDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  )
}

function writeRobots() {
  writeFileSync(
    path.join(distDir, 'robots.txt'),
    `# Glyphmill — allow search and AI discovery crawlers

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`,
  )
}

const viteHtml = readFileSync(indexPath, 'utf8')

let spaIndex = injectBeforeClose(
  viteHtml,
  '</head>',
  [jsonLdScript(landingJsonLd()), jsonLdScript(howItWorksJsonLd())].join('\n'),
)
spaIndex = injectBeforeClose(spaIndex, '</body>', landingSnippet)
spaIndex = injectBeforeClose(spaIndex, '</body>', howItWorksSnippet)
writeFileSync(indexPath, spaIndex)

// Path-specific shell for hosts that serve /how-it-works/index.html
const howDir = path.join(distDir, 'how-it-works')
mkdirSync(howDir, { recursive: true })
let howHtml = injectBeforeClose(viteHtml, '</head>', jsonLdScript(howItWorksJsonLd()))
howHtml = injectBeforeClose(howHtml, '</body>', howItWorksSnippet)
writeFileSync(path.join(howDir, 'index.html'), howHtml)

writeSitemap()
writeRobots()

console.log(`prerender-pillars: injected snippets + JSON-LD (${siteUrl})`)