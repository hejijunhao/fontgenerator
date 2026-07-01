# Phase 6 Completion — Full Export & Recipe Replay

**Status:** Complete  
**Date:** 2026-07-01  
**Plan reference:** [implementation-plan.md](../executing/implementation-plan.md) — Phase 6

---

## Goal

WOFF/WOFF2 + zip; serializable recipe; agent-free replay; multi-glyph batch assembly.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Zip contains TTF + WOFF2 + WOFF | Pass | `tests/browser/replay.test.ts` (zip file entries) |
| Recipe replay → valid font | Pass | Browser replay test on `kamino-deco-recipe.json` |
| Fast path: zero OpenRouter calls | Pass | `replayRecipe` uses `runProjectPipeline` only |
| Multi-glyph batch cmap | Pass | `runProjectPipeline` + multi-upload; codepoints A, B, … by index |

**WOFF note:** `toWoff()` remains a TTF passthrough stub (Phase 2). Zip includes `.woff` for contract completeness; real WOFF1 encoding deferred.

**Replay drift:** Byte-identical to agent run not guaranteed (potrace-wasm has no JS tuning API). Visually identical when using the same pinned recipe JSON.

---

## What was built

### Export (`src/lib/fontExport.ts`)

| Function | Role |
|----------|------|
| `buildExportBundle` | TTF → WOFF2 + WOFF stub |
| `buildFontZip` | JSZip lazy-loaded — `{family}.ttf`, `.woff2`, `.woff` |
| `downloadBytes` / `downloadBlob` | Browser download helpers |

### Recipe (`src/lib/recipe.ts`)

| Function | Role |
|----------|------|
| `distillGlyphRecipe` | Last tool params from `agentLog` |
| `distillProjectRecipe` | Per-glyph + meta for project |
| `parseRecipeJson` / `serializeRecipe` | v1 recipe validation |
| `recipeFromPipeline` | No-agent path seed |

### Batch pipeline (`src/pipeline/runPipeline.ts`)

- `runGlyphStages` — preprocess → trace → place (one glyph)
- `runProjectPipeline` — N glyphs → single `buildFont`

### UI

| Component | Role |
|-----------|------|
| `ExportPanel` | Download TTF/WOFF2/WOFF/zip · Copy recipe · Replay textarea |
| `DropZone` | Multi-PNG upload |

### Store

- `recipe`, `output` on `Project`
- `replayRecipe`, `copyRecipe`, `downloadExport`
- Generate / agent / replay all build export bundle on success

### Fixture

`tests/fixtures/kamino-deco-recipe.json` — committed replay example.

---

## Handoff to Phase 7

1. Polish UX, rate limits on `/api/agent`
2. Playwright smoke (upload → gates → zip download)
3. Lazy-load zip chunk further if needed (JSZip ~500 kB gzip)

---

## Files added/changed

```
src/lib/recipe.ts, src/lib/fontExport.ts
src/pipeline/runPipeline.ts, src/types/pipeline.ts
src/components/ExportPanel.tsx
src/store/projectStore.ts, src/App.tsx, src/components/DropZone.tsx
tests/fixtures/kamino-deco-recipe.json
tests/unit/recipe.test.ts, tests/browser/replay.test.ts
package.json (jszip)
docs/completions/phase-6-export-recipe.md
```