import { routeHref, routeLabel, type AppRoute } from '@/lib/navigation'

type AppNavLinkProps = {
  route: AppRoute
  active: boolean
}

export function AppNavLink({ route, active }: AppNavLinkProps) {
  return (
    <a
      href={routeHref(route)}
      aria-current={active ? 'page' : undefined}
      className={[
        'rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors',
        active
          ? 'bg-accent text-accent-fg'
          : 'text-muted hover:bg-surface-hover hover:text-ink',
      ].join(' ')}
    >
      {routeLabel(route)}
    </a>
  )
}