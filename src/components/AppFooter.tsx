import { AppNavLink } from '@/components/AppNavLink'
import { useAppRoute } from '@/hooks/useAppRoute'
import { routeHref } from '@/lib/navigation'

export function AppFooter() {
  const route = useAppRoute()
  const isMill = route === 'mill'

  return (
    <footer className={isMill ? 'mt-8 border-t border-border pt-4' : 'mt-14 border-t border-border pt-6'}>
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-subtle">
        {isMill ? (
          <p>
            Conversion stays local. Agent previews via{' '}
            <code className="console-mono-data text-subtle">/api/agent</code>.{' '}
            <a href={routeHref('how-it-works')} className="font-medium text-muted hover:text-ink">
              Privacy details →
            </a>
          </p>
        ) : (
          <p>Conversion stays in your browser. Agent QA previews route through the proxy.</p>
        )}
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-2">
          <AppNavLink route="foundry" active={route === 'foundry'} badge="Soon" />
          <AppNavLink route="mill" active={route === 'mill'} />
          <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
        </nav>
      </div>
    </footer>
  )
}