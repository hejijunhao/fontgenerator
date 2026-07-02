# Changelog

All notable changes to Glyphmill are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Index

- **[0.5.1](#051--2026-07-02)** — Post-review hardening: shared GEO content, path redirects, build-time sitemap
- **[0.5.0](#050--2026-07-02)** — v2.0: GEO pillar, per-route OG images, platform evolution complete
- **[0.4.1](#041--2026-07-02)** — v2 Phase 3: Foundry placeholder at `/foundry`
- **[0.4.0](#040--2026-07-02)** — v2 Phase 2: Kamino console Mill at `/mill`
- **[0.3.0](#030--2026-07-02)** — v2 Phase 1: landing page, path routing, GEO static files
- **[0.2.1](#021--2026-07-02)** — Public "How it works" FAQ page and in-app navigation
- **[0.2.0](#020--2026-07-02)** — Glyphmill rebrand, light/dark mode, polished UI shell
- **[0.1.1](#011--2026-07-02)** — CI hardening, lint fixes, repo hygiene
- **[0.1.0](#010--2026-07-01)** — Initial v1: browser PNG → font pipeline with optional agent

---

## [0.5.1] — 2026-07-02

Post–v2.0 production review fixes — content accuracy, GEO drift prevention, crawler hardening,
and routing edge cases. No pipeline or agent behaviour changes.

### Why

A pre-ship review flagged stale public copy (test count still said 27 after v2 added 22 more
tests), duplicated FAQ strings between the TypeScript pillar page and the prerender build script
(drift risk for AI crawlers), client-only JSON-LD, hardcoded `sitemap.xml` / `robots.txt` domains,
and soft 404s on unknown paths. This patch closes those gaps before production deploy.

### Added

- **`geoPrerenderContent.json`** — single source for FAQ, HowTo steps, landing/how-it-works Quick
  Answer bullets, and test-count constants; imported by `howItWorksContent.ts` and
  `scripts/prerender-pillars.mjs`
- **`scripts/lib/geoContent.mjs`** + **`scripts/lib/siteUrl.mjs`** — shared build-time loaders
  for GEO JSON and `VITE_SITE_URL`
- **Prerender JSON-LD** — `FAQPage`, `HowTo`, and landing `@graph` injected into built HTML
  `<head>` (non-JS crawlers)
- **Build-time `sitemap.xml` + `robots.txt`** — written to `dist/` after Vite using
  `VITE_SITE_URL` (overrides copied `public/` defaults)
- **`resolvePathRedirect()`** — `/studio` → `/mill`; unknown paths → `/` via `replaceState`
- **Test coverage** — JSON ↔ TS FAQ parity unit test; e2e for `/studio` redirect, unknown-path
  redirect, prerender `FAQPage`, per-route `og:image`, updated test-count assertions

### Changed

- **`howItWorksContent.ts`** — FAQ, HowTo, and Quick Answer bullets load from JSON; exports
  `TEST_COUNTS`, `TEST_COUNT_TOTAL`, `TEST_COUNT_QUICK_ANSWER`, `TEST_COUNT_METHODOLOGY`
- **`HowItWorksView.tsx`** — methodology copy uses `TEST_COUNT_METHODOLOGY` (53 tests, not 27)
- **`prerender-pillars.mjs`** — reads shared JSON; generates sitemap/robots/JSON-LD (no hand-copied FAQ)
- **`useAppRoute.ts`** — applies canonical path redirects on init and `popstate`
- **`README.md`** — CI description lists 53 tests (40 Vitest + 13 Playwright)
- **`tests/e2e/geo.spec.ts`** — consolidated static-file checks; added redirect and OG coverage
- **`tests/e2e/smoke.spec.ts`** — removed duplicate GEO static-file test (covered in `geo.spec.ts`)

### Deploy notes

Set `VITE_SITE_URL` to the production origin on Vercel. The build now emits `dist/sitemap.xml`
and `dist/robots.txt` with that domain automatically — no manual edit of `public/` files required
for custom domains.

---

## [0.5.0] — 2026-07-02

**v2.0 platform evolution** — landing, console Mill, Foundry placeholder, GEO pillar. Breaking route
change from v0.2: `/` is landing, tool at `/mill`.

### Added

- **`howItWorksContent.ts`** — shared Quick Answer, 12 FAQ items, pipeline stages, comparison tables
- **GEO pillar rewrite** — `HowItWorksView`: version block, two chambers, question H2s, methodology,
  semantic tables
- **JSON-LD on how-it-works** — `FAQPage`, `HowTo`, `SoftwareApplication`, `BreadcrumbList`
- **Per-route OG images** — `public/og/*.png` (1200×630); `generate:og` build script
- **`article:modified_time`** on how-it-works; `og:image` on all routes via `usePageMeta`
- **Prerender FAQ** — full 12-item FAQ in crawler-visible HTML (SPA `index.html` + nested path)
- **Tests** — `howItWorksContent.test.ts`, `tests/e2e/geo.spec.ts` (6 cases)

### Changed

- **`JsonLd.tsx`** — how-it-works schema graph alongside landing
- **`pageMeta.ts`** — `ogImage` per route

### Completion notes

See [docs/completions/phase-p4-geo-pillar.md](completions/phase-p4-geo-pillar.md). Phases P1–P4
complete the [v2 implementation plan](executing/v2-implementation-plan.md).

---

## [0.4.1] — 2026-07-02

v2 Phase 3 — Foundry **placeholder** at `/foundry`. Static Monument page; no image gen or agent wiring.

### Added

- **`FoundryPlaceholderView`** — honest coming-soon copy, CSS wireframe mock (brief + glyph grid),
  **Use the Mill today** CTA
- **Inert styles** (`index.css`) — `.inert-frame`, `.badge-inert` hatched treatment per Kamino §5.7
- **E2E** — `/foundry` render + CTA navigates to `/mill`

### Changed

- **`App.tsx`** — replaces interim `FoundryInterim` stub
- **`AppNavLink`** — **Soon** badge uses hatched `.badge-inert`
- **`LandingView`** — Foundry chamber card hatched with link to placeholder

### Completion notes

See [docs/completions/phase-p3-foundry-placeholder.md](completions/phase-p3-foundry-placeholder.md).

---

## [0.4.0] — 2026-07-02

v2 Phase 2 — Kamino **console** for the Mill. UI-only; pipeline and agent behaviour unchanged.

### Why

The Mill needed a distinct “engine room” surface — dark instrument bays, mono readouts, staged
workflow — separate from the Monument landing and How it works pages.

### Added

- **`consoleTheme.css`** — Kamino console tokens scoped to `.console-root` on `/mill`
- **Console components** — `Bay`, `ReadoutLabel`, `StatusPill`, `PipelineGraph`, `Toast`
- **`MillStepIndicator`** — four stages (Source / Build / Review / Export) with registration ticks
- **`millStage.ts`** — derives active stage from project store state
- **`wasmReady.ts`** — WASM warm-up banner (“warming up the mill…”, ~1.2 MB note)
- **`useMillConsoleTheme`** — forces dark theme on Mill; restores user preference on exit
- **IBM Plex Mono** — loaded for console readouts and data fields

### Changed

- **`StudioView`** — restructured into SOURCE / BUILD / REVIEW / EXPORT bays; `AgentSettings` in
  disclosure; `PipelineGraph` replaces `ProgressSteps` in the UI
- **`PageShell`** — measured-field background on Mill; Monument pages unchanged
- **`AppHeader`** — theme toggle hidden on `/mill`
- **Mill components** — `DropZone`, gates, `RunView`, `ExportPanel`, `PreviewPanel`, `GlyphGrid`
  restyled under console scope (square bays, round buttons, state tokens)

### Tests

- `tests/unit/millStage.test.ts` — stage derivation (4 cases)
- E2E smoke unchanged — all flows at `/mill` still pass (34 unit/browser + 5 e2e)

---

## [0.3.0] — 2026-07-02

v2 Phase 1 — platform shape and discoverability. **Breaking:** `/` is now the landing page; the
font tool lives at **`/mill`**.

### Why

Glyphmill needed a proper entry point for new visitors, crawler-friendly URLs, and Foundry + Mill
framing before the console redesign (P2). Pipeline and agent behaviour stay unchanged.

### Added

- **`LandingView`** (`src/views/LandingView.tsx`) — Monument surface: Quick Answer, proof strip,
  two-chamber cards, FontForge comparison table, three-step HowTo, CTAs
- **Path-based routing** (`src/lib/navigation.ts`, `src/hooks/useAppRoute.ts`) — `/`, `/mill`,
  `/foundry`, `/how-it-works`; History API + `popstate`; legacy `#/` hash migrates to `/mill`
- **`PageShell`** (`src/components/layout/PageShell.tsx`) — Monument vs Console layout tiers
- **`pageMeta` + `usePageMeta`** — per-route title, description, canonical, Open Graph, Twitter
- **`JsonLd`** (`src/components/layout/JsonLd.tsx`) — landing `SoftwareApplication` + `Organization`
  schema
- **GEO static files** — `public/robots.txt`, `public/llms.txt`, `public/sitemap.xml`
- **Prerender snippets** (`scripts/prerender-pillars.mjs`) — crawler-visible Quick Answer in
  `dist/index.html` and `dist/how-it-works/index.html`
- **Proof assets in `public/`** — `A-KaminoDeco.png`, `golden/A-render.png`
- **Unit tests** — `tests/unit/navigation.test.ts` (5 cases)
- **E2E** — landing → Mill nav; GEO file smoke; prerender HTML check

### Changed

- **`AppHeader` / `AppFooter` / `AppNavLink`** — nav order Foundry (Soon) · Mill · How it works;
  logo → `/`; SPA click handling via `navigate()`
- **`App.tsx`** — route switch; interim `FoundryInterim` stub at `/foundry` until P3
- **Studio → Mill** in user-facing copy (component name `StudioView` unchanged)
- **`HowItWorksView`** — CTA "Open Mill" → `/mill`
- **`package.json`** — `0.3.0`; build runs prerender script after Vite
- **`.env.example`** — documents optional `VITE_SITE_URL`

### Unchanged

- Pipeline, agent, store, proxy, export — no functional changes

### Completion notes

See [docs/completions/phase-p1-ia-discoverability.md](completions/phase-p1-ia-discoverability.md).

---

## [0.2.1] — 2026-07-02

Public-facing explainer — **How it works** page that answers how deterministic conversion
works without an agent, and where the agent actually adds value.

### Why

Visitors (and deployers) need to understand that Glyphmill is not "AI generates fonts." The
no-agent path is real, free, and deterministic; the agent is optional parameter tuning and
visual QA. That story belonged in the product, not only in conversation or internal docs.

### Added

- **`HowItWorksView`** (`src/views/HowItWorksView.tsx`) — public FAQ / explainer with:
  - Hero: honest positioning ("fonts from images are math, not magic")
  - Five-stage pipeline breakdown (preprocess → trace → place → build → export)
  - "Parameters, not sorcery" callout — why threshold/baseline/turdsize matter
  - Three-path cards (no agent, agent, recipe replay) with cost and best-for guidance
  - Side-by-side no-agent vs agent comparison
  - Eight-item FAQ accordion (`<details>`) — browser vs server, recipes, gates, limitations
  - CTA back to Studio
- **Hash routing** (`src/lib/navigation.ts`, `src/hooks/useAppRoute.ts`) — `#/` Studio,
  `#/how-it-works` FAQ; no new router dependency; scroll-to-top on navigate
- **`AppNavLink`** (`src/components/AppNavLink.tsx`) — shared nav pill with active state
- **`AppFooter`** (`src/components/AppFooter.tsx`) — footer nav mirroring header links
- **`StudioView`** (`src/views/StudioView.tsx`) — studio UI extracted from `App.tsx`

### Changed

- **`AppHeader`** — primary nav (`How it works` · `Studio`); logo links home; tagline hidden
  on FAQ view to reduce noise
- **`App.tsx`** — thin shell: header + route switch + footer
- **`StudioView`** — idle hint and privacy note link to How it works
- **`index.css`** — styles for pipeline step numbers, FAQ accordion, callout accent bar

### Unchanged

- Pipeline, agent, store, and export behaviour — documentation-only surface area
- All 27 tests pass without modification

---

## [0.2.0] — 2026-07-02

Product identity and UI polish — rebrand to **Glyphmill**, add light/dark mode, and ship a
minimalist app shell that reads as a real tool rather than a scaffold.

### Why

The v1 pipeline worked but the surface still said "Font Generator" and looked like an internal
demo. This release establishes the public product name, gives users a theme they can control,
and unifies visual language across every panel so the app feels deploy-ready on Vercel.

### Added

- **`AppHeader`** (`src/components/AppHeader.tsx`) — full-width minimalist header with glyph
  mark, wide-tracked **GLYPHMILL** wordmark, tagline, and theme toggle
- **`ThemeToggle`** (`src/components/ThemeToggle.tsx`) — sun/moon control in the header
- **`useTheme`** (`src/hooks/useTheme.ts`) — React hook for theme state and persistence
- **Theme utilities** (`src/lib/theme.ts`) — `initTheme`, `applyTheme`, `persistTheme`,
  `toggleTheme`; storage key `glyphmill-theme`
- **Design token system** (`src/index.css`) — semantic Tailwind colors (`canvas`, `surface`,
  `ink`, `accent`, `muted`, `border`, `preview`, …) with `html.dark` overrides; shared
  component classes (`.panel`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.field-input`)
- **Flash prevention** — inline script in `index.html` applies theme class before React paint
- **Inter font** — loaded via Google Fonts in `index.html`

### Changed

- **Rebrand** — product name **Glyphmill** across UI title, OpenRouter `appName`
  (`src/agent/provider.ts`), and README
- **`App.tsx`** — new layout: sticky header + constrained main column; old inline header
  removed; buttons use shared `.btn-*` classes; footer tightened
- **`index.html`** — `<title>`, meta description, and theme bootstrap script updated
- **All UI components** — migrated from hard-coded `bg-white/…` and `text-ink/…` opacity
  classes to semantic tokens so light and dark modes stay consistent:
  - `DropZone`, `GlyphGrid`, `AgentSettings`, `ExportPanel`, `PreviewPanel`, `ProgressSteps`,
    `RunView`, `PartialFontWarning`, `Gate1Panel`, `Gate2Panel`
- **Gate panels** — amber (Gate 1) and emerald (Gate 2) accents kept; added `dark:` variants
  for borders, backgrounds, and text so approval flows remain readable at night
- **README** — rewritten for Glyphmill branding; documents light/dark mode, BYO-key-only
  deploy path, and `.env.example`

### Unchanged (by design)

- Pipeline, agent loop, proxy, store, and export logic — no functional changes
- All 27 tests pass without modification (e2e still targets aria labels and button names)

---

## [0.1.1] — 2026-07-02

Maintenance release — CI hardening, lint fixes, and repository hygiene.

### Fixed

- **ESLint** — `RunView` elapsed timer no longer calls `Date.now()` during render; uses an
  interval while the agent is running
- **ESLint** — removed unused variable in Playwright gate-flow smoke test
- **ESLint** — replaced `require('pngjs')` with ESM import in preprocess unit test

### Changed

- **CI script** — `npm run ci` now runs `lint` between build and tests
- **GitHub Actions** — added `.github/workflows/ci.yml` (build, lint, Vitest, Playwright on
  push/PR)
- **README** — clone command uses the real repository URL
- **`.gitignore`** — excludes `.vitest-attachments/`, `test-results/`, `playwright-report/`

### Added

- **`.env.example`** — documents `OPENROUTER_API_KEY` for local dev and Vercel deploy

### Removed

- Orphan `potrace-2.1.8.tgz` (unused; `potrace-wasm` comes from npm)
- Committed test artifacts (`.vitest-attachments/`, `test-results/.last-run.json`)

## [0.1.0] — 2026-07-01

Initial shippable v1 release. Browser-native PNG → font pipeline with optional Claude
agent, two human approval gates, and recipe replay.

### Added

- **Client-side conversion pipeline** — preprocess, Potrace WASM trace, place + metrics,
  opentype.js TTF build, render preview, and structural validation
- **Three build paths** — Generate (no agent), Run agent (vision QA via OpenRouter), Replay
  recipe (zero model calls)
- **Export formats** — TTF, WOFF2, and zip bundle download
- **Agent mode** — Claude via OpenRouter (`opus` / `sonnet` toggle), tool loop with Gate 1
  (trace) and Gate 2 (font render), BYO API key in Agent settings
- **Vercel Edge proxy** — stateless `/api/agent` forwarder with hosted-key rate limiting
  (30 req/min/IP) and BYO-key bypass
- **Batch upload** — multiple PNGs → one font (codepoints assigned by upload order)
- **Recipe system** — distill, copy, parse, and replay JSON recipes
  (`tests/fixtures/kamino-deco-recipe.json` as reference)
- **UI** — DropZone, GlyphGrid, ProgressSteps, Gate1/Gate2 panels, RunView, ExportPanel,
  PartialFontWarning, AgentSettings, PreviewPanel
- **CLI reference scripts** — `scripts/cli-reference/` for Phase 0 golden validation
- **Test suite (27 tests)** — Vitest unit + browser tests, Playwright e2e smoke
- **Docs** — README, proposal, product blueprint, implementation plan, phase completion notes

### Stack

React 19 · TypeScript 5.9 · Vite 7 · Tailwind 4 · Zustand · potrace-wasm · opentype.js ·
wawoff2 · Vercel AI SDK · OpenRouter

### Known limitations (v1)

- TTF is the master format; WOFF export is a stub (returns TTF bytes until a WASM encoder
  lands)
- `TraceParams` are stored in recipes but potrace-wasm uses library defaults
- Agent mode processes a single glyph; batch fonts use no-agent generate or recipe replay
- `wawoff2` adds a ~1.2 MB chunk on first load