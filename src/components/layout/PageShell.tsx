import type { ReactNode } from 'react'
import type { AppRoute } from '@/lib/navigation'

type PageShellProps = {
  route: AppRoute
  children: ReactNode
}

export function PageShell({ route, children }: PageShellProps) {
  if (route === 'mill') {
    return (
      <div className="console-field mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    )
  }

  const widthClass = route === 'landing' ? 'max-w-6xl' : 'max-w-5xl'

  return (
    <div className={`mx-auto flex w-full flex-1 flex-col px-6 py-8 ${widthClass}`}>
      {children}
    </div>
  )
}