export type AppRoute = 'landing' | 'generate' | 'export' | 'how-it-works'

const ROUTE_PATHS: Record<AppRoute, string> = {
  landing: '/',
  generate: '/generate',
  export: '/export',
  'how-it-works': '/how-it-works',
}

const PATH_TO_ROUTE = new Map<string, AppRoute>(
  Object.entries(ROUTE_PATHS).map(([route, path]) => [path, route as AppRoute]),
)

/** Normalize pathname; unknown paths map to landing. */
export function parsePath(pathname: string): AppRoute {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return PATH_TO_ROUTE.get(normalized) ?? 'landing'
}

/** Legacy v0.x paths that should redirect to a canonical route. */
const LEGACY_PATH_REDIRECTS: Record<string, AppRoute> = {
  '/studio': 'export',
  '/mill': 'export',
  '/foundry': 'generate',
}

/**
 * Canonical path when the current URL should be replaced — legacy aliases and soft 404s.
 * Returns null when the pathname already maps to a known route.
 */
export function resolvePathRedirect(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const legacy = LEGACY_PATH_REDIRECTS[normalized]
  if (legacy) return routeHref(legacy)
  if (!PATH_TO_ROUTE.has(normalized)) return routeHref('landing')
  return null
}

/** Legacy hash URLs from v0.2.x (#/, #/how-it-works). Empty hash is not legacy. */
export function parseLegacyHash(hash: string): AppRoute | null {
  if (!hash.startsWith('#')) return null
  const stripped = hash.slice(1)
  if (stripped === '' || stripped === '/') return 'export'
  if (stripped === '/how-it-works' || stripped === 'how-it-works') return 'how-it-works'
  return null
}

export function routeHref(route: AppRoute): string {
  return ROUTE_PATHS[route]
}

export function routeLabel(route: AppRoute): string {
  switch (route) {
    case 'landing':
      return 'Home'
    case 'generate':
      return 'Generate'
    case 'export':
      return 'Export'
    case 'how-it-works':
      return 'How it works'
  }
}

export function isInternalHref(href: string): boolean {
  if (!href.startsWith('/')) return false
  if (href.startsWith('//')) return false
  return true
}

export function navigate(route: AppRoute, options?: { replace?: boolean }) {
  const path = routeHref(route)
  if (window.location.pathname === path) return
  if (options?.replace) {
    window.history.replaceState(null, '', path)
  } else {
    window.history.pushState(null, '', path)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}