import { buildFont } from '@/pipeline/buildFont'
import { place, type PlaceMetricsInput } from '@/pipeline/place'
import { preprocess } from '@/pipeline/preprocess'
import { trace } from '@/pipeline/trace'
import type {
  FontMeta,
  GlyphRecipe,
  PlaceParams,
  PlacedGlyph,
  PreprocessParams,
  Recipe,
  TraceParams,
} from '@/types/pipeline'

export type PipelineRecipe = {
  preprocess: PreprocessParams
  trace: TraceParams
  place: PlaceParams
  metrics: PlaceMetricsInput
  codepoint: number
  meta: FontMeta
  notdefWidth?: number
  spaceWidth?: number
}

export type PipelineProgressStep = 'preprocess' | 'trace' | 'place' | 'build'

export type PipelineResult = {
  preprocess: Awaited<ReturnType<typeof preprocess>>
  trace: Awaited<ReturnType<typeof trace>>
  placed: ReturnType<typeof place>
  fontBytes: Uint8Array
}

export type ProjectPipelineResult = {
  placed: PlacedGlyph[]
  fontBytes: Uint8Array
}

export async function runGlyphStages(
  png: Blob,
  glyph: GlyphRecipe,
  onProgress?: (step: Exclude<PipelineProgressStep, 'build'>) => void,
): Promise<{ placed: PlacedGlyph; preprocess: Awaited<ReturnType<typeof preprocess>> }> {
  onProgress?.('preprocess')
  const pre = await preprocess(png, glyph.preprocess)

  onProgress?.('trace')
  const traced = await trace(pre.bitmap, glyph.trace)

  onProgress?.('place')
  const placed = place(
    traced,
    pre.canvasHeight,
    glyph.codepoint,
    glyph.place,
    glyph.metrics,
    pre.bitmap.width,
  )

  return { placed, preprocess: pre }
}

export async function runPipeline(
  png: Blob,
  recipe: PipelineRecipe,
  onProgress?: (step: PipelineProgressStep) => void,
): Promise<PipelineResult> {
  onProgress?.('preprocess')
  const pre = await preprocess(png, recipe.preprocess)

  onProgress?.('trace')
  const traced = await trace(pre.bitmap, recipe.trace)

  onProgress?.('place')
  const placed = place(
    traced,
    pre.canvasHeight,
    recipe.codepoint,
    recipe.place,
    recipe.metrics,
    pre.bitmap.width,
  )

  onProgress?.('build')
  const fontBytes = buildFont([placed], recipe.meta, {
    notdefWidth: recipe.notdefWidth,
    spaceWidth: recipe.spaceWidth,
  })

  return {
    preprocess: pre,
    trace: traced,
    placed,
    fontBytes,
  }
}

export async function runProjectPipeline(
  sources: Blob[],
  recipe: Recipe,
  onProgress?: (glyphIndex: number, step: PipelineProgressStep) => void,
): Promise<ProjectPipelineResult> {
  if (sources.length !== recipe.glyphs.length) {
    throw new Error(
      `Recipe has ${recipe.glyphs.length} glyph(s) but ${sources.length} PNG(s) uploaded`,
    )
  }

  const placed: PlacedGlyph[] = []

  for (let i = 0; i < recipe.glyphs.length; i++) {
    const { placed: g } = await runGlyphStages(sources[i], recipe.glyphs[i], (step) =>
      onProgress?.(i, step),
    )
    placed.push(g)
  }

  onProgress?.(0, 'build')
  const fontBytes = buildFont(placed, recipe.meta, {
    notdefWidth: recipe.notdefWidth,
    spaceWidth: recipe.spaceWidth,
  })

  return { placed, fontBytes }
}