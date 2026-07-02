const DEFAULT_SITE_URL = 'https://glyphmill.vercel.app'

/** Canonical origin for build-time GEO files (sitemap, robots, prerender JSON-LD). */
export function resolveSiteUrl() {
  const fromEnv = process.env.VITE_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  return DEFAULT_SITE_URL
}

export function absoluteUrl(path) {
  return `${resolveSiteUrl()}${path}`
}