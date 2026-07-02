import { ThemeToggle } from '@/components/ThemeToggle'

export function AppHeader() {
  return (
    <header className="border-b border-border bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-start justify-between gap-6 px-6 py-8">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <GlyphMark />
            <h1 className="font-sans text-[0.8125rem] font-semibold tracking-[0.38em] text-ink">
              GLYPHMILL
            </h1>
          </div>
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted">
            Turn letter images into production-ready fonts — in your browser.
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

function GlyphMark() {
  return (
    <div
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-strong"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink">
        <path
          d="M7 1.5 3 12.5h2l.8-2.2h4.4L11 12.5h2L9 1.5H7zm-.8 5.2 1.6-4.4 1.6 4.4H6.2z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}