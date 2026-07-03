# VOID Design System Migration — Glyphmill

**Status:** Ready for execution  
**Date:** 2026-07-02  
**Scope:** Full-site visual re-platform from Kamino dual-surface → VOID unified design language  
**Upstream spec:** [void-design-system.html](../plans/void-design-system.html)  
**Supersedes (visual layer only):** [ui-ux-polish-review.md](./ui-ux-polish-review.md) Phases UI-P1–P4, [kamino-design.md](../plans/kamino-design.md) console/monument tokens  

**Preserves:** v2 information architecture, UI-P3 Mill *behaviour* (stage bays, gates in REVIEW, sticky toolbar), GEO copy contracts, pipeline/agent/store logic.

---

## Executive summary

Glyphmill’s current UI is built on a **Kamino dual-surface** model: cream Monument pages (landing, how-it-works, foundry) and a warm-obsidian Console Mill with IBM Plex Mono readouts. UI-P1–P4 polished that split without replacing it.

The **VOID** design system is a single, dark-first browser-tool language: near-void canvas (`#07060b`), electric-violet accent (`#7c5cfc`), Geist + DM Serif Display + Geist Mono, card elevation, and explicit anti-patterns (no gradient buttons, no left-border callouts, no symmetrical 3-up grids).

This migration **replaces the visual layer entirely** while keeping routing, GEO strings, Mill workflow structure, and all functional code paths intact.

Estimated effort: **5 implementation phases · 4–6 PRs · ~40–60 files**.

Target release: **0.7.0** (changelog + `package.json` bump on completion).

---

## Goals

| Goal | Success criterion |
|------|-------------------|
| Unified VOID aesthetic | All routes use VOID tokens; no `console-root` / Kamino-specific CSS remains |
| Dark-first, light-capable | Default dark; `data-theme="light"` toggle works on every route including Mill |
| Typography contract | Geist body/UI; DM Serif Display for headings ≥24px; Geist Mono for data/code |
| VOID anti-patterns respected | No gradient CTAs, no colored left-border callouts, no symmetric 3-up feature grids |
| Behaviour preserved | Stage bays, gate placement, nav order (Mill-first), upload→generate→download |
| GEO / SEO preserved | Landing H1, CTA labels, prerender/FAQ strings unchanged |
| CI green | `npm run ci` passes; e2e updated for new header geometry and class names |

---

## Non-goals

- Pipeline, agent, WASM, store, export, or recipe logic changes
- React Router migration
- Foundry implementation
- Live KaminoDeco `@font-face` in hero (optional follow-up)
- OG image regeneration (post-deploy visual task)
- Pricing, paywall, accounts

---

## Architectural decisions

Resolve before Phase A starts. Recommended defaults in **bold**.

| ID | Question | Options | Recommendation |
|----|----------|---------|----------------|
| V-01 | Migration depth | Full VOID vs marketing-only VOID + keep Kamino Mill | **Full VOID** — one token system, delete `consoleTheme.css` |
| V-02 | Theme mechanism | `data-theme` only vs keep `html.dark` shim | **`data-theme` on `<html>`**; map Tailwind `dark:` variant to `[data-theme="dark"]` for compatibility |
| V-03 | Mill theme toggle | Keep locked icon vs full toggle on Mill | **Full toggle** — unified surface, no special-case lock |
| V-04 | Header layout | Keep UI-P1 tagline row vs VOID 56px single-row nav | **VOID 56px nav** — tagline moves to landing hero only; update e2e header test |
| V-05 | Default theme | Dark-first vs system-only | **Dark-first default** per VOID spec; respect `prefers-color-scheme` when no stored preference |
| V-06 | Semantic token mapping | Rename all Tailwind tokens vs map old names → VOID values | **Map existing names** (`canvas`, `ink`, `accent`, …) to VOID CSS variables — minimizes component churn |
| V-07 | Logo mark | VOID crosshair SVG vs keep A-glyph | **VOID-inspired mark** — crosshair frame + A glyph or “G” in violet |
| V-08 | Inert / Foundry styling | Kamino hatch vs VOID dashed empty-state | **VOID** — dashed borders + `surface-2` fill; badge uses `.badge-default` |

---

## Current → VOID mapping

### Surfaces

| Current (Kamino) | VOID token | Notes |
|------------------|------------|-------|
| `--color-canvas` | `--color-bg` | Page ground |
| `--color-surface-strong` | `--color-surface` | Cards, panels |
| `--color-surface` / `surface-muted` | `--color-surface-2` | Nested panels, hover |
| `--color-cream` (section bands) | `--color-surface-2` or `--color-primary-highlight` | Muted bands |
| `--color-ink` | `--color-text` | Body |
| `--color-muted` | `--color-text-muted` | Secondary copy |
| `--color-subtle` | `--color-text-faint` | Labels, eyebrows |
| `--color-accent` | `--color-primary` | CTAs, focus rings |
| `--color-accent-fg` | `#ffffff` / `--color-text-inverse` | On primary buttons |
| `--color-border` | `--color-border` | Card borders |
| `--color-input` | `--color-surface` + border | Inputs |

### Typography

| Role | Current | VOID |
|------|---------|------|
| Body / UI | IBM Plex Sans | Geist (`--font-body`) |
| Headings 24px+ | sans semibold | DM Serif Display (`--font-display`) |
| Mono / readouts | IBM Plex Mono | Geist Mono (`--font-mono`) |
| Wordmark | tracked GLYPHMILL | VOID `.nav-logo` pattern — uppercase, letter-spacing 0.12em |

### Components

| Current class | VOID replacement |
|---------------|------------------|
| `.btn-primary` | `.btn.btn-primary` — solid violet, `radius-md`, glow on hover |
| `.btn-secondary` | `.btn.btn-secondary` — `surface-2` fill |
| `.btn-ghost` | `.btn.btn-ghost` |
| `.panel` | `.card` — `radius-xl`, `shadow-card`, hover border glow |
| `.panel-heading` | `.subsection-title` or `.section-eyebrow` |
| `.callout` (+ left bar) | **Remove** — use `.card` on `primary-highlight` background |
| `.section-band--hero` | `.hero` + radial glow `::before` (≤15% opacity) |
| `.section-band--muted` | `.section` on `surface-2` background |
| `.inert-frame` | Dashed `.card` / `.empty-state` variant |
| `.badge-inert` | `.badge.badge-default` + optional hatch via `surface-3` |
| `.console-bay` | `.card` + `.section-eyebrow` kicker |
| `.console-readout` | `.section-eyebrow` or mono `.subsection-title code` |
| `.console-*` (all) | VOID card/badge/table/code patterns |

### Files to delete or gut

| File | Action |
|------|--------|
| `src/lib/consoleTheme.css` | **Delete** after Mill styles migrated to VOID |
| Kamino-specific rules in `index.css` | **Replace** with VOID component layer |

---

## VOID anti-patterns — enforcement checklist

From [void-design-system.html § Anti-patterns](../plans/void-design-system.html). Treat as **hard rules** during review:

| Anti-pattern | Glyphmill today | Fix |
|--------------|-----------------|-----|
| Gradient buttons | None (OK) | Keep solid `--color-primary` only |
| Purple orbs / neon blobs | None | Hero glow: single radial, max 15% opacity |
| Colored side-border cards | `.callout::before` left bar | Remove; use `primary-highlight` card |
| Icons in colored circles | None on landing | Keep icons bare |
| Centering everything | Hero partially centered | Left-align body; center only hero display title if needed |
| 3-up symmetrical feature grid | Compare highlights (3 cards), steps (3) | **Asymmetric 2+1** or staggered heights |
| Generic hero copy | Specific GEO H1 (keep) | Do not rewrite H1 |
| Multiple bright accents | Kamino warn/ok states | VOID semantic colors only for status |

---

## GEO & test contracts (must not break)

| Contract | Location | Rule |
|----------|----------|------|
| Landing H1 | `LandingView.tsx`, e2e | *“Glyphmill is a browser tool that converts PNG letter images into installable fonts.”* — unchanged |
| Primary CTA | `LandingView.tsx`, e2e | **“Try with sample letter A”** — unchanged |
| Quick Answer strings | `geoPrerenderContent.json` | DOM presence preserved (collapsible OK) |
| Compare deep link | e2e | **“See full comparison table →”** → `/how-it-works#fontforge-heading` |
| Section IDs | e2e | `#hero`, `#proof`, `#chambers`, `#compare`, `#steps`, `#cta` |
| Pipeline smoke | e2e | Upload → generate → TTF download |
| Gate flow | e2e | Gate 1/2 accept (scripted) |
| Nav order | e2e | Mill · How it works · Foundry; Foundry muted |
| Prerender FAQ | e2e `geo.spec.ts` | JSON-LD + FAQ strings from `geoPrerenderContent.json` |

**Update required:** `header height stable across routes` — VOID 56px desktop nav (no tagline row). Measure new stable height; assert variance ≤ 2px across routes.

---

## Implementation phases

### Phase A — Token foundation

**Goal:** VOID CSS variables and theme mechanism live; Tailwind semantics map to VOID; fonts load.

| Task | File(s) |
|------|---------|
| Extract VOID tokens (dark + light) | **Create** `src/lib/voidTokens.css` |
| Import tokens; map `@theme` semantic colors to VOID vars | `src/index.css` |
| Port VOID component primitives (btn, card, badge, table, section, hero, input, focus) | `src/index.css` `@layer components` |
| Replace `@custom-variant dark` to match `[data-theme="dark"]` | `src/index.css` |
| `applyTheme` / `initTheme` use `document.documentElement.setAttribute('data-theme', theme)` | `src/lib/theme.ts` |
| Bootstrap script: `data-theme` before paint (not `classList.add('dark')`) | `index.html` |
| Font link: Geist, Geist Mono, DM Serif Display | `index.html` |
| Fluid type scale (`--text-xs` … `--text-hero`) as CSS vars | `voidTokens.css` |
| Add `--font-display`, `--font-body`, `--font-mono` to Tailwind | `index.css` `@theme` |

**Acceptance**

- [ ] Toggle light/dark updates all routes without flash
- [ ] `npm run typecheck` passes
- [ ] Body renders with VOID dark palette on `/` before any view changes

---

### Phase B — App shell

**Goal:** Header, footer, nav, page shell match VOID nav/layout patterns.

| Task | File(s) |
|------|---------|
| Restructure header: 56px sticky blur nav, VOID logo, nav links, theme toggle | `src/components/AppHeader.tsx` |
| Remove tagline row and `TAGLINES` map (copy lives in landing hero) | `AppHeader.tsx` |
| VOID nav-link styling; active = `surface-2` background | `src/components/AppNavLink.tsx` |
| Foundry `Soon` → VOID `.badge.badge-default` | `AppNavLink.tsx` |
| Theme toggle: VOID `.theme-toggle`; remove `locked` prop | `src/components/ThemeToggle.tsx` |
| Footer: minimal VOID styling on `surface-2` | `src/components/AppFooter.tsx` |
| PageShell: `--content-wide` (1200px) landing, `--content-default` (960px) elsewhere; remove `console-field` | `src/components/layout/PageShell.tsx` |
| Remove `console-root dark` route wrapper | `src/App.tsx` |
| Skip link as first focusable element (VOID a11y) | `App.tsx` or `index.html` |

**Acceptance**

- [ ] Header height stable across routes (update e2e thresholds)
- [ ] Mill route has working theme toggle (not locked)
- [ ] Mobile nav: VOID pattern (hidden links → mobile row or hamburger — match VOID `@media` behaviour)

---

### Phase C — Shared layout components

**Goal:** Section grammar and headings use VOID editorial + UI type split.

| Task | File(s) |
|------|---------|
| Rewrite `SectionHeading` → `section-eyebrow` + DM Serif `section-title` + optional `section-desc` | `src/components/layout/SectionHeading.tsx` |
| Add utility classes if needed: `.section`, `.subsection`, `.subsection-title` | `index.css` |

**Acceptance**

- [ ] How it works section headings render in DM Serif at `text-2xl` scale
- [ ] Eyebrow shows violet rule `::before` per VOID spec

---

### Phase D — Monument views

**Goal:** Landing, How it works, Foundry fully VOID-styled; anti-patterns addressed.

#### D1 — Landing (`LandingView.tsx`)

| Section | VOID treatment |
|---------|----------------|
| `#hero` | `.hero` — badge with pulse dot, DM Serif H1 (keep GEO text), `.hero-desc`, single `.btn-primary`, ghost link to how-it-works; proof in `.card` right column |
| `#proof` | Full-width `.card` with before/after images |
| `#chambers` | Two `.card` grid — live Mill card gets hover glow; Foundry dashed inert |
| `#compare` | **Asymmetric layout** — 2 cards + 1 wide card (not 3 equal columns); link to full table |
| `#steps` | Staggered cards or 2+1 grid (not identical 3-column) |
| `#cta` | `.card` on `primary-highlight` — no left accent bar |
| Quick answers | `<details>` styled as VOID card |

#### D2 — How it works (`HowItWorksView.tsx`)

| Area | VOID treatment |
|------|----------------|
| Header / Quick Answer | `.card` ordered list |
| Pipeline stages | `.card-grid` asymmetric |
| FontForge table | `.table-wrap` + `.table` |
| FAQ | `<details>` cards with hover `surface-2` |
| Three-path cards | 2+1 or varying height cards |

#### D3 — Foundry (`FoundryPlaceholderView.tsx`)

| Area | VOID treatment |
|------|----------------|
| Status strip | VOID announce-style bar (`primary-highlight` + pulse dot) |
| Wireframe | Dashed `.card` empty-state pattern |
| CTAs | `.btn-primary` + `.btn-secondary` |

**Acceptance**

- [ ] e2e `landing has distinct section chapters` passes
- [ ] e2e `landing → Mill navigation` passes
- [ ] e2e `foundry placeholder → Mill CTA` passes
- [ ] No `.callout::before` left borders remain
- [ ] Compare section is not a symmetric 3-up grid

---

### Phase E — Mill tool UI

**Goal:** Studio and console components use VOID cards, badges, tables, code blocks; Kamino console CSS removed.

| Task | File(s) |
|------|---------|
| Delete `consoleTheme.css`; remove import from `main.tsx` | `src/lib/consoleTheme.css`, `src/main.tsx` |
| `StudioView` — restyle toolbar row as VOID sticky bar on `surface` | `src/views/StudioView.tsx` |
| `StageBay` / `Bay` — collapsed strip + expanded `.card` | `StageBay.tsx`, `Bay.tsx` |
| `ReadoutLabel` → VOID eyebrow / mono label | `ReadoutLabel.tsx` |
| `StatusPill` → `.badge` variants (`badge-primary`, `badge-warning`, etc.) | `StatusPill.tsx` |
| `PipelineGraph` → VOID tags or small badges on `surface-3` | `PipelineGraph.tsx` |
| `MillStepIndicator` → VOID tabs or step badges | `MillStepIndicator.tsx` |
| `DropZone` → dashed `.card` / `.empty-state` | `DropZone.tsx` |
| `Gate1Panel` / `Gate2Panel` → `.card` with `badge-warning` / `badge-success` borders | Gate panels |
| `GlyphGrid`, `PreviewPanel`, `ExportPanel`, `RunView`, `AgentSettings` | respective files |
| `Toast` → VOID surface card with left primary accent (2px, not full callout bar) | `Toast.tsx` |
| Gate min-height slots preserved | `StudioView.tsx`, gate panels |

**Acceptance**

- [ ] e2e `mill collapses inactive stage bays` passes
- [ ] e2e `no-agent upload → generate → TTF download` passes
- [ ] e2e `gate panels accept flow` passes
- [ ] e2e `mill primary bays wear registration brackets` → **replace** with VOID card border/glow assertion
- [ ] No `console-` class names remain in `src/` (grep check)

---

### Phase F — Tests, docs, release

| Task | File(s) |
|------|---------|
| Update header stability e2e for VOID geometry | `tests/e2e/smoke.spec.ts` |
| Replace registration-bracket test with VOID card test | `smoke.spec.ts` |
| Grep CI: no stale `console-`, `inert-frame` (unless intentionally kept) | — |
| Changelog **0.7.0** — VOID migration summary | `docs/changelog.md` |
| Completion doc | `docs/completions/phase-void-design-migration.md` |
| Version bump | `package.json` → `0.7.0` |
| README test count if changed | `README.md` |
| Mark `ui-ux-polish-review.md` status: superseded by VOID migration | `docs/executing/ui-ux-polish-review.md` |

**Acceptance**

- [ ] `npm run ci` green
- [ ] Manual pass: `/`, `/mill`, `/how-it-works`, `/foundry` in dark + light

---

## File inventory (expected touch list)

### Create

- `src/lib/voidTokens.css`
- `docs/completions/phase-void-design-migration.md`

### Delete

- `src/lib/consoleTheme.css`

### Major rewrite

- `src/index.css`
- `src/components/AppHeader.tsx`
- `src/views/LandingView.tsx`
- `src/views/HowItWorksView.tsx`
- `src/views/FoundryPlaceholderView.tsx`
- `src/views/StudioView.tsx`

### Moderate update

- `src/lib/theme.ts`
- `src/components/ThemeToggle.tsx`
- `src/components/AppNavLink.tsx`
- `src/components/AppFooter.tsx`
- `src/components/layout/PageShell.tsx`
- `src/components/layout/SectionHeading.tsx`
- `src/App.tsx`
- `index.html`
- `src/main.tsx`
- `src/components/console/*` (StageBay, Bay, ReadoutLabel, StatusPill, PipelineGraph, Toast)
- `src/components/layout/MillStepIndicator.tsx`
- `src/components/DropZone.tsx`, `Gate1Panel.tsx`, `Gate2Panel.tsx`, `GlyphGrid.tsx`, `PreviewPanel.tsx`, `ExportPanel.tsx`, `RunView.tsx`, `AgentSettings.tsx`, `PartialFontWarning.tsx`
- `tests/e2e/smoke.spec.ts`
- `docs/changelog.md`, `package.json`, `README.md`

### Do not change

- `src/pipeline/**`, `src/agent/**`, `src/store/**`
- `src/lib/geoPrerenderContent.json` (unless FAQ theme wording needs VOID accuracy)
- `scripts/prerender-pillars.mjs` (unless class names in snippets matter)

---

## PR stack (recommended)

```
PR-1  Phase A          voidTokens + index.css + theme.ts + index.html fonts
PR-2  Phase B + C      shell + SectionHeading
PR-3  Phase D          Landing + HowItWorks + Foundry
PR-4  Phase E          Mill / Studio + delete consoleTheme.css
PR-5  Phase F          e2e + changelog + completion doc
```

Each PR must keep `npm run ci` green. PR-1 may look visually mixed until PR-3/4 complete — acceptable if tests pass.

---

## Verification commands

```bash
npm run typecheck
npm run lint
npm test
npm run build:e2e
npm run test:e2e
npm run ci
```

### Manual checklist

| Route | Dark | Light | Checks |
|-------|------|-------|--------|
| `/` | ✓ | ✓ | Hero glow subtle; 1 primary CTA; proof visible on lg |
| `/mill` | ✓ | ✓ | Upload, collapse bays, generate, theme toggle works |
| `/how-it-works` | ✓ | ✓ | Table readable; FAQ opens |
| `/foundry` | ✓ | ✓ | Status bar; wireframe dashed |

---

## Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Geist not loading from Google Fonts | FOIT / fallback to system | Verify network in dev; add `Inter` fallback in `--font-body` per VOID spec |
| Large diff hard to review | Missed Kamino class | `rg 'console-|inert-frame|callout' src/` before merge |
| Header e2e failure | CI red | Update test in Phase F with measured VOID heights |
| Light mode on Mill low contrast | Readability | Test gate panels and drop zone in light theme explicitly |
| OG images still Kamino-colored | Social preview mismatch | Document as post-deploy task |

---

## Decision log

| ID | Choice | Date | Notes |
|----|--------|------|-------|
| V-01 | _TBD_ | | |
| V-02 | _TBD_ | | |
| V-03 | _TBD_ | | |
| V-04 | _TBD_ | | |
| V-05 | _TBD_ | | |
| V-06 | _TBD_ | | |
| V-07 | _TBD_ | | |
| V-08 | _TBD_ | | |

---

## References

- [void-design-system.html](../plans/void-design-system.html) — canonical tokens, components, anti-patterns
- [ui-ux-polish-review.md](./ui-ux-polish-review.md) — behaviour to preserve (stage bays, CTA hierarchy, nav order)
- [geo-best-practices.md](../plans/geo-best-practices.md) — answer-first copy constraints
- [viral-product-rough-guidelines.md](../plans/viral-product-rough-guidelines.md) — demo-first hero (aligned with VOID hero pattern)
- [kamino-design.md](../plans/kamino-design.md) — **superseded** for visual tokens; keep for historical context
- [phase-ui-p1-shell-stability.md](../completions/phase-ui-p1-shell-stability.md) — header test intent (geometry stability, not Kamino-specific heights)
- [phase-ui-p3-mill-micro-ux.md](../completions/phase-ui-p3-mill-micro-ux.md) — Mill behaviour contract

---

*Next step:* Resolve V-01–V-08 in the decision log, then execute Phase A (token foundation).