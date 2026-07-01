import type { PipelineRecipe } from '@/pipeline/runPipeline'

/** Pinned Phase 0 params from scripts/cli-reference/params.json */
export const REFERENCE_RECIPE: PipelineRecipe = {
  preprocess: {
    threshold: 0.6,
    close: 1,
    invert: false,
  },
  trace: {
    turdsize: 2,
    alphamax: 1.0,
    opttolerance: 0.2,
  },
  place: {
    unitsPerEm: 1000,
    baselineFraction: 0.754385,
    baselinePixelRow: 946,
  },
  metrics: {
    leftBearing: 40,
    rightBearing: 40,
  },
  codepoint: 0x41,
  meta: {
    family: 'KaminoDeco',
    style: 'Regular',
    unitsPerEm: 1000,
    baselineFraction: 0.754385,
  },
  notdefWidth: 600,
  spaceWidth: 250,
}