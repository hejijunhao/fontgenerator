import { AppFooter } from '@/components/AppFooter'
import { AppHeader } from '@/components/AppHeader'
import { useAppRoute } from '@/hooks/useAppRoute'
import { HowItWorksView } from '@/views/HowItWorksView'
import { StudioView } from '@/views/StudioView'

function App() {
  const route = useAppRoute()

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
        {route === 'how-it-works' ? <HowItWorksView /> : <StudioView />}
        <AppFooter />
      </div>
    </div>
  )
}

export default App