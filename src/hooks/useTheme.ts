import { useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  resolveTheme,
  type Theme,
} from '@/lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(getStoredTheme()))

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (getStoredTheme() != null) return
      const next = media.matches ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  function setMode(next: Theme) {
    applyTheme(next)
    persistTheme(next)
    setTheme(next)
  }

  function toggle() {
    setMode(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, setMode, toggle, isDark: theme === 'dark' }
}