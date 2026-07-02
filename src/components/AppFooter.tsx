import { AppNavLink } from '@/components/AppNavLink'
import { useAppRoute } from '@/hooks/useAppRoute'

export function AppFooter() {
  const route = useAppRoute()

  return (
    <footer className="mt-14 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-subtle">
        <p>Conversion stays in your browser. Agent QA previews route through the proxy.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-2">
          <AppNavLink route="how-it-works" active={route === 'how-it-works'} />
          <AppNavLink route="studio" active={route === 'studio'} />
        </nav>
      </div>
    </footer>
  )
}