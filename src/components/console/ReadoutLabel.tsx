import type { ReactNode } from 'react'

type ReadoutLabelProps = {
  children: ReactNode
  signal?: boolean
  className?: string
}

export function ReadoutLabel({ children, signal, className = '' }: ReadoutLabelProps) {
  return (
    <p
      className={['console-readout', signal ? 'console-readout--signal' : '', className].join(' ')}
    >
      {children}
    </p>
  )
}