import { AppFooter } from '@/components/AppFooter'
import { AppHeader } from '@/components/AppHeader'
import { JsonLd } from '@/components/layout/JsonLd'
import { PageShell } from '@/components/layout/PageShell'
import { useAppRoute } from '@/hooks/useAppRoute'
import { useMillConsoleTheme } from '@/hooks/useMillConsoleTheme'
import { usePageMeta } from '@/hooks/usePageMeta'

import { FoundryPlaceholderView } from '@/views/FoundryPlaceholderView'
import { HowItWorksView } from '@/views/HowItWorksView'
import { LandingView } from '@/views/LandingView'
import { StudioView } from '@/views/StudioView'

function App() {
  const route = useAppRoute()
  usePageMeta(route)
  useMillConsoleTheme(route)

  return (
    <div className={['flex min-h-dvh flex-col', route === 'mill' ? 'console-root' : ''].join(' ')}>
      <AppHeader />
      <JsonLd route={route} />

      <PageShell route={route}>
        {route === 'landing' && <LandingView />}
        {route === 'mill' && <StudioView />}
        {route === 'how-it-works' && <HowItWorksView />}
        {route === 'foundry' && <FoundryPlaceholderView />}
        <AppFooter />
      </PageShell>
    </div>
  )
}
export default App