import { useEffect } from 'react'

type ToastProps = {
  message: string | null
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, onDismiss, durationMs = 2400 }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(id)
  }, [message, durationMs, onDismiss])

  if (!message) return null

  return (
    <div className="mill-toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}