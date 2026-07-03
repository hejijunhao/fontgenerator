import type { ReactNode } from 'react'

type ReadoutLabelProps = {
  children: ReactNode
  signal?: boolean
  className?: string
}

export function ReadoutLabel({ children, signal, className = '' }: ReadoutLabelProps) {
  return (
    <p
      className={['mill-kicker', signal ? 'mill-kicker--signal' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </p>
  )
}