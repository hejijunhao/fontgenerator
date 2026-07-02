import { useTheme } from '@/hooks/useTheme'

type ThemeToggleProps = {
  /** Mill console uses a fixed dark surface — show a reserved, non-interactive control. */
  locked?: boolean
}

export function ThemeToggle({ locked = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  if (locked) {
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-strong text-subtle"
        title="Mill console uses a fixed dark theme"
        aria-label="Theme locked — Mill console uses a fixed dark theme"
      >
        <LockIcon />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-strong text-ink transition-colors hover:bg-surface-hover"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6.2 2.4a5.6 5.6 0 1 0 7.4 7.4A4.8 4.8 0 1 1 6.2 2.4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}