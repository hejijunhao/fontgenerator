type StatusPillProps = {
  label: string
  tone?: 'run' | 'gate' | 'error' | 'idle'
  live?: boolean
}

const TONE_CLASS: Record<NonNullable<StatusPillProps['tone']>, string> = {
  run: 'badge badge-primary',
  gate: 'badge badge-warning',
  error: 'badge badge-error',
  idle: 'badge badge-default',
}

export function StatusPill({ label, tone = 'idle', live }: StatusPillProps) {
  return (
    <span className={TONE_CLASS[tone]}>
      {live && <span className="pulse-dot" aria-hidden />}
      {label}
    </span>
  )
}