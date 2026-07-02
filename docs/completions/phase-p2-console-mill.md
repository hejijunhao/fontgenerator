# Phase P2 Completion — Console Mill

**Status:** Complete  
**Date:** 2026-07-02  
**Plan reference:** [v2-implementation-plan.md](../executing/v2-implementation-plan.md) — Phase 2  
**Version:** `0.4.0`

---

## Goal

Mill at `/mill` reads as a Kamino **console** — dark instrument bays, mono readouts, staged
workflow, micro-UX. Pipeline behaviour unchanged.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `/mill` dark console; Monument pages light-default | Pass | `.console-root` on App wrapper; `useMillConsoleTheme` forces dark; theme toggle hidden on Mill |
| Four staged bays with SOURCE / BUILD / REVIEW / EXPORT kickers | Pass | `StudioView` + `Bay` + `ReadoutLabel` |
| `MillStepIndicator` highlights correct stage | Pass | `deriveMillStage()` + `MillStepIndicator` |
| No-agent path: upload → generate → download | Pass | E2E `no-agent upload → generate → TTF download` |
| Agent path: gates + RunView; status pill when running | Pass | E2E gate flow; `StatusPill` in BUILD bay |
| One primary accent per bay zone | Pass | `signal` kicker on active bay only; single `btn-primary` per action group |
| `npm run ci` green | Pass | 34 unit/browser + 5 e2e |
| No exclamation marks in Mill UI copy | Pass | Manual audit |

---

## Decisions

### Console `--signal` accent

**Choice:** Cream-on-obsidian invert — `#ECEAE6` fill, `#0D0C0B` text (Kamino option A).

**Why:** Reuses the existing warm off-white ramp without introducing a second brand colour. Primary
CTAs read clearly on obsidian ground while state colours (`--state-ok`, `--state-warn`, etc.) stay
independent per Kamino §9.3.

### Console scope via `.console-root`

**Choice:** Apply `console-root` on the App root wrapper when `route === 'mill'`; all console CSS
tokens and overrides live in `src/lib/consoleTheme.css`.

**Why:** Monument pages (`/`, `/how-it-works`, `/foundry`) keep the existing Tailwind theme and
light/dark toggle. Mill gets a self-contained token layer without forking every shared component.

### `PipelineGraph` vs animated DAG

**Choice:** Ship a horizontal five-node graph (pre → trc → plc → bld → exp) with hairline edges;
no travelling packet animation in P2.

**Why:** Meets the staged-build read without adding motion complexity. Packet animation deferred
to a fast-follow if needed.

### WASM warm-up

**Choice:** `useWasmWarmup()` preloads `potrace-wasm` + `wawoff2` on Mill mount; banner shows
glyph emblem + mono “warming up the mill…” until both resolve.

**Why:** Honest first-load UX per plan task 2.14; no generic spinner.

### Toasts

**Choice:** Square `Toast` bay in `StudioView`; copy-recipe and download success routed through
wrapped handlers (not inline “Copied” span in `ExportPanel`).

**Why:** Kamino “signal seldom” — one notification surface, auto-dismiss 2.4s.

---

## File map

| Area | Files |
|------|-------|
| Theme | `src/lib/consoleTheme.css`, `src/hooks/useMillConsoleTheme.ts` |
| Stage logic | `src/lib/millStage.ts`, `src/lib/wasmReady.ts` |
| Console UI | `src/components/console/{Bay,ReadoutLabel,StatusPill,PipelineGraph,Toast}.tsx` |
| Layout | `src/components/layout/MillStepIndicator.tsx`, `PageShell.tsx` |
| Mill view | `src/views/StudioView.tsx` |
| Restyled | `DropZone`, `GlyphGrid`, `AgentSettings`, `ExportPanel`, `Gate*`, `PreviewPanel`, `RunView` |
| Shell | `App.tsx`, `AppHeader.tsx`, `main.tsx`, `index.html` |
| Tests | `tests/unit/millStage.test.ts` |

---

## Handoff to P3 / P4

- **P3 (Foundry placeholder):** Monument shell already exists; replace `FoundryInterim` stub with
  `FoundryPlaceholderView` + hatched inert styles. Does not depend on P2.
- **P4 (GEO pillar):** Cross-links to Mill can reference console bay names (SOURCE → EXPORT) and
  staged workflow. Prerender script may need a Mill snippet later (optional).
- **Screenshot:** Capture `/mill` with `A-KaminoDeco.png` loaded and BUILD stage active for
  changelog/marketing.
- **Deferred:** PipelineGraph packet animation; registration corner-brackets on bays (CSS-only
  brackets can be added without behaviour changes).

---

## Surprises

- Forcing dark on Mill via `useMillConsoleTheme` cleanly restores the user's stored theme on
  navigation away — no flash if `initTheme()` already ran.
- E2E required no aria-label changes; `Drop PNG glyph images here` and gate labels unchanged.
- `ProgressSteps` component retained in codebase but unused in Mill UI (replaced by `PipelineGraph`).