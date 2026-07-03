# Phase VOID-D — Monument Views (Complete)

**Status:** Complete  
**Date:** 2026-07-03  
**Upstream spec:** [void-design-migration.md](../executing/void-design-migration.md) — Phase D  
**Depends on:** [phase-void-c-shared-layout.md](./phase-void-c-shared-layout.md)  
**Goal:** Landing, How it works, and Foundry fully VOID-styled; Kamino anti-patterns removed from monument routes.

---

## Problem statement

Monument routes still used Kamino visual patterns after Phases A–C: `.section-band`, `.panel`, `.callout` left-border accents, symmetric `sm:grid-cols-3` grids, hatched `.inert-frame` / `.badge-inert`, and `.status-banner-inert`. GEO copy and section IDs were correct but the presentation violated VOID anti-patterns (colored side-border callouts, symmetrical 3-up feature grids).

Phase D restyles all three marketing/placeholder views while preserving GEO strings, CTA labels, section IDs, and navigation contracts.

---

## New CSS utilities — `src/index.css`

| Class | Purpose |
|-------|---------|
| `.card-static` | Card chrome without hover lift/glow |
| `.card-inert` | Dashed border + `surface-2` fill (replaces `.inert-frame` on monument routes) |
| `.card-highlight` | `primary-highlight` background card (replaces `.callout` left bar) |
| `.card-title` / `.card-desc` | Card typography helpers |
| `.announce` | Foundry status strip with pulse dot |
| `.details-card` | `<details>` styled as VOID card with `surface-2` hover/open |
| `.grid-2-plus-1` | Asymmetric 2+1 grid — 3rd child spans full width |
| `.pipeline-grid` | 2-column pipeline layout — items 3 and 5 span full width |
| `.section-muted` | Full-bleed `surface-2` band within PageShell padding |

---

## D1 — Landing (`LandingView.tsx`)

| Section | VOID treatment applied |
|---------|------------------------|
| `#hero` | `.hero` + `.hero-badge` (pulse dot) + `.hero-title` (GEO H1 unchanged) + `.hero-desc` + `.btn-primary` + `.btn-ghost`; proof in `.card-static` right column; Quick answers as `.details-card` |
| `#proof` | `.card-static` before/after images |
| `#chambers` | `.card` (Mill, hover glow) + `.card-inert` (Foundry dashed) |
| `#compare` | `.section-muted` band + `.grid-2-plus-1` (2 cards + 1 wide — **not** `grid-cols-3`) |
| `#steps` | `.grid-2-plus-1` staggered layout |
| `#cta` | `.card-highlight` — no `.callout::before` left bar |

**Removed from landing:** `.section-band`, `.section-band--hero`, `.section-band--muted`, `.panel`, `.callout`, `.inert-frame`, `.badge-inert`, negative margin hacks (`-mx-6`).

**GEO preserved:** H1 text, CTA "Try with sample letter A", section IDs, Quick Answer strings, compare deep link.

---

## D2 — How it works (`HowItWorksView.tsx`)

| Area | VOID treatment applied |
|------|------------------------|
| Header / Quick Answer | `.card-static` ordered list; `.hero-title` page H1; `.hero-desc` intro |
| Two chambers | `.card-inert` (Foundry) + `.card` (Mill) |
| Pipeline stages | `.pipeline-grid` of `.card-static` items (asymmetric spans) |
| Parameters callout | `.card-highlight` — no left accent bar |
| Three paths | Converted from table → `.grid-2-plus-1` of `.card-static` path cards |
| FontForge comparison | `.table-wrap` + `.table` (sole table on page) |
| Methodology | `.card-static` prose block |
| FAQ | `.details-card` with `surface-2` summary hover |
| Bottom CTA | `.card-highlight` + `.btn-primary` |

---

## D3 — Foundry (`FoundryPlaceholderView.tsx`)

| Area | VOID treatment applied |
|------|------------------------|
| Status strip | `.announce` + `.pulse-dot` (replaces `.status-banner-inert`) |
| Page intro | `.section-eyebrow`, `.hero-title`, `.hero-desc` |
| CTAs | `.btn-primary` + `.btn-secondary` |
| Wireframe | `.card-inert` dashed outer frame (replaces `.inert-frame`) |
| Bottom CTA | `.card-highlight` |

---

## E2E updates

| Test file | Change |
|-----------|--------|
| `smoke.spec.ts` | `.section-band--*` → `.hero` + `#compare .grid-2-plus-1`; `.status-banner-inert` → `.announce`; `.inert-frame` → `.card-inert` |
| `geo.spec.ts` | `main table` count `2` → `1` (three-path is now cards); added `.table-wrap` + `.grid-2-plus-1` assertions |

---

## Anti-pattern checklist

| Anti-pattern | Status |
|--------------|--------|
| `.callout::before` left borders | ✅ Removed from all monument views (`rg callout src/views` → no matches) |
| Symmetric 3-up compare grid | ✅ Replaced with `.grid-2-plus-1` |
| Symmetric 3-up steps grid | ✅ Replaced with `.grid-2-plus-1` |
| Kamino hatch inert frames on monument | ✅ Replaced with `.card-inert` dashed pattern |

---

## Files touched

| File | Action |
|------|--------|
| `src/index.css` | Added monument layout utilities |
| `src/views/LandingView.tsx` | **Rewritten** |
| `src/views/HowItWorksView.tsx` | **Rewritten** |
| `src/views/FoundryPlaceholderView.tsx` | **Rewritten** |
| `tests/e2e/smoke.spec.ts` | Updated VOID class assertions |
| `tests/e2e/geo.spec.ts` | Updated table count + card grid assertions |

**Not changed:** `geoPrerenderContent.json`, pipeline/store/agent logic, Mill (`StudioView`) — Phase E.

---

## Acceptance criteria

| Criterion | Result |
|-----------|--------|
| e2e `landing has distinct section chapters` | ✅ |
| e2e `landing → Mill navigation` | ✅ |
| e2e `foundry placeholder → Mill CTA` | ✅ |
| No `.callout::before` on monument routes | ✅ |
| Compare section not symmetric 3-up | ✅ `.grid-2-plus-1` |
| `npm run typecheck` / `lint` / `test` / `test:e2e` | ✅ |

---

## Visual state after Phase D

- **Landing / How it works / Foundry:** VOID dark-first cards, violet eyebrows, DM Serif headings, asymmetric grids, announce bar on Foundry
- **Mill:** Still Kamino console component classes (`.console-bay`, `.console-readout`, etc.) with `consoleTheme.css` imported but inactive — **Phase E** migrates the tool UI and deletes `consoleTheme.css`

---

## Next step

**Phase E — Mill tool UI:** Restyle StudioView and console components to VOID cards/badges/tables; delete `consoleTheme.css`; remove remaining `console-*` class names from `src/`.