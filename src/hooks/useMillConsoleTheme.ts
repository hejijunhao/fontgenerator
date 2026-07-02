import { useEffect } from 'react'
import type { AppRoute } from '@/lib/navigation'
import { applyTheme, getStoredTheme, resolveTheme } from '@/lib/theme'

/** Force dark theme on Mill; restore user preference when leaving. */
export function useMillConsoleTheme(route: AppRoute) {
  useEffect(() => {
    if (route !== 'mill') return

    document.documentElement.classList.add('dark')

    return () => {
      applyTheme(resolveTheme(getStoredTheme()))
    }
  }, [route])
}