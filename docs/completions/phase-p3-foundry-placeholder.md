# Phase P3 Completion — Foundry Placeholder

**Status:** Complete  
**Date:** 2026-07-02  
**Plan reference:** [v2-implementation-plan.md](../executing/v2-implementation-plan.md) — Phase 3  
**Version:** `0.4.1`

---

## Goal

`/foundry` coming-soon page and nav **Soon** badge — honest, inert, on-brand Monument surface.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `/foundry` loads; no API calls; no agent wiring | Pass | Static `FoundryPlaceholderView`; wireframe is `aria-hidden` CSS mock |
| Copy does not promise ship dates | Pass | "Not yet available", "not wired yet", "planned workflow" |
| Hatched/inert styling on placeholder and nav badge | Pass | `.inert-frame`, `.badge-inert` in `index.css`; E2E checks `.inert-frame` |
| CTA reaches `/mill` | Pass | E2E `foundry placeholder → Mill CTA` |
| `llms.txt` still lists Foundry under Deferred | Pass | Unchanged `public/llms.txt` |
| `npm run ci` green | Pass | 34 unit/browser + 6 e2e |

---

## What was built

| File | Role |
|------|------|
| `src/views/FoundryPlaceholderView.tsx` | Monument placeholder: headline, honest copy, CSS wireframe, CTAs |
| `src/index.css` | `.inert-frame`, `.inert-panel`, `.badge-inert` — Kamino ghost ring + hatched fill |
| `src/components/AppNavLink.tsx` | **Soon** badge uses `.badge-inert` |
| `src/App.tsx` | Replaces `FoundryInterim` stub with `FoundryPlaceholderView` |
| `src/views/LandingView.tsx` | Foundry chamber card hatched; link to `/foundry` |
| `tests/e2e/smoke.spec.ts` | `/foundry` render + CTA → `/mill` |

### Unchanged (already correct from P1)

- `src/lib/pageMeta.ts` — Foundry title/description per proposal §7.6
- `public/sitemap.xml` — `/foundry` entry
- `public/llms.txt` — Deferred section

---

## Design notes

- **Wireframe mock:** pure CSS — brief panel + 12-cell glyph grid + inert action pills. No images,
  no fetch, no agent imports.
- **Internal links:** "two-chamber workshop" → `/how-it-works`; primary CTA copy "Use the Mill today"
  per proposal §5.6.
- **Landing Foundry card:** upgraded from dashed `Coming soon` span to hatched `.inert-frame` with
  descriptive "Foundry placeholder" anchor.

---

## Handoff to P4

- How-it-works two-chamber section can cross-link to `/foundry` placeholder (currently minimal).
- GEO pillar rewrite should reference Foundry hatched treatment as live.
- Optional: prerender snippet for `/foundry` (not required by P3 exit checklist).

---

## Test counts

| Suite | Before P3 | After P3 |
|-------|-----------|----------|
| Unit/browser | 34 | 34 |
| E2E | 5 | 6 (+foundry CTA) |