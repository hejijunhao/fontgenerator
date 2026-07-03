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
    <div className="stage-bay-nested space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mill-kicker">Preview</p>
        {validation && <ValidationBadges validation={validation} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="subsection-title">Source PNG</figcaption>
          {sourcePreviewUrl ? (
            <div className="flex items-center justify-center border border-border bg-preview p-4">
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
          <figcaption className="subsection-title">
            Built font — &ldquo;{character}&rdquo;
          </figcaption>
          {renderPreviewUrl ? (
            <div className="flex items-center justify-center border border-border bg-preview-frame p-4">
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
    </div>
  )
}

function PlaceholderFrame() {
  return (
    <div className="flex h-40 items-center justify-center border border-dashed border-border bg-preview text-sm text-muted">
      Waiting for output
    </div>
  )
}

function ValidationBadges({ validation }: { validation: ValidationResult }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge ok={validation.roundTripOk} label="Round-trip parse" />
      {validation.warnings.length > 0 && (
        <span className="badge badge-warning" title={validation.warnings.join('; ')}>
          {validation.warnings.length} warning{validation.warnings.length === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? 'badge badge-success' : 'badge badge-error'}>
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}