import type { PipelineRecipe } from '@/pipeline/runPipeline'
import { REFERENCE_RECIPE } from '@/recipes/referenceRecipe'
import type { AgentStep } from '@/types/agent'
import type { GlyphRecipe, Recipe } from '@/types/pipeline'

const DEFAULT_GLYPH = glyphRecipeFromPipeline(REFERENCE_RECIPE)

function lastToolParams<T extends Record<string, unknown>>(
  log: AgentStep[],
  tool: string,
): T | undefined {
  const hits = log.filter((s) => s.tool === tool && !s.error)
  if (!hits.length) return undefined
  const raw = hits[hits.length - 1].params
  return raw && typeof raw === 'object' ? (raw as T) : undefined
}

function codepointFromLog(log: AgentStep[], fallback: number): number {
  const assign = lastToolParams<{ codepoint?: number; character?: string }>(log, 'assignCharacter')
  if (assign?.codepoint) return assign.codepoint
  if (assign?.character) {
    const cp = assign.character.codePointAt(0)
    if (cp) return cp
  }

  const gate = lastToolParams<{ response?: { codepoint?: number; character?: string } }>(
    log,
    'requestGate',
  )
  if (gate?.response?.codepoint) return gate.response.codepoint
  if (gate?.response?.character) {
    const cp = gate.response.character.codePointAt(0)
    if (cp) return cp
  }

  return fallback
}

export function glyphRecipeFromPipeline(recipe: PipelineRecipe): GlyphRecipe {
  return {
    codepoint: recipe.codepoint,
    preprocess: { ...recipe.preprocess },
    trace: { ...recipe.trace },
    place: { ...recipe.place },
    metrics: { ...recipe.metrics },
  }
}

export function pipelineRecipeFromGlyph(
  glyph: GlyphRecipe,
  meta: Recipe['meta'],
  options?: Pick<Recipe, 'notdefWidth' | 'spaceWidth'>,
): PipelineRecipe {
  return {
    preprocess: glyph.preprocess,
    trace: glyph.trace,
    place: glyph.place,
    metrics: glyph.metrics,
    codepoint: glyph.codepoint,
    meta,
    notdefWidth: options?.notdefWidth,
    spaceWidth: options?.spaceWidth,
  }
}

export function recipeFromPipeline(recipe: PipelineRecipe): Recipe {
  return {
    version: 1,
    meta: { ...recipe.meta },
    notdefWidth: recipe.notdefWidth,
    spaceWidth: recipe.spaceWidth,
    glyphs: [glyphRecipeFromPipeline(recipe)],
  }
}

export function distillGlyphRecipe(agentLog: AgentStep[], codepointFallback: number): GlyphRecipe {
  const preprocess =
    lastToolParams<GlyphRecipe['preprocess']>(agentLog, 'preprocess') ?? DEFAULT_GLYPH.preprocess
  const trace = lastToolParams<GlyphRecipe['trace']>(agentLog, 'trace') ?? DEFAULT_GLYPH.trace
  const placeParams = lastToolParams<
    GlyphRecipe['place'] & { leftBearing?: number; rightBearing?: number }
  >(agentLog, 'place')

  const place: GlyphRecipe['place'] = placeParams
    ? {
        unitsPerEm: placeParams.unitsPerEm ?? DEFAULT_GLYPH.place.unitsPerEm,
        baselineFraction:
          placeParams.baselineFraction ?? DEFAULT_GLYPH.place.baselineFraction,
        baselinePixelRow: placeParams.baselinePixelRow,
        verticalOverride: placeParams.verticalOverride,
      }
    : DEFAULT_GLYPH.place

  const metrics: GlyphRecipe['metrics'] = placeParams
    ? {
        leftBearing: placeParams.leftBearing ?? DEFAULT_GLYPH.metrics.leftBearing,
        rightBearing: placeParams.rightBearing ?? DEFAULT_GLYPH.metrics.rightBearing,
      }
    : DEFAULT_GLYPH.metrics

  const build = lastToolParams<{
    family?: string
    style?: string
    notdefWidth?: number
    spaceWidth?: number
  }>(agentLog, 'buildFont')

  void build

  return {
    codepoint: codepointFromLog(agentLog, codepointFallback),
    preprocess,
    trace,
    place,
    metrics,
  }
}

export function distillProjectRecipe(
  glyphs: { agentLog: AgentStep[]; codepoint: number }[],
  meta: Recipe['meta'],
): Recipe {
  const build = glyphs.flatMap((g) => g.agentLog).find((s) => s.tool === 'buildFont' && !s.error)
  const buildParams =
    build?.params && typeof build.params === 'object'
      ? (build.params as { notdefWidth?: number; spaceWidth?: number })
      : undefined

  return {
    version: 1,
    meta: { ...meta },
    notdefWidth: buildParams?.notdefWidth ?? REFERENCE_RECIPE.notdefWidth,
    spaceWidth: buildParams?.spaceWidth ?? REFERENCE_RECIPE.spaceWidth,
    glyphs: glyphs.map((g) => distillGlyphRecipe(g.agentLog, g.codepoint)),
  }
}

export function parseRecipeJson(text: string): Recipe {
  const parsed: unknown = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') throw new Error('Recipe must be a JSON object')

  const r = parsed as Partial<Recipe>
  if (r.version !== 1) throw new Error('Unsupported recipe version')
  if (!r.meta?.family || !r.meta.style) throw new Error('Recipe meta.family and meta.style required')
  if (!Array.isArray(r.glyphs) || r.glyphs.length === 0) {
    throw new Error('Recipe must include at least one glyph')
  }

  for (const g of r.glyphs) {
    if (typeof g.codepoint !== 'number') throw new Error('Each glyph needs a codepoint')
    if (!g.preprocess || !g.trace || !g.place || !g.metrics) {
      throw new Error('Each glyph needs preprocess, trace, place, and metrics')
    }
  }

  return r as Recipe
}

export function serializeRecipe(recipe: Recipe): string {
  return JSON.stringify(recipe, null, 2)
}