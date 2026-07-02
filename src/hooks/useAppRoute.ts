import { useEffect, useState } from 'react'
import {
  parseLegacyHash,
  parsePath,
  resolvePathRedirect,
  routeHref,
  type AppRoute,
} from '@/lib/navigation'

function readRoute(): AppRoute {
  if (typeof window === 'undefined') return 'landing'
  return parsePath(window.location.pathname)
}

function migrateLegacyHash() {
  const legacy = parseLegacyHash(window.location.hash)
  if (!legacy) return
  window.location.hash = ''
  const path = routeHref(legacy)
  if (window.location.pathname !== path) {
    window.history.replaceState(null, '', path)
  }
}

function syncRouteFromLocation(): AppRoute {
  migrateLegacyHash()
  const redirect = resolvePathRedirect(window.location.pathname)
  if (redirect && window.location.pathname !== redirect) {
    window.history.replaceState(null, '', redirect)
  }
  return readRoute()
}

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return 'landing'
    return syncRouteFromLocation()
  })

  useEffect(() => {
    const sync = () => setRoute(syncRouteFromLocation())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: route === 'how-it-works' ? 'smooth' : 'auto' })
  }, [route])

  return route
}