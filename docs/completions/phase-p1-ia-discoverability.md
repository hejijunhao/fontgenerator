# Phase P1 Completion — IA, Routing & Discoverability

**Status:** Complete  
**Date:** 2026-07-02  
**Plan reference:** [v2-implementation-plan.md](../executing/v2-implementation-plan.md) — Phase 1  
**Version:** `0.3.0`

---

## Goal

Path-based multi-page app with landing, GEO static files, per-page meta, and prerendered pillar
HTML. Zero changes to pipeline/agent logic.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `/`, `/mill`, `/how-it-works` render correct views | Pass | `App.tsx` route switch; E2E nav + mill smoke |
| `/foundry` interim behaviour | Pass | `FoundryInterim` stub (full placeholder deferred to P3) |
| Path URLs, no hash in nav | Pass | `routeHref()` returns `/mill` etc.; `AppNavLink` uses `navigate()` |
| `npm run ci` green | Pass | 30 unit/browser + 5 e2e tests |
| `robots.txt`, `llms.txt`, `sitemap.xml` at root | Pass | E2E `GEO static files are served` |
| Prerendered `/` contains Quick Answer | Pass | `scripts/prerender-pillars.mjs`; E2E HTML check |
| Per-route title/description on client nav | Pass | `usePageMeta` updates `document.title` + meta tags |
| Landing JSON-LD | Pass | `JsonLd.tsx` on `route === 'landing'` |
| SPA fallback | Pass | Existing `vercel.json` rewrite unchanged |

---

## Decisions (why we built it this way)

### Router: thin History API, not react-router

**Choice:** Extend the existing `useAppRoute` hook pattern with `navigation.ts` helpers (`parsePath`,
`navigate`, `routeHref`).

**Why:** v0.2 already used a custom hash router; four static routes do not justify a new dependency.
`AppNavLink` calls `preventDefault` + `navigate()` for in-app transitions; plain `<a href>` on the
landing page still works with full reload (acceptable for CTAs).

### `VITE_SITE_URL`

**Choice:** Optional env var; `pageMeta.ts` falls back to `window.location.origin` in the browser and
`https://glyphmill.vercel.app` for static `sitemap.xml` / `robots.txt` defaults.

**Why:** Canonical and OG URLs must be absolute in production; preview deploys can omit the env var
and still get correct runtime origin from the client.

### Prerender: post-build snippet injection

**Choice:** `scripts/prerender-pillars.mjs` runs after `vite build`, injects a visually hidden
`<div data-prerender>` with Quick Answer / FAQ prose into `dist/index.html` and copies an augmented
shell to `dist/how-it-works/index.html`.

**Why:** GEO doc warns AI crawlers may not execute JS. Playwright-at-build was avoided for CI time
and complexity. Snippets use `<p>` not `<h1>` so they do not steal heading roles from the React app
(see bug fix below).

### Legacy hash migration

**Choice:** On first load, if `location.hash` starts with `#`, map `#/` → `/mill`, `#/how-it-works` →
`/how-it-works`, then `replaceState` and clear hash.

**Why:** v0.2 bookmarks used `#/`. **Bug found in QA:** empty `location.hash` (`''`) was initially
treated as legacy `#/`, which forced `/` to render the Mill. Fixed by requiring `hash.startsWith('#')`
before any legacy mapping.

### `/foundry` in P1

**Choice:** Route exists in nav (with **Soon** badge) and sitemap; view is a minimal `FoundryInterim`
stub, not the full hatched placeholder (P3).

**Why:** P1 exit checklist allowed interim behaviour; nav and IA need the chamber name early without
P3 design work.

### Studio → Mill (copy only)

**Choice:** User-facing label **Mill**; file/component `StudioView` unchanged.

**Why:** Reduces P1 diff scope; rename component in a later refactor if desired.

---

## What was built (file map)

### Routing & shell

| File | Role |
|------|------|
| `src/lib/navigation.ts` | `AppRoute`, `parsePath`, `parseLegacyHash`, `routeHref`, `navigate` |
| `src/hooks/useAppRoute.ts` | Pathname sync via `popstate`; legacy hash migration in `useState` init |
| `src/App.tsx` | Route switch: landing / mill / how-it-works / foundry interim |
| `src/components/layout/PageShell.tsx` | Monument `max-w-5xl`/`6xl` vs Mill full-bleed stub |

### Landing & meta

| File | Role |
|------|------|
| `src/views/LandingView.tsx` | GEO-structured Monument landing |
| `src/lib/pageMeta.ts` | Per-route titles, descriptions, `siteUrl()` |
| `src/hooks/usePageMeta.ts` | Injects title, meta, canonical, og:*, twitter:* on route change |
| `src/components/layout/JsonLd.tsx` | Landing `@graph` schema |

### Nav

| File | Role |
|------|------|
| `src/components/AppHeader.tsx` | Foundry · Mill · How it works; logo → `/`; route taglines |
| `src/components/AppFooter.tsx` | Matching footer nav |
| `src/components/AppNavLink.tsx` | SPA `navigate()` on click; optional **Soon** badge |

### GEO & build

| File | Role |
|------|------|
| `public/robots.txt` | AI crawler allows + sitemap pointer |
| `public/llms.txt` | Blockquote elevator pitch + core URLs |
| `public/sitemap.xml` | Four routes |
| `public/A-KaminoDeco.png` | Landing proof strip |
| `public/golden/A-render.png` | Landing proof strip |
| `scripts/prerender-pillars.mjs` | Post-build crawler snippets |
| `package.json` | `build` chain includes prerender |

### Tests

| File | Role |
|------|------|
| `tests/unit/navigation.test.ts` | Path parse, href round-trip, legacy hash |
| `tests/e2e/smoke.spec.ts` | `/mill` pipeline smoke; landing nav; GEO + prerender |

---

## Route table (after P1)

| Path | View | Surface |
|------|------|---------|
| `/` | `LandingView` | Monument |
| `/mill` | `StudioView` | Monument layout (console skin in P2) |
| `/how-it-works` | `HowItWorksView` | Monument (GEO pillar rewrite in P4) |
| `/foundry` | `FoundryInterim` | Monument stub → P3 placeholder |

---

## Breaking changes for users

| Before (v0.2) | After (v0.3) |
|---------------|--------------|
| `#/` = font tool | `/` = landing |
| `#/how-it-works` | `/how-it-works` |
| — | `/mill` = font tool |
| Hash `#/` still works once | Migrates to `/mill` via `replaceState` |

---

## Handoff to P2 (Console Mill)

- `PageShell` Mill branch is full-bleed stub — P2 adds `consoleTheme.css` and forces dark console on `/mill`.
- `StudioView` layout unchanged — P2 wraps content in `Bay` components and `MillStepIndicator`.
- Theme toggle remains on Monument routes; P2 should hide it on `/mill`.
- Landing and How it works links already point to `/mill`.

---

## Handoff to P3 (Foundry placeholder)

- Replace `FoundryInterim` in `App.tsx` with `FoundryPlaceholderView`.
- Nav **Soon** badge styling can move to Kamino inert/hatched pattern.
- `llms.txt` Deferred section already documents `/foundry`.

---

## Surprises / fixes during implementation

1. **Empty hash → Mill bug** — `parseLegacyHash('')` returned `'mill'`, breaking `/` landing. Fixed
   with `hash.startsWith('#')` guard.
2. **Prerender `<h1>` vs Playwright** — Hidden prerender headings shadowed accessible name queries.
   Switched prerender markup to `<p class="prerender-title">`.
3. **ESLint `set-state-in-effect`** — Legacy migration moved from `useEffect` to `useState` initializer
   + `history.replaceState`.

---

## Test counts

| Suite | Before P1 | After P1 |
|-------|-----------|----------|
| Unit | 25 | 30 (+5 navigation) |
| E2E | 2 | 5 (+landing nav, GEO, prerender) |

---

## GEO ship gate (P1 subset)

Items completed in P1 from Appendix A of [v2-implementation-plan.md](../executing/v2-implementation-plan.md):

- [x] AI crawlers allowed in `robots.txt`
- [x] `llms.txt` at domain root
- [x] Path-based URLs with SPA fallback
- [x] Prerendered HTML for `/` (and `/how-it-works` shell) contains Quick Answer text
- [x] `sitemap.xml` lists all routes
- [x] Unique title + description per route (client-side)
- [x] `SoftwareApplication` on landing (JSON-LD)
- [x] Single `<h1>` per React view on landing

Deferred to P4: per-route `og:image`, `FAQPage`/`HowTo` schema, expanded FAQ copy, comparison
tables on how-it-works.