import { useEffect } from 'react'
import { FAQ, HOW_TO_STEPS } from '@/lib/howItWorksContent'
import type { AppRoute } from '@/lib/navigation'
import { absoluteUrl, siteUrl } from '@/lib/pageMeta'

const JSON_LD_ID = 'glyphmill-jsonld'

function landingGraph() {
  const origin = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'Glyphmill',
        url: origin,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: 'Glyphmill',
        publisher: { '@id': `${origin}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${origin}/#software`,
        name: 'Glyphmill',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Browser-native tool that converts PNG letter images into installable TTF and WOFF2 fonts using client-side WASM.',
        url: absoluteUrl('/mill'),
      },
    ],
  }
}

function howItWorksGraph() {
  const origin = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${origin}/how-it-works#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: origin,
          },
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
        '@id': `${origin}/how-it-works#software`,
        name: 'Glyphmill',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Browser-native tool that converts PNG letter images into installable TTF and WOFF2 fonts using client-side WASM.',
        url: absoluteUrl('/mill'),
      },
      {
        '@type': 'HowTo',
        '@id': `${origin}/how-it-works#howto`,
        name: 'Convert PNG letter images to a font in Glyphmill',
        description:
          'Upload PNG glyphs to the Mill, run the browser pipeline, and download TTF or WOFF2.',
        step: HOW_TO_STEPS.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${origin}/how-it-works#faq`,
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  }
}

export function JsonLd({ route }: { route: AppRoute }) {
  useEffect(() => {
    const existing = document.getElementById(JSON_LD_ID)
    if (existing) existing.remove()

    const graph =
      route === 'landing' ? landingGraph() : route === 'how-it-works' ? howItWorksGraph() : null

    if (!graph) return

    const script = document.createElement('script')
    script.id = JSON_LD_ID
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(graph)
    document.head.appendChild(script)

    return () => {
      document.getElementById(JSON_LD_ID)?.remove()
    }
  }, [route])

  return null
}