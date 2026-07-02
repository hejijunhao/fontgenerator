import type { ReactNode } from 'react'
import { ReadoutLabel } from '@/components/console/ReadoutLabel'

type BayProps = {
  kicker: string
  signal?: boolean
  nested?: boolean
  children: ReactNode
  className?: string
}

export function Bay({ kicker, signal, nested, children, className = '' }: BayProps) {
  return (
    <section
      className={[
        nested ? 'console-bay-nested' : 'console-bay',
        'space-y-4 p-4',
        className,
      ].join(' ')}
    >
      <header className="space-y-2">
        <ReadoutLabel signal={signal}>{kicker}</ReadoutLabel>
        <div className="console-registration-band" aria-hidden />
      </header>
      {children}
    </section>
  )
}