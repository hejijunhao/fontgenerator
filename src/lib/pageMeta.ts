import type { AppRoute } from '@/lib/navigation'

export type PageMeta = {
  title: string
  description: string
  ogType: 'website' | 'article'
  path: string
  ogImage: string
  modifiedTime?: string
}

const DEFAULT_SITE_URL = 'https://glyphmill.vercel.app'

export function siteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return DEFAULT_SITE_URL
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`
}

const PAGE_META: Record<AppRoute, PageMeta> = {
  landing: {
    title: 'Glyphmill — PNG letter images to installable fonts',
    description:
      'Turn PNG letter art into TTF and WOFF2 fonts in your browser. WASM conversion runs locally; optional AI agent tunes trace parameters. No accounts.',
    ogType: 'website',
    path: '/',
    ogImage: '/og/landing.png',
  },
  generate: {
    title: 'Generate — agentic glyph creation (coming soon)',
    description:
      'Glyphmill Generate will let you sketch letterforms with an agent before milling them into fonts. Use Export today for PNG-to-font conversion.',
    ogType: 'website',
    path: '/generate',
    ogImage: '/og/generate.png',
  },
  export: {
    title: 'Export — convert PNG glyphs to TTF / WOFF2',
    description:
      'Upload PNG letter images, run the browser font pipeline, and download TTF, WOFF2, or a zip. Build free with a pinned recipe or use the optional agent.',
    ogType: 'website',
    path: '/export',
    ogImage: '/og/export.png',
  },
  'how-it-works': {
    title: 'How Glyphmill turns PNG images into fonts',
    description:
      'Browser-native preprocess, Potrace trace, and opentype.js build — with optional Claude agent parameter tuning, human gates, and recipe replay.',
    ogType: 'article',
    path: '/how-it-works',
    ogImage: '/og/how-it-works.png',
    modifiedTime: '2026-07-02',
  },
}

export function metaForRoute(route: AppRoute): PageMeta {
  return PAGE_META[route]
}