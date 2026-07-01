export function formatPipelineError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()

  if (lower.includes('wasm') || lower.includes('webassembly')) {
    return 'Tracing engine failed to load. Refresh the page and try again.'
  }
  if (lower.includes('png') || lower.includes('image') || lower.includes('bitmap')) {
    return 'Could not read the PNG. Use a valid, uncompressed letter image.'
  }
  if (lower.includes('canvas') || lower.includes('2d')) {
    return 'Canvas is unavailable in this browser. Try Chrome, Firefox, or Safari.'
  }
  if (lower.includes('memory') || lower.includes('rangeerror') || lower.includes('allocation')) {
    return 'Image is too large for in-browser processing. Try a smaller PNG.'
  }
  if (lower.includes('fontface') || lower.includes('font')) {
    return 'Font build failed. Check that the trace produced a valid outline.'
  }

  return message || 'Pipeline failed unexpectedly.'
}