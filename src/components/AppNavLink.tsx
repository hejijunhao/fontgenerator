import {
  isInternalHref,
  navigate,
  routeHref,
  routeLabel,
  type AppRoute,
} from '@/lib/navigation'

type AppNavLinkProps = {
  route: AppRoute
  active: boolean
  badge?: string
}

export function AppNavLink({ route, active, badge }: AppNavLinkProps) {
  const href = routeHref(route)

  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={(e) => {
        if (!isInternalHref(href)) return
        e.preventDefault()
        navigate(route)
      }}
      className={[
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors',
        active
          ? 'bg-accent text-accent-fg'
          : 'text-muted hover:bg-surface-hover hover:text-ink',
      ].join(' ')}
    >
      {routeLabel(route)}
      {badge ? (
        <span className={badge === 'Soon' ? 'badge-inert' : 'rounded px-1 py-0.5 text-[0.625rem] font-semibold tracking-wider normal-case text-subtle ring-1 ring-border'}>
          {badge}
        </span>
      ) : null}
    </a>
  )
}