export const TOOL_LABELS: Record<string, string> = {
  preprocess: 'Threshold PNG to bilevel bitmap',
  trace: 'Vectorize ink with Potrace',
  place: 'Map paths to font units & baseline',
  buildFont: 'Assemble TTF with metrics',
  renderSample: 'Render glyph for visual QA',
  validate: 'Structural round-trip check',
  assignCharacter: 'Assign Unicode codepoint',
  requestGate: 'Pause for human review',
  finish: 'Finalize agent run',
}

export const TOOL_ERROR_HINTS: Record<string, string> = {
  preprocess: 'Try a different luminance threshold or morphology close radius.',
  trace: 'Re-run preprocess with cleaner ink, then trace again.',
  place: 'Check baseline fraction and side bearings.',
  buildFont: 'Validate winding and path data from place.',
  renderSample: 'Confirm the font bytes built successfully first.',
  validate: 'Rebuild the font or adjust place metrics.',
}

export function labelForTool(tool: string): string {
  return TOOL_LABELS[tool] ?? tool
}

export function errorHintForTool(tool: string): string | undefined {
  return TOOL_ERROR_HINTS[tool]
}

export function formatStepDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}