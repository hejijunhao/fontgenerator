import { analyzeFontCoverage } from '@/lib/fontCoverage'

type PartialFontWarningProps = {
  codepoints: number[]
}

export function PartialFontWarning({ codepoints }: PartialFontWarningProps) {
  const report = analyzeFontCoverage(codepoints)
  if (report.warnings.length === 0) return null

  return (
    <div role="status" className="console-alert-warn space-y-1 px-4 py-3 text-sm">
      <p className="font-medium">Partial font</p>
      <ul className="list-inside list-disc space-y-0.5 text-xs opacity-90">
        {report.warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <p className="text-xs opacity-70">
        .notdef is always synthesized. Space is auto-added when missing.
      </p>
    </div>
  )
}