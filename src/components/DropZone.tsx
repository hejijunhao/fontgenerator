import { useRef, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'

export function DropZone() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const setSourcePngs = useProjectStore((s) => s.setSourcePngs)
  const glyphs = useProjectStore((s) => s.glyphs)
  const isBusy = useProjectStore((s) => {
    const g = s.glyphs[0]
    return (
      s.isGenerating ||
      s.isReplaying ||
      s.isAgentRunning ||
      g?.status === 'gate1' ||
      g?.status === 'gate2'
    )
  })

  function handleFiles(files: FileList | null) {
    if (!files?.length || isBusy) return
    const pngs = [...files].filter((f) => f.type === 'image/png')
    if (pngs.length) setSourcePngs(pngs)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop PNG glyph images here"
      aria-disabled={isBusy}
      onClick={() => !isBusy && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (isBusy) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        if (!isBusy) setIsDragging(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      data-dragging={isDragging || undefined}
      className={[
        'console-dropzone flex cursor-pointer flex-col items-center justify-center gap-3 px-8 py-16 text-center transition-colors',
        isBusy ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      <div className="console-emblem text-2xl font-medium">A</div>
      <div className="space-y-1">
        <p className="text-lg font-medium">Drop PNG glyphs here</p>
        <p className="text-sm text-muted">One or more letters — batch fonts assemble at export</p>
      </div>
      {glyphs.length > 0 && (
        <p className="console-mono-data text-sm font-medium text-subtle">
          {glyphs.length} PNG{glyphs.length === 1 ? '' : 's'} ready
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        multiple
        className="hidden"
        disabled={isBusy}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}