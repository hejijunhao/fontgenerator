# Phase UI-P3 — Mill Micro-UX (Complete)

**Status:** Complete  
**Date:** 2026-07-02  
**Upstream spec:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) — Phase 3  
**Depends on:** [phase-ui-p1-shell-stability.md](./phase-ui-p1-shell-stability.md)  
**Goal:** Mill feels like a focused instrument panel — not a long scrolling form — with stable layout during gates and generation.

---

## Problem statement

The Mill (`/mill`) rendered all four bays (SOURCE · BUILD · REVIEW · EXPORT) fully expanded at all times. Empty REVIEW/EXPORT sections, a verbose privacy block inside BUILD, gate panels injected into BUILD (while `deriveMillStage` pointed at REVIEW), Monument-style amber alerts, and a non-sticky stage indicator made the console feel like a form and caused large layout jumps during agent gates.

---

## What changed

### 1. Collapsible stage bays (`StageBay.tsx`, `millBaySummaries.ts`)

**New components / modules:**

- `src/components/console/StageBay.tsx` — wraps `Bay`; when inactive, renders a one-line collapsed strip with kicker + mono summary; click `+` to pin-expand.
- `src/lib/millBaySummaries.ts` — pure functions for collapsed summaries per bay and pipeline state.

**Expansion rules:**

- Active stage (from `deriveMillStage`) is always expanded.
- User can manually pin another bay via `pinBay()`; pin is scoped to the current `activeStage` so it auto-invalidates when the pipeline advances (no `useEffect` reset — avoids react-hooks lint issue).

**Stage derivation fix (`millStage.ts`):**

- When glyphs are loaded but not yet generated → **`build`** (was incorrectly `source`).
- Ensures Generate / Run agent stay visible after upload while SOURCE collapses to “1 PNG loaded”.

---

### 2. Gates moved to REVIEW bay (`StudioView.tsx`)

**Before:** Gate 1/2 panels lived inside BUILD while `deriveMillStage` returned `review` during gates — REVIEW empty, BUILD bloated.

**After:** Gate panels render in REVIEW inside `.console-gate-slot` (min-height reserved). BUILD holds actions, agent settings, pipeline graph, run log, errors only.

**Why:** Semantic alignment + smaller layout shift when gates open (slot height pre-allocated).

---

### 3. Sticky mill toolbar (`consoleTheme.css`, `AppHeader.tsx`)

- `AppHeader` → `sticky top-0 z-30` (all routes — header stays visible while scrolling).
- `.console-mill-toolbar` → `sticky` below header (`top: 8.5rem` desktop, `11.75rem` mobile) with obsidian backdrop.
- Stage indicator + status pill remain visible during long console scrolls.

---

### 4. Preview panel console grammar (`PreviewPanel.tsx`)

- Removed outer `.panel` (bay-in-panel nesting).
- Uses `console-bay-nested` + `console-readout` captions + square preview frames matching gate panels.

---

### 5. Console-native alerts (`GlyphGrid.tsx`, `PartialFontWarning.tsx`, `consoleTheme.css`)

- Replaced Tailwind `amber-50` / `dark:amber-*` Monument alerts with `.console-alert-warn` (uses `--state-warn`).
- `GlyphGrid` outer shell → `console-bay-nested`; remove button hover uses `--state-fail`.
- `PartialFontWarning` uses same alert class.

---

### 6. Privacy note relocated (`StudioView.tsx`, `AppFooter.tsx`)

- Removed `PrivacyNote` essay from BUILD bay (~12 lines removed from primary workflow).
- Mill footer: one line + link to How it works (“Privacy details →”).
- Monument footer unchanged.

**Idle hint** shortened to one line with link.

---

### 7. Gate min-height (`Gate1Panel.tsx`, `Gate2Panel.tsx`, `console-gate-slot`)

- Gate 1: `min-h-[24rem]` on panel.
- Gate 2: `min-h-[20rem]` on panel.
- Wrapper `.console-gate-slot { min-height: 26rem }` when `atGate`.

---

### 8. Cleanup

- **Deleted** `src/components/ProgressSteps.tsx` (unused since P2 `PipelineGraph`).

---

## Files touched

| File | Action |
|------|--------|
| `src/components/console/StageBay.tsx` | Created |
| `src/lib/millBaySummaries.ts` | Created |
| `src/lib/millStage.ts` | Glyphs loaded → `build` |
| `src/views/StudioView.tsx` | Stage bays, gates in REVIEW, sticky toolbar row |
| `src/components/PreviewPanel.tsx` | Console nested styling |
| `src/components/GlyphGrid.tsx` | Console tokens |
| `src/components/PartialFontWarning.tsx` | Console tokens |
| `src/components/Gate1Panel.tsx` | Min-height |
| `src/components/Gate2Panel.tsx` | Min-height |
| `src/components/AppHeader.tsx` | Sticky header |
| `src/components/AppFooter.tsx` | Mill-specific privacy line |
| `src/lib/consoleTheme.css` | Toolbar, gate slot, alerts, collapsed hover |
| `src/components/ProgressSteps.tsx` | **Deleted** |
| `tests/unit/millBaySummaries.test.ts` | Created |
| `tests/unit/millStage.test.ts` | +1 case |
| `tests/e2e/smoke.spec.ts` | Bay collapse + upload assertions updated |

---

## Verification

```bash
npm run typecheck   # pass
npm run lint        # pass
npm test            # 45 pass
npm run test:e2e    # 16 pass
```

---

## Acceptance checklist (Phase 3)

| Criterion | Status |
|-----------|--------|
| Inactive bays collapse to summary row | ✅ |
| Active stage auto-expands | ✅ |
| Manual bay expand via collapsed strip | ✅ |
| Generate visible after PNG upload | ✅ (`deriveMillStage` fix) |
| Gates in REVIEW with reserved height | ✅ |
| Sticky stage indicator row | ✅ |
| Privacy removed from BUILD | ✅ |
| Preview uses console nested style | ✅ |
| Console warn alerts (no Monument amber) | ✅ |
| `ProgressSteps` removed | ✅ |
| Upload → generate → TTF download e2e | ✅ |

---

## E2E assertion changes (intentional)

| Old | New | Why |
|-----|-----|-----|
| `getByText('1 PNG ready')` | `getByRole('button', { name: /1 PNG loaded/i })` | Drop zone collapses with SOURCE bay |
| `getByText('✓ Round-trip parse')` | removed from smoke | Validation lives in collapsed REVIEW at export stage |

Full validation still covered by browser pipeline tests.

---

## Known limitations / follow-ups

| Item | Phase |
|------|-------|
| Merge `MillStepIndicator` + `PipelineGraph` into one component | Optional polish |
| Auto-expand REVIEW briefly when validation fails | UX nicety |
| Registration brackets on bays | UI-P4 |
| Mill footer `console-mono-data` only applies inside `.console-root` | OK |

---

## Decision log

| ID | Decision | Choice | Rationale |
|----|----------|--------|-----------|
| D-04 | Gate UI | Move to REVIEW + min-height slot | Aligns with `deriveMillStage`; reduces BUILD jump |
| — | Manual bay pin | Scoped to `activeStage` at pin time | No effect-based reset; lint-clean |
| — | Post-upload stage | `build` not `source` | Generate must stay reachable when SOURCE collapses |

---

## Handoff

Mill console is stage-aware: one expanded bay matches pipeline progress; others collapse to mono summaries. Combined with UI-P1 stable header and UI-P2 landing sections, the product shell is in good shape.

**Recommended next:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) Phase 4 — design system (Plex Sans monument, registration brackets, Foundry status banner).