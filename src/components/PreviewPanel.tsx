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
    <section className="panel space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-heading">Preview</h2>
        {validation && <ValidationBadges validation={validation} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="text-xs font-medium text-muted">Source PNG</figcaption>
          {sourcePreviewUrl ? (
            <div className="flex items-center justify-center rounded-xl border border-border bg-preview p-4">
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
          <figcaption className="text-xs font-medium text-muted">
            Built font — &ldquo;{character}&rdquo;
          </figcaption>
          {renderPreviewUrl ? (
            <div className="flex items-center justify-center rounded-xl border border-border bg-preview-frame p-4">
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
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border-strong bg-preview text-sm text-muted">
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
          className="rounded-full border border-amber-300/50 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100"
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
        ok
          ? 'border border-emerald-300/50 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100'
          : 'border border-red-300/50 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100',
      ].join(' ')}
    >
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}