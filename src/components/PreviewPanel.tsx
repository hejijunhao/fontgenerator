import type { ValidationResult } from '@/types/pipeline'

type PreviewPanelProps = {
  sourcePreviewUrl?: string
  renderPreviewUrl?: string
  validation?: ValidationResult
  character: string
}

export function PreviewPanel({
  sourcePreviewUrl,
  renderPreviewUrl,
  validation,
  character,
}: PreviewPanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-ink/10 bg-white/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-ink/70 uppercase">
          Preview
        </h2>
        {validation && <ValidationBadges validation={validation} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-ink/55">Source PNG</figcaption>
          {sourcePreviewUrl ? (
            <div className="flex items-center justify-center rounded-xl border border-ink/10 bg-cream p-4">
              <img
                src={sourcePreviewUrl}
                alt="Uploaded glyph source"
                className="max-h-48 max-w-full object-contain"
              />
            </div>
          ) : (
            <PlaceholderFrame />
          )}
        </figure>

        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-ink/55">
            Built font — &ldquo;{character}&rdquo;
          </figcaption>
          {renderPreviewUrl ? (
            <div className="flex items-center justify-center rounded-xl border border-ink/10 bg-white p-4">
              <img
                src={renderPreviewUrl}
                alt={`Rendered ${character} in built font`}
                className="max-h-48 max-w-full object-contain"
              />
            </div>
          ) : (
            <PlaceholderFrame />
          )}
        </figure>
      </div>
    </section>
  )
}

function PlaceholderFrame() {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-ink/15 bg-cream/60 text-sm text-ink/40">
      Waiting for output
    </div>
  )
}

function ValidationBadges({ validation }: { validation: ValidationResult }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge ok={validation.roundTripOk} label="Round-trip parse" />
      {validation.warnings.length > 0 && (
        <span
          className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900"
          title={validation.warnings.join('; ')}
        >
          {validation.warnings.length} warning{validation.warnings.length === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        ok ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900',
      ].join(' ')}
    >
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}