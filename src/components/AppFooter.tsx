import { AppNavLink } from '@/components/AppNavLink'
import { useAppRoute } from '@/hooks/useAppRoute'
import { routeHref } from '@/lib/navigation'

export function AppFooter() {
  const route = useAppRoute()

  return (
    <footer className="mt-12 border-t border-border bg-cream py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-subtle">
        <p>
          Conversion stays in your browser. Agent QA previews route through the proxy.{' '}
          <a href={routeHref('how-it-works')} className="font-medium text-muted hover:text-ink">
            Privacy details →
          </a>
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-2">
          <AppNavLink route="generate" active={route === 'generate'} badge="Soon" muted />
          <AppNavLink route="export" active={route === 'export'} />
          <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
        </nav>
      </div>
    </footer>
  )
}