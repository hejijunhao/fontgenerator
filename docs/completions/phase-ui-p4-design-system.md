# Phase UI-P4 — Design System Alignment (Complete)

**Status:** Complete  
**Date:** 2026-07-02  
**Upstream spec:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) — Phase 4  
**Depends on:** [phase-ui-p1-shell-stability.md](./phase-ui-p1-shell-stability.md), [phase-ui-p2-landing-sections.md](./phase-ui-p2-landing-sections.md), [phase-ui-p3-mill-micro-ux.md](./phase-ui-p3-mill-micro-ux.md)  
**Goal:** Close Kamino design gaps incrementally — unified Plex family on Monument, console registration brackets, Foundry status clarity, nav IA polish, and accurate scoped-theme copy.

---

## Problem statement

After UI-P1–P3, the shell was stable and both surfaces were usable — but Monument still used Inter while Console used IBM Plex, primary Mill bays lacked Kamino registration brackets, Foundry read as a normal page rather than a deferred chamber, nav led with a dead-end route, and GEO/FAQ copy still described Mill as "forcing" global dark theme (incorrect since UI-P1 scoped `.console-root.dark`).

---

## What changed

### 1. IBM Plex Sans on Monument (`index.html`, `index.css`)

**Before:** Monument prose used Inter; Console used IBM Plex Mono only.

**After:**

- Google Fonts link loads `IBM Plex Sans` (400/500/600) + `IBM Plex Mono` — Inter removed.
- Tailwind `--font-sans` → `'IBM Plex Sans'`.

**Why:** Kamino contract is one family (Plex Sans + Plex Mono). Monument and Console now share typographic DNA without re-skinning either surface.

---

### 2. Registration corner brackets on primary bays (`consoleTheme.css`)

**Before:** Bays had registration tick band under the header only.

**After:**

- `.console-bay:not(.console-bay-nested)::after` draws 12px L-brackets at all four corners via layered linear gradients.
- `position: relative` on `.console-bay` for pseudo-element anchoring.
- Nested bays (`.console-bay-nested`) excluded — brackets reserved for primary instrument bays.

**Why:** Corner brackets are the Kamino console signature detail (§2.2 kamino-design.md). CSS-only; no Bay.tsx markup change.

---

### 3. Console grain + vignette (`consoleTheme.css`)

**Before:** `.console-field` had graph-paper grid only — flat on large monitors.

**After:**

- `.console-root::before` — fixed SVG fractal-noise grain at ~3.5% opacity, `mix-blend-mode: overlay`.
- `.console-root::after` — radial vignette (`rgba(0,0,0,0.18)` at edges) for cockpit depth.
- `isolation: isolate` + `z-index` stacking so overlays sit behind header/content.
- `prefers-reduced-motion: reduce` lowers overlay opacity.

**Why:** Material depth on the measured field without animating layout. Mobile grid-hide rule unchanged (grain persists when grid is off).

---

### 4. Foundry status banner (`FoundryPlaceholderView.tsx`, `index.css`)

**Before:** Foundry opened like a normal Monument page with only inline "Not yet available" kicker.

**After:**

- Full-width hatched `.status-banner-inert` strip at page top (`-mx-6 px-6` bleed within shell).
- Copy: **"Not available — Mill is live today."** with **Open Mill →** link.
- Reuses Kamino inert hatch pattern (lighter than `.inert-frame` — banner, not wireframe).

**Why:** First-time Foundry visitors get an unmistakable dead-end signal before scrolling; live path is one click away.

---

### 5. Nav order + Foundry de-emphasis (`AppHeader.tsx`, `AppNavLink.tsx`)

**Before:** Nav order Foundry · Mill · How it works; Foundry styled same weight as live routes.

**After:**

- Order: **Mill · How it works · Foundry** (desktop + mobile).
- New `muted?: boolean` on `AppNavLink` — Foundry link uses `opacity-75` + `text-subtle` when inactive.
- `Soon` badge retained.

**Why:** Live product first (D-01); visual de-emphasis on inert route (review F-14 option C + B). Hero CTA remains dominant on landing.

---

### 6. Scoped dark theme FAQ copy (`geoPrerenderContent.json`)

**Before:** Mill FAQ answer said "The console forces dark theme."

**After:** "The console uses a scoped dark surface on /mill without changing your Monument theme preference."

Also names IBM Plex Sans explicitly for prose.

**Why:** Aligns prerender/JSON-LD/FAQ with UI-P1 scoped `.console-root.dark` behavior. Landing vs how-it-works dedupe was already done in UI-P2 (compare cards + canonical table).

---

## Files touched

| File | Action |
|------|--------|
| `index.html` | Plex Sans font link; Inter removed |
| `src/index.css` | `--font-sans`; `.status-banner-inert` utility |
| `src/lib/consoleTheme.css` | Brackets, grain, vignette, root stacking |
| `src/views/FoundryPlaceholderView.tsx` | Top status banner |
| `src/components/AppHeader.tsx` | Nav reorder |
| `src/components/AppNavLink.tsx` | `muted` prop |
| `src/lib/geoPrerenderContent.json` | Mill FAQ scoped-theme copy |
| `tests/e2e/smoke.spec.ts` | Banner, nav order, brackets tests |

**Not changed:** `Bay.tsx` (brackets via CSS), `LandingView.tsx` (P2 dedupe sufficient), live KaminoDeco `@font-face` in hero (optional — deferred).

---

## Verification

```bash
npm run typecheck   # pass
npm run lint        # pass
npm test            # 45 pass
npm run test:e2e    # 18 pass (3 new UI-P4 tests)
```

---

## Acceptance checklist (Phase 4)

| Criterion | Status |
|-----------|--------|
| Monument body font is IBM Plex Sans | ✅ |
| Primary console bays show corner brackets | ✅ e2e |
| Console field has grain + vignette overlays | ✅ |
| Foundry shows hatched status banner | ✅ e2e |
| Nav leads with Mill; Foundry de-emphasized | ✅ e2e |
| FAQ/prerender reflects scoped dark surface | ✅ |
| Header stability + pipeline smoke tests green | ✅ |

---

## Known limitations / follow-ups

| Item | Notes |
|------|-------|
| Live KaminoDeco `@font-face` in hero | Optional high-impact polish — needs public TTF + FOIT strategy |
| Header chamfer clip (10px top-right) | Kamino §2.2 nod — not implemented; low priority |
| Regenerate OG images post-font change | Visual refresh when convenient |
| Merge `MillStepIndicator` + `PipelineGraph` | Optional from UI-P3 |

---

## Decision log

| ID | Decision | Choice | Rationale |
|----|----------|--------|-----------|
| D-01 | Nav order | Mill-first + muted Foundry | Live path first; de-emphasize inert route |
| — | Brackets scope | Primary `.console-bay` only | Nested bays stay visually subordinate |
| — | Grain placement | `.console-root` fixed overlays | Full cockpit depth; no z-index fights in bays |
| — | Hero font proof | Deferred | Static images sufficient; no bundled public TTF yet |

---

## Handoff

The UI polish pass (Phases 1–4) is complete per [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md):

- **P1** — stable shell, scoped Mill dark
- **P2** — landing section rhythm
- **P3** — Mill stage bays, gate stability
- **P4** — Plex family, Kamino brackets/field depth, Foundry banner, nav IA, accurate GEO copy

Remaining items in the review (route cross-fade, chamfer header, live font hero, pipeline graph merge) are optional polish outside this pass.