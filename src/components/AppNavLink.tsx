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
  /** De-emphasize inert / coming-soon routes without hiding them. */
  muted?: boolean
}

export function AppNavLink({ route, active, badge, muted }: AppNavLinkProps) {
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
        'nav-link',
        active ? 'active' : '',
        muted ? 'nav-link--muted' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {routeLabel(route)}
      {badge ? <span className="badge badge-default">{badge}</span> : null}
    </a>
  )
}

/** Nav entry with no route behind it yet. Inert: no href, not focusable, not clickable. */
export function AppNavInert({ label, badge }: { label: string; badge?: string }) {
  return (
    <span aria-disabled="true" className="nav-link nav-link--muted">
      {label}
      {badge ? <span className="badge badge-default">{badge}</span> : null}
    </span>
  )
}