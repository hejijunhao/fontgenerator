import { AppNavLink } from '@/components/AppNavLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAppRoute } from '@/hooks/useAppRoute'
import { navigate, routeHref } from '@/lib/navigation'

export function AppHeader() {
  const route = useAppRoute()

  return (
    <header className="app-header nav">
      <div className="nav-inner">
        <a
          href={routeHref('landing')}
          onClick={(e) => {
            e.preventDefault()
            navigate('landing')
          }}
          className="nav-logo"
          aria-label="Glyphmill home"
        >
          <GlyphMark />
          GLYPHMILL
        </a>

        <div className="flex shrink-0 items-center gap-2">
          <nav aria-label="Primary" className="nav-links">
            <AppNavLink route="mill" active={route === 'mill'} />
            <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
            <AppNavLink route="foundry" active={route === 'foundry'} badge="Soon" muted />
          </nav>
          <ThemeToggle />
        </div>
      </div>

      <nav aria-label="Primary mobile" className="nav-mobile">
        <AppNavLink route="mill" active={route === 'mill'} />
        <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
        <AppNavLink route="foundry" active={route === 'foundry'} badge="Soon" muted />
      </nav>
    </header>
  )
}

function GlyphMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="24"
        height="24"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <circle cx="13" cy="13" r="5" stroke="var(--color-primary)" strokeWidth="1.5" />
      <circle cx="13" cy="13" r="1.5" fill="var(--color-primary)" />
      <line
        x1="13"
        y1="7.5"
        x2="13"
        y2="4.5"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="13"
        y1="21.5"
        x2="13"
        y2="18.5"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      <line
        x1="4.5"
        y1="13"
        x2="7.5"
        y2="13"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      <line
        x1="18.5"
        y1="13"
        x2="21.5"
        y2="13"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      <path
        d="M13 9.5 11.2 14.5h1.1l.35-.95h2.7l.35.95H16.8L15 9.5h-2zm-.55 2.6.8-2.2h.5l.8 2.2h-2.1z"
        fill="var(--color-primary)"
      />
    </svg>
  )
}