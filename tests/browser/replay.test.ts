import { describe, expect, it } from 'vitest'
import { parseRecipeJson } from '@/lib/recipe'
import { runProjectPipeline } from '@/pipeline/runPipeline'
import { validate } from '@/pipeline/validate'
import fixtureUrl from '../fixtures/A-KaminoDeco.png?url'
import recipeUrl from '../fixtures/kamino-deco-recipe.json?url'

async function loadFixtureBlob(): Promise<Blob> {
  const res = await fetch(fixtureUrl)
  return res.blob()
}

async function loadRecipeJson(): Promise<string> {
  const res = await fetch(recipeUrl)
  return res.text()
}

describe('recipe replay (browser)', () => {
  it('replays kamino-deco-recipe without agent', async () => {
    const recipe = parseRecipeJson(await loadRecipeJson())
    const png = await loadFixtureBlob()

    const result = await runProjectPipeline([png], recipe)
    expect(result.placed).toHaveLength(1)
    expect(result.placed[0].codepoint).toBe(0x41)
    expect(validate(result.fontBytes).roundTripOk).toBe(true)
    expect(result.placed[0].metrics.advanceWidth).toBeGreaterThanOrEqual(654)
  }, 30_000)
})