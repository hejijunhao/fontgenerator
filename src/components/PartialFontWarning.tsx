import { analyzeFontCoverage } from '@/lib/fontCoverage'

type PartialFontWarningProps = {
  codepoints: number[]
}

export function PartialFontWarning({ codepoints }: PartialFontWarningProps) {
  const report = analyzeFontCoverage(codepoints)
  if (report.warnings.length === 0) return null

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-300/50 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/35 dark:text-amber-100"
    >
      <p className="font-medium">Partial font</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs opacity-90">
        {report.warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs opacity-70">
        .notdef is always synthesized. Space is auto-added when missing.
      </p>
    </div>
  )
}