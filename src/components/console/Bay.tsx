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
  if (nested) {
    return (
      <section className={['stage-bay-nested space-y-4', className].join(' ')}>
        <ReadoutLabel signal={signal}>{kicker}</ReadoutLabel>
        {children}
      </section>
    )
  }

  return (
    <section
      className={['stage-bay space-y-4', signal ? 'stage-bay--active' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <header>
        <ReadoutLabel signal={signal}>{kicker}</ReadoutLabel>
      </header>
      {children}
    </section>
  )
}