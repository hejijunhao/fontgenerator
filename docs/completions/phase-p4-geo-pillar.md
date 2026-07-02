# Phase P4 Completion — GEO Pillar (How it works)

**Status:** Complete  
**Date:** 2026-07-02  
**Plan reference:** [v2-implementation-plan.md](../executing/v2-implementation-plan.md) — Phase 4  
**Version:** `0.5.0` — v2.0 platform evolution release

---

## Goal

`/how-it-works` becomes the AI-citation cornerstone — answer-first structure, tables, expanded FAQ,
full JSON-LD, per-route OG images.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Single `<h1>` on how-it-works | Pass | E2E `how-it-works page has single h1` |
| FAQ visible answers match `FAQPage` JSON-LD | Pass | Shared `howItWorksContent.ts` for page + `JsonLd.tsx` |
| Comparison tables in semantic `<table>` markup | Pass | Three-path + FontForge tables; E2E count = 2 |
| Appendix B content items | Pass | See GEO ship gate below |
| `npm run ci` green | Pass | 37 unit/browser + 12 e2e |
| Prerender contains FAQ text | Pass | E2E `prerendered how-it-works HTML contains FAQ answer` |

---

## What was built

| Area | Files |
|------|-------|
| Shared content | `src/lib/howItWorksContent.ts` — Quick Answer, FAQ (12), pipeline, tables, HowTo steps |
| Pillar page | `src/views/HowItWorksView.tsx` — full GEO rewrite |
| Schema | `src/components/layout/JsonLd.tsx` — `FAQPage`, `HowTo`, `SoftwareApplication`, `BreadcrumbList` |
| Meta | `src/lib/pageMeta.ts`, `src/hooks/usePageMeta.ts` — `og:image`, `article:modified_time` |
| OG assets | `scripts/generate-og-images.mjs`, `public/og/*.png` (1200×630, all four routes) |
| Prerender | `scripts/prerender-pillars.mjs` — full FAQ in SPA `index.html` + `/how-it-works/index.html` |
| Tests | `tests/unit/howItWorksContent.test.ts`, `tests/e2e/geo.spec.ts` |

---

## Page structure (shipped)

1. Version block — `Last updated: July 2026`
2. Quick Answer — 5 bullets
3. H1 — *How does Glyphmill turn PNG images into fonts?*
4. Two chambers — Foundry (hatched) + Mill (live links)
5. Pipeline — five question H2s
6. Three-path comparison table (cost, API, speed)
7. Glyphmill vs FontForge table
8. Methodology — `A-KaminoDeco.png`, threshold `0.60`, baseline `0.754385`, Potrace defaults
9. FAQ — 12 items, 50–100 words each
10. CTA — Open Mill

---

## Decisions

### Single source of truth for FAQ

**Choice:** `howItWorksContent.ts` exports FAQ strings used by `HowItWorksView`, `JsonLd`, and prerender script (duplicated in `.mjs` for build-time only — keep in sync).

**Why:** `FAQPage` schema must mirror visible answers exactly. Unit test enforces 10–12 items and word counts.

### Prerender both snippets in `index.html`

**Choice:** SPA fallback serves one `index.html` for all routes; inject landing + how-it-works snippets there.

**Why:** E2E proved `/how-it-works` request returned landing-only snippet before fix. Nested `dist/how-it-works/index.html` kept for hosts that serve path-specific files.

### OG images via build script

**Choice:** `npm run generate:og` using `@napi-rs/canvas` — landing composite, pipeline diagram, Mill console, Foundry hatched.

**Why:** Meets ≥1200×630 without manual asset handoff; runs before each `vite build`.

---

## GEO ship gate (Appendix A — complete)

**Technical**
- [x] AI crawlers allowed in `robots.txt`
- [x] `llms.txt` at domain root
- [x] Path-based URLs with SPA fallback
- [x] Prerendered HTML for `/` and `/how-it-works` contains Quick Answer + FAQ text
- [x] `sitemap.xml` lists all routes

**Head / Meta**
- [x] Unique title + description per route
- [x] Unique `og:image` per route (absolute URL, ≥1200×630)
- [x] `canonical` on each route

**Schema**
- [x] `SoftwareApplication` on landing
- [x] `FAQPage` + `HowTo` on how-it-works (content matches visible page)

**Content**
- [x] Single `<h1>` per page
- [x] Quick Answer in first 200 words on landing and how-it-works
- [x] Comparison table on how-it-works
- [x] Visible last-updated date on how-it-works
- [x] FAQ answers 50–100 words each

**Design** (from P2/P3)
- [x] Mill passes Kamino grayscale test
- [x] Foundry uses inert/hatched coming-soon treatment
- [x] `prefers-reduced-motion` respected on console animations

---

## v2.0 definition of done

All eight criteria from [v2-implementation-plan.md](../executing/v2-implementation-plan.md) §Definition of done are met. Foundry image gen remains post–v2.0 (Appendix B).

---

## Test counts

| Suite | Before P4 | After P4 |
|-------|-----------|----------|
| Unit/browser | 34 | 37 (+3 howItWorksContent) |
| E2E | 6 | 12 (+6 geo) |

---

## Manual follow-up (optional)

- Validate JSON-LD at [validator.schema.org](https://validator.schema.org) on deployed `/how-it-works`
- Lighthouse Performance on `/` — LCP ≤ 2.5s lab (best effort, not CI-gated)