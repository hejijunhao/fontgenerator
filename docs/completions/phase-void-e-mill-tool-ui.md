# Phase VOID-E — Mill Tool UI (Complete)

**Status:** Complete  
**Date:** 2026-07-03  
**Upstream spec:** [void-design-migration.md](../executing/void-design-migration.md) — Phase E  
**Depends on:** [phase-void-d-monument-views.md](./phase-void-d-monument-views.md)  
**Goal:** Studio and console components use VOID cards, badges, and tool patterns; Kamino `consoleTheme.css` deleted; zero `console-*` class names in `src/`.

---

## Problem statement

The Mill (`/mill`) still relied on Kamino console CSS (`consoleTheme.css`, ~13 KB) scoped to `.console-root`, with registration-bracket bays, IBM Plex mono readouts, and Kamino state colours (`--state-warn`, `--ground`, etc.). Phase B removed the `console-root` wrapper, leaving those styles inactive but the component class names (`console-bay`, `console-readout`, …) still in TSX.

Phase E migrates the full Mill UI to VOID primitives and deletes the Kamino console stylesheet.

---

## Deleted

| File | Action |
|------|--------|
| `src/lib/consoleTheme.css` | **Deleted** (~538 lines Kamino console tokens + bay/gate/pipeline styles) |
| `src/main.tsx` import | Removed `import './lib/consoleTheme.css'` |

---

## New Mill CSS — `src/index.css`

| Class | Replaces | Purpose |
|-------|----------|---------|
| `.mill-view` | `.console-mill` | Vertical stack layout |
| `.mill-toolbar` | `.console-mill-toolbar` | Sticky bar below 56px nav on `surface` |
| `.mill-steps` / `.mill-step` | `.console-stage` | Stage indicator badges |
| `.stage-bay` | `.console-bay` | Expanded bay card; `--active` gets glow |
| `.stage-bay-collapsed` | `.console-bay-collapsed` | Collapsed strip button |
| `.stage-bay-nested` | `.console-bay-nested` | Inset `surface-2` panels |
| `.mill-kicker` | `.console-readout` | Violet eyebrow labels (SOURCE, BUILD, …) |
| `.dropzone` | `.console-dropzone` | Dashed upload target |
| `.pipeline-tag` | `.console-pipeline-node` | Mono tags on `surface-3` |
| `.gate-panel` | `.console-gate` | Gate cards with warning/success borders |
| `.gate-slot` | `.console-gate-slot` | `min-height: 26rem` preserved |
| `.mill-toast` | `.console-toast` | Fixed card, 2px left primary accent |
| `.alert-warning` / `.alert-error` | `.console-alert-warn` | Semantic alerts |
| `.mono-data` | `.console-mono-data` | Geist Mono readouts |
| `.mill-disclosure` | `.console-disclosure` | Agent settings `<details>` |

Also removed `.console-root` transition block and `.dark` fallback from `@custom-variant dark` (only `[data-theme="dark"]` now).

---

## Component migrations

### Shell — `StudioView.tsx`

- Root: `mill-view`
- Toolbar: `mill-toolbar` with `MillStepIndicator` + `StatusPill`
- Buttons: explicit `btn btn-primary` / `btn-secondary` / `btn-ghost`
- Agent settings: `mill-disclosure stage-bay-nested`
- Gate container: `gate-slot` (min-height preserved)
- Errors: `alert-error stage-bay-nested`
- WASM warmup: `card-static` + `dropzone-mark`

### Stage bays — `StageBay.tsx`, `Bay.tsx`

- Collapsed: `stage-bay` wrapper + `stage-bay-collapsed` button
- Expanded: `stage-bay` card with optional `stage-bay--active` glow
- Registration `::after` brackets **removed** (VOID card border/glow replaces)
- Nested panels use `stage-bay-nested`

### Labels & status — `ReadoutLabel.tsx`, `StatusPill.tsx`

- `ReadoutLabel` → `.mill-kicker` (+ `--signal` variant)
- `StatusPill` → `.badge` variants: `badge-primary` (run), `badge-warning` (gate), `badge-error`, `badge-default`

### Pipeline — `PipelineGraph.tsx`, `MillStepIndicator.tsx`

- Pipeline nodes → `.pipeline-tag` with `--active` / `--complete`
- Edges → `.pipeline-edge` / `--complete`
- Steps → `.mill-step` / `--active` with dot indicator

### Upload & grids — `DropZone.tsx`, `GlyphGrid.tsx`

- Drop zone → `.dropzone` with drag/active states
- Glyph grid → `stage-bay-nested`; warnings → `alert-warning`
- Validation badges → `badge-success` / `badge-error` / `badge-warning`

### Gates — `Gate1Panel.tsx`, `Gate2Panel.tsx`

- `gate-panel gate-panel--trace` (warning border) + `badge-warning`
- `gate-panel gate-panel--font` (success border) + `badge-success`
- Min-heights: 24rem / 20rem preserved

### Panels — `PreviewPanel.tsx`, `ExportPanel.tsx`, `RunView.tsx`, `PartialFontWarning.tsx`

- Nested shells → `stage-bay-nested`
- Export download chips → `btn btn-primary` / `btn-secondary`
- Agent run log → VOID badges for verdict/error states
- Removed Tailwind `red-50`/`dark:red-*` error chips → `badge-error` + `text-error`

### Toast — `Toast.tsx`

- Fixed bottom-right `.mill-toast` with 2px left `primary` accent (not full callout bar)

---

## E2E updates — `tests/e2e/smoke.spec.ts`

Added:

```typescript
test('mill primary bays use VOID card styling', ...)
```

Asserts first `.stage-bay` has `border-radius ≥ 12px` (VOID `radius-xl`).

Existing mill tests unchanged and passing:
- `mill collapses inactive stage bays`
- `no-agent upload → generate → TTF download`
- `gate panels accept flow`
- `mill has working theme toggle`

---

## Verification

```bash
rg 'console-' src/          # no matches
rg 'consoleTheme' src/      # no matches
npm run typecheck           # pass
npm run lint                # pass
npm test                    # 45 pass
npm run test:e2e            # 19 pass
```

---

## Acceptance criteria

| Criterion | Result |
|-----------|--------|
| e2e mill stage bay collapse | ✅ |
| e2e upload → generate → TTF | ✅ |
| e2e gate accept flow | ✅ |
| VOID card styling assertion | ✅ (replaces registration brackets) |
| No `console-` in `src/` | ✅ |

---

## Behaviour preserved

- Stage bay expand/collapse logic (`manualExpand`, `deriveMillStage`)
- Gate min-height slots (`gate-slot` 26rem)
- Gate 1/2 panel labels and button text (e2e contracts)
- Upload → generate → download pipeline
- Agent settings disclosure, recipe replay, export formats

---

## Next step

**Phase F — Tests, docs, release:** Changelog 0.7.0, version bump, README test count, aggregate completion doc, grep CI for stale Kamino classes in views (`inert-frame` legacy in `index.css` may remain for reference until cleanup).