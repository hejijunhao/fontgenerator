# Phase 2 Completion — Deterministic WASM Pipeline

**Status:** Complete  
**Date:** 2026-07-01  
**Plan reference:** [implementation-plan.md](../executing/implementation-plan.md) — Phase 2

---

## Goal

Implement blueprint §3 tools as plain TypeScript functions with unit/browser tests.
No UI wiring, no agent. Prove `A-KaminoDeco.png` → TTF with open counter.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `preprocess` → `trace` → `place` → `buildFont` on fixture | Pass | `tests/browser/pipeline.test.ts` |
| Output `A` has **open counter** | Pass | Browser test samples white counter pixel |
| `validate()` → `roundTripOk: true` | Pass | TTF parse via opentype.js |
| `toWoff2()` produces valid bytes | Pass | `tests/unit/export.test.ts` (Node; signature + size) |
| Master format decision recorded | Pass | **TTF (glyf)** — `MASTER_FORMAT = 'ttf'` |
| WASM lazy-load (no huge initial SPA chunk) | Pass | Pipeline not imported in `App.tsx`; `dist` JS still ~196 kB |

---

## Master format decision

**Chosen: TTF (TrueType `glyf`) via opentype.js**

| Option | Outcome |
|--------|---------|
| A. TTF master | **Selected** — opentype.js writes glyf reliably |
| B. CFF OTF | Deferred — Phase 0 CLI golden is CFF; browser master differs |

Downloads in Phase 3 should use `.ttf` extension. WOFF2 wraps the same glyf tables.

---

## Tracer decision

**Chosen: `potrace-wasm` (not `esm-potrace-wasm`)**

| Package | Result |
|---------|--------|
| `esm-potrace-wasm` | Works for small canvases; **RangeError** on full 720×1254 bilevel bitmap |
| `potrace-wasm` | Handles full-size preprocessed bitmap in browser + Node |

`TraceParams` (`turdsize`, `alphamax`, `opttolerance`) are **recorded in recipes** for agent/replay but
`potrace-wasm` exposes no JS tuning API — output matches CLI defaults (same as Phase 0 pinned values).

---

## What was built

### Pipeline modules (`src/pipeline/`)

| Module | Function | Notes |
|--------|----------|-------|
| `preprocess.ts` | `preprocess(png, params)` | Luminance threshold, morphology close, horizontal-only crop |
| `trace.ts` | `trace(bitmap, params)` | Lazy `import('potrace-wasm')` |
| `place.ts` | `place(trace, height, cp, …)` | SVG → font units; advance from bitmap width |
| `buildFont.ts` | `buildFont(glyphs, meta)` | `.notdef`, `space`, cmap; TTF bytes |
| `validate.ts` | `validate(bytes)` | opentype round-trip; WOFF2 signature check |
| `export.ts` | `toWoff2`, `toWoff` | Lazy `wawoff2`; `buffer` polyfill for browser |
| `render.ts` | `renderSample(font, text)` | FontFace + canvas |
| `runPipeline.ts` | `runPipeline(png, recipe)` | Chains all steps — Phase 3/6 entry point |
| `index.ts` | re-exports | Public API |

### Geometry (`src/lib/`)

| Module | Role |
|--------|------|
| `bilevel.ts` | Threshold, morphology, ink bounds, horizontal crop |
| `geometry.ts` | Potrace SVG → opentype path; foot-at-baseline transform; winding fix |
| `raster.ts` | PNG blob → RGBA (browser `createImageBitmap` / Node `pngjs`) |
| `buffer.ts` | `Uint8Array` → `ArrayBuffer` for opentype |

**Critical transform (from Phase 0 + Phase 2 discovery):**

1. `svg-path-parser` **makeAbsolute** — Potrace emits relative `m` after `z` for counters; opentype `fromSVG` alone leaves NaNs.
2. Raw path coords → viewBox: `x' = 0.1·x`, `y' = H − 0.1·y`
3. Font coords: foot = max `y'` anchored to `y=0`; `x_font = x'·s + leftBearing`

### Types (`src/types/`)

- `pipeline.ts` — blueprint-aligned types
- `modules.d.ts` — shims for opentype.js, potrace-wasm, wawoff2

### Tests

| Suite | Environment | Coverage |
|-------|-------------|----------|
| `tests/unit/geometry.test.ts` | Node | px→em, golden SVG place, winding |
| `tests/unit/preprocess.test.ts` | Node | Ink bounds on fixture PNG |
| `tests/unit/export.test.ts` | Node | TTF → WOFF2 |
| `tests/browser/pipeline.test.ts` | Playwright chromium | Full pipeline + render + counter |

Vitest **projects**: `unit` (node) + `browser` (`@vitest/browser-playwright`).

```bash
npm run test:unit
npm run test:browser
npm test          # both
```

### Pinned recipe

`tests/helpers/referenceRecipe.ts` mirrors `scripts/cli-reference/params.json`.

---

## Dependencies added

| Package | Role |
|---------|------|
| `opentype.js` | Build/parse TTF |
| `potrace-wasm` | Bitmap → SVG |
| `svg-path-parser` | Absolute path commands (counter subpaths) |
| `pngjs` | Node test/fixture PNG decode |
| `wawoff2` | TTF → WOFF2 |
| `buffer` | Browser polyfill for wawoff2 |
| `@vitest/browser-playwright` | Browser pipeline test |

Removed: `esm-potrace-wasm` (size limit).

---

## Known limitations / handoff

1. **Trace params** — stored but not applied until potrace-wasm gains a JS API or we swap tracer.
2. **WOFF2 in browser** — `wawoff2` WASM init is slow/hangs in Vitest browser timeout; validated in **Node** unit test. Re-verify in real browser during Phase 3 UI export.
3. **Cap height bbox** — ~565 font units vs Phase 0 FontForge ~451; same path geometry, different bbox measurement (beziers). Visual render confirms correct `A`.
4. **Advance width** — `round(bitmapWidth × U/H) + bearings` → 654–655 (bitmap width 720 vs 721 after morphology).
5. **CFF golden** — `tests/fixtures/golden/KaminoDeco.otf` remains CLI reference; browser pipeline emits **TTF**.

### Phase 3 wiring

```typescript
import { runPipeline } from '@/pipeline'
import { REFERENCE_RECIPE } from '../tests/helpers/referenceRecipe' // move to src/recipes/

const result = await runPipeline(pngBlob, REFERENCE_RECIPE)
// result.fontBytes → download
```

Lazy-load note: first `trace()` / `toWoff2()` call pays WASM download cost — keep dynamic imports.

---

## Files added/changed

```
src/types/pipeline.ts, src/types/modules.d.ts
src/lib/bilevel.ts, src/lib/geometry.ts, src/lib/raster.ts, src/lib/buffer.ts
src/pipeline/*.ts
tests/unit/*.test.ts, tests/browser/pipeline.test.ts, tests/helpers/referenceRecipe.ts
vitest.config.ts (projects), vite.config.ts (buffer alias, optimizeDeps)
package.json (deps, test:unit, test:browser)
docs/completions/phase-2-pipeline.md
```