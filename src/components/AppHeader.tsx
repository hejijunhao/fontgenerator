import { AppNavLink } from '@/components/AppNavLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAppRoute } from '@/hooks/useAppRoute'
import { navigate, routeHref, type AppRoute } from '@/lib/navigation'

const TAGLINES: Partial<Record<AppRoute, string>> = {
  landing: 'PNG letter art in. Installable fonts out.',
  mill: 'Turn letter images into production-ready fonts — in your browser.',
}

export function AppHeader() {
  const route = useAppRoute()
  const tagline = TAGLINES[route]

  return (
    <header className="app-header sticky top-0 z-30 border-b border-border bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="app-header__primary flex h-12 items-center justify-between gap-4">
          <a
            href={routeHref('landing')}
            onClick={(e) => {
              e.preventDefault()
              navigate('landing')
            }}
            className="group flex min-w-0 items-center gap-3"
          >
            <GlyphMark />
            <span className="font-sans text-[0.8125rem] font-semibold tracking-[0.38em] text-ink transition-opacity group-hover:opacity-80">
              GLYPHMILL
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-2">
            <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
              <AppNavLink route="mill" active={route === 'mill'} />
              <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
              <AppNavLink route="foundry" active={route === 'foundry'} badge="Soon" muted />
            </nav>
            <ThemeToggle locked={route === 'mill'} />
          </div>
        </div>

        <p
          className="app-header__tagline mt-2 h-10 max-w-md overflow-hidden text-[0.9375rem] leading-5 text-muted line-clamp-2"
          aria-hidden={tagline == null}
        >
          {tagline ?? <span className="invisible select-none" aria-hidden>·</span>}
        </p>

        <nav
          aria-label="Primary mobile"
          className="app-header__mobile mt-2 flex h-10 flex-wrap items-center gap-1 sm:hidden"
        >
          <AppNavLink route="mill" active={route === 'mill'} />
          <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
          <AppNavLink route="foundry" active={route === 'foundry'} badge="Soon" muted />
        </nav>
      </div>
    </header>
  )
}

function GlyphMark() {
  return (
    <div
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-strong"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink">
        <path
          d="M7 1.5 3 12.5h2l.8-2.2h4.4L11 12.5h2L9 1.5H7zm-.8 5.2 1.6-4.4 1.6 4.4H6.2z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}