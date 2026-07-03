import type { ReactNode } from 'react'
import type { AppRoute } from '@/lib/navigation'

type PageShellProps = {
  route: AppRoute
  children: ReactNode
}

export function PageShell({ route, children }: PageShellProps) {
  const maxWidth =
    route === 'landing' ? 'var(--content-wide)' : 'var(--content-default)'

  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full flex-1 flex-col py-8 outline-none"
      style={{
        maxWidth,
        paddingInline: 'clamp(var(--space-4), 4vw, var(--space-12))',
      }}
    >
      {children}
    </div>
  )
}