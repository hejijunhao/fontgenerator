export type AppRoute = 'studio' | 'how-it-works'

export function parseRoute(hash: string): AppRoute {
  const normalized = hash.replace(/^#/, '')
  if (normalized === '/how-it-works' || normalized === 'how-it-works') {
    return 'how-it-works'
  }
  return 'studio'
}

export function routeHref(route: AppRoute): string {
  return route === 'how-it-works' ? '#/how-it-works' : '#/'
}

export function routeLabel(route: AppRoute): string {
  return route === 'how-it-works' ? 'How it works' : 'Studio'
}