export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'glyphmill-theme'

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(stored: Theme | null): Theme {
  return stored ?? getSystemTheme()
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* private browsing */
  }
}

/** Run before React paint to avoid theme flash. */
export function initTheme() {
  applyTheme(resolveTheme(getStoredTheme()))
}

export function toggleTheme(current: Theme): Theme {
  const next = current === 'light' ? 'dark' : 'light'
  applyTheme(next)
  persistTheme(next)
  return next
}