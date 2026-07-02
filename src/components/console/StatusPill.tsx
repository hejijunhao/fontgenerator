type StatusPillProps = {
  label: string
  tone?: 'run' | 'gate' | 'error' | 'idle'
  live?: boolean
}

export function StatusPill({ label, tone = 'idle', live }: StatusPillProps) {
  return (
    <span className="console-status-pill" data-tone={tone === 'idle' ? undefined : tone}>
      {live && <span className="console-live-dot" aria-hidden />}
      {label}
    </span>
  )
}