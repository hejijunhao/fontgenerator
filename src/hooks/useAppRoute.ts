import { useEffect, useState } from 'react'
import { parseRoute, type AppRoute } from '@/lib/navigation'

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseRoute(typeof window !== 'undefined' ? window.location.hash : ''),
  )

  useEffect(() => {
    const sync = () => setRoute(parseRoute(window.location.hash))
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: route === 'how-it-works' ? 'smooth' : 'auto' })
  }, [route])

  return route
}