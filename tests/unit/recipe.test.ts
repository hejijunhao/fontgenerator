import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  distillGlyphRecipe,
  parseRecipeJson,
  recipeFromPipeline,
  serializeRecipe,
} from '@/lib/recipe'
import { REFERENCE_RECIPE } from '../helpers/referenceRecipe'
import type { AgentStep } from '@/types/agent'

describe('recipe', () => {
  it('round-trips reference pipeline recipe', () => {
    const recipe = recipeFromPipeline(REFERENCE_RECIPE)
    const parsed = parseRecipeJson(serializeRecipe(recipe))
    expect(parsed.glyphs[0].codepoint).toBe(0x41)
    expect(parsed.glyphs[0].preprocess.threshold).toBe(0.6)
  })

  it('parses committed fixture', () => {
    const json = readFileSync(
      fileURLToPath(new URL('../fixtures/kamino-deco-recipe.json', import.meta.url)),
      'utf8',
    )
    const recipe = parseRecipeJson(json)
    expect(recipe.version).toBe(1)
    expect(recipe.glyphs).toHaveLength(1)
  })

  it('distills params from agent log (last wins)', () => {
    const log: AgentStep[] = [
      {
        tool: 'preprocess',
        params: { threshold: 0.55, close: 1, invert: false },
        timestamp: 1,
      },
      {
        tool: 'trace',
        params: { turdsize: 2, alphamax: 1.0, opttolerance: 0.2 },
        timestamp: 2,
      },
      {
        tool: 'trace',
        params: { turdsize: 2, alphamax: 0.85, opttolerance: 0.2 },
        timestamp: 3,
      },
      {
        tool: 'assignCharacter',
        params: { character: 'A', codepoint: 65 },
        timestamp: 4,
      },
      {
        tool: 'place',
        params: {
          unitsPerEm: 1000,
          baselineFraction: 0.754385,
          leftBearing: 40,
          rightBearing: 40,
        },
        timestamp: 5,
      },
    ]

    const glyph = distillGlyphRecipe(log, 0x41)
    expect(glyph.trace.alphamax).toBe(0.85)
    expect(glyph.codepoint).toBe(65)
  })
})