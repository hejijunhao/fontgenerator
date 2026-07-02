# UI/UX & Aesthetic Polish Review — Glyphmill

**Status:** Draft for execution  
**Date:** 2026-07-02  
**Scope:** Full-site visual, interaction, and information-architecture review  
**Upstream:** [platform-evolution-proposal.md](./platform-evolution-proposal.md) · [v2-implementation-plan.md](./v2-implementation-plan.md) · [kamino-design.md](../plans/kamino-design.md)

---

## Executive summary

Glyphmill v2.0 shipped the right **information architecture** (Landing · Foundry · Mill · How it works) and a credible **dual-surface split** (Monument marketing vs Console Mill). Functionally it works; aesthetically it still reads as a **single vertical document** on marketing pages and a **long scrolling form** in the Mill, with **jarring transitions** between routes.

The most noticeable glitch — header height and chrome shifting when toggling Foundry ↔ Mill — has **identifiable root causes** in `AppHeader.tsx`, `PageShell.tsx`, and `useMillConsoleTheme.ts`. These are fixable without redesigning the product.

The highest-leverage polish pass is:

1. **Stabilize the app shell** (fixed header geometry, predictable route transitions).
2. **Give the landing page real section rhythm** (hero band, proof strip, alternating surfaces, anchored nav).
3. **Tighten Mill layout** (collapse empty bays, unify Preview into bay grammar, reduce vertical jump during gates).
4. **Close Kamino design gaps incrementally** (registration brackets, type pairing, chamfer header) without a full re-skin.

Estimated effort: **3–5 focused PRs** (shell stability → landing sections → Mill micro-UX → design-system tokens).

---

## What was reviewed

| Area | Files / surfaces |
|------|------------------|
| App shell | `App.tsx`, `AppHeader.tsx`, `AppFooter.tsx`, `PageShell.tsx`, `AppNavLink.tsx` |
| Routing & scroll | `useAppRoute.ts`, `navigation.ts`, `useMillConsoleTheme.ts` |
| Monument pages | `LandingView.tsx`, `HowItWorksView.tsx`, `FoundryPlaceholderView.tsx` |
| Mill console | `StudioView.tsx`, `console/*`, `consoleTheme.css`, pipeline components |
| Design tokens | `index.css`, `consoleTheme.css`, `theme.ts` |
| Meta / OG | `pageMeta.ts`, `index.html`, prerender scripts |
| Tests | `tests/e2e/smoke.spec.ts` (layout regressions to preserve) |

---

## Current state snapshot

### Routes

| Route | Surface | Theme | Max width | Vertical padding |
|-------|---------|-------|-----------|------------------|
| `/` | Monument | User light/dark | `max-w-6xl` | `py-10` |
| `/foundry` | Monument | User light/dark | `max-w-5xl` | `py-10` |
| `/how-it-works` | Monument | User light/dark | `max-w-5xl` | `py-10` |
| `/mill` | Console | **Forced dark** | `max-w-5xl` + grid field | `py-6` |

### Visual identity today

- **Monument:** Inter, cream canvas (`#f6f5f0`), rounded `rounded-2xl` panels, soft borders.
- **Console:** Warm obsidian ground, square bays, IBM Plex Mono readouts (via CSS only), round pill buttons.
- **Bridge:** Shared glyph mark, `GLYPHMILL` wordmark, accent inversion in dark mode.

The dual-surface concept is sound. The **transition between surfaces is not yet designed** — it feels like two different apps sharing a header.

---

## Findings

Severity: **P0** = user-visible glitch / trust hit · **P1** = polish that materially improves first impression · **P2** = refinement · **P3** = nice-to-have

### P0 — App shell instability (header shift, route jank)

#### F-01: Header height changes per route

**Symptom:** Switching Foundry ↔ Mill (and Mill ↔ How it works) causes the header to grow/shrink; content jumps.

**Root causes (stacked):**

1. **Conditional tagline** in `AppHeader.tsx` — rendered only on `landing` and `mill`, absent on `foundry` and `how-it-works`:

```9:16:src/components/AppHeader.tsx
  const tagline =
    route === 'mill'
      ? 'Turn letter images into production-ready fonts — in your browser.'
      : route === 'landing'
        ? 'PNG letter art in. Installable fonts out.'
        : null
```

2. **Conditional theme toggle** — hidden on Mill, visible on all Monument routes (`route !== 'mill'`). Right-side nav width changes by ~36px + gap.

3. **Tagline nested inside logo link** — the clickable logo block grows vertically when tagline is present; the right column does not compensate, so the header's visual balance shifts.

4. **Mobile nav duplicate row** (`sm:hidden`, `mt-4`) — consistent across routes but adds a second nav band on small screens; combined with tagline removal, mobile header delta is large.

5. **PageShell padding mismatch** — Mill uses `py-6`, Monument uses `py-10` → content appears to "jump" below the header on route change.

6. **Forced theme swap on Mill** — `useMillConsoleTheme` adds/removes `document.documentElement.classList.add('dark')` on enter/exit. Users with light preference see a flash and header background token swap (`bg-canvas/90` → console override in `.console-root header`).

**Proposal — stable shell contract:**

| Element | Rule |
|---------|------|
| Header outer box | Fixed min-height (recommend **96px desktop / 112px with mobile nav**) — always reserve tagline row |
| Tagline slot | Always render a tagline element; use `visibility: hidden` or zero-opacity placeholder text on routes without copy, OR move tagline out of header into page hero only |
| Theme toggle | Always occupy space in header (show disabled/locked icon on Mill with tooltip "Console uses dark theme") OR move toggle to footer on all routes |
| Logo link | Logo + wordmark only — tagline is not part of hit target |
| Route transition | Cross-fade `opacity` on main content (150–200ms); optional `prefers-reduced-motion` bypass |
| Theme transition | Apply console tokens via `.console-root` only; **do not** toggle global `dark` class when entering Mill if user prefers light on Monument — instead scope dark tokens under `.console-root` without touching `html.dark` |

#### F-02: Abrupt surface switch (Monument ↔ Console)

**Symptom:** Mill feels like entering a different product; background, typography, button shape, and density all change instantly.

**Contributors:**
- `App.tsx` adds `console-root` class only on Mill.
- `consoleTheme.css` overrides global `--color-*` tokens inside `.console-root`.
- Inter → Plex Mono shift is sudden; grid field appears/disappears.

**Proposal:**
- Add a **200ms background-color transition** on `body` / `.console-root` (respect `prefers-reduced-motion`).
- Keep Monument header visible in Mill but apply console header styling (already partially done via `.console-root header`) — ensure **same header height** as Monument.
- Optional: subtle "Entering Mill" isn't needed if shell is stable; stability beats animation here.

#### F-03: Scroll behavior inconsistent

`useAppRoute.ts` scrolls smoothly only for `how-it-works`, auto for others. Route changes from Foundry → Mill with uploaded glyphs could disorient users who were mid-page.

**Proposal:** `behavior: 'instant'` for Mill/Foundry nav; smooth only for in-page anchor jumps on long pages.

---

### P1 — Landing feels like "one page, no sections"

#### F-04: Semantic sections lack visual architecture

`LandingView.tsx` has six `<section>` elements separated only by `gap-14`. Every block uses the same cream canvas + `.panel` vocabulary. There is no:

- Full-bleed hero band (distinct background or top gradient)
- Alternating section surfaces (cream vs white vs subtle border-top bands)
- Section kickers / `SectionHeading` component (How it works already has this; landing does not)
- In-page section nav or scroll-spy
- Visual "chapter break" between marketing story and comparison tables

**User perception:** One long readme, not a designed marketing site.

**Proposal — landing section map:**

| # | Section ID | Purpose | Visual treatment |
|---|------------|---------|------------------|
| 1 | `hero` | Answer-first headline + primary CTA | Full-bleed band, larger type, proof thumbnail inline |
| 2 | `proof` | Before/after Kamino A | Contained panel, optional subtle grid behind |
| 3 | `chambers` | Foundry + Mill story | Two-up cards; live vs inert contrast (already started) |
| 4 | `compare` | FontForge table | Band with `bg-surface-strong` or inverted strip |
| 5 | `steps` | Three steps | Horizontal stepper on desktop, numbered cards on mobile |
| 6 | `cta` | Final Open Mill | Accent band / callout with left rule (reuse `.callout`) |

**Shared component:** Extract `SectionHeading` from `HowItWorksView.tsx` → `components/layout/SectionHeading.tsx`; use on landing + foundry.

**Quick Answer block:** Move from hero into a collapsible "TL;DR for search engines" `<details>` or slim sidebar on desktop — keeps GEO value without dominating the hero (see F-15).

#### F-05: Hero does not show the product first

Viral-product and Kamino monument guidance: **demo before paragraphs**. Today the hero is text + bullet list + buttons. The proof images are section 2.

**Proposal:**
- Hero layout: **left** = headline + one sentence + single CTA · **right** = animated or static before/after pair (smaller than full proof section).
- Secondary link "How it works" as text link, not equal-weight button (reduce decision paralysis).
- CTA copy: **"Try with sample letter A"** (deep-links to `/mill` with hint text) vs generic "Open Mill".

#### F-06: CTA repetition without hierarchy

"Open Mill" appears **four times** on landing with identical styling. Reads as template filler.

**Proposal:** One primary CTA in hero; secondary sections use text links or `btn-secondary`; final CTA band uses primary again.

#### F-07: Foundry placeholder is structurally fine but visually orphaned

`FoundryPlaceholderView.tsx` matches landing typography but lacks section rhythm (same gap-only separation). Wireframe is good; page needs a **status banner** (hatched full-width) at top: "Not available — Mill is live today."

---

### P1 — Mill console UX

#### F-08: Vertical scroll is one endless column

All four bays (SOURCE · BUILD · REVIEW · EXPORT) are always mounted. Before first generate:

- SOURCE + idle hint = tall
- BUILD = buttons + collapsed agent settings + privacy wall of text
- REVIEW = empty or "waiting"
- EXPORT = disabled copy

**Proposal:**
- **Progressive disclosure by `deriveMillStage`:** collapse inactive bays to a single-line summary row (accordion or `details`); expand active stage automatically.
- Move **PrivacyNote** to footer link or one-time dismissible callout — it adds ~8 lines to BUILD on every visit.
- **IdleHint** inside SOURCE bay duplicates hero messaging — shorten to one line + link.

#### F-09: PreviewPanel breaks bay grammar

`PreviewPanel` uses `.panel` inside REVIEW bay (bay-in-panel nesting). Visually inconsistent with console readout labels elsewhere.

**Proposal:** Either flatten Preview into REVIEW bay children without inner panel, or style Preview as `console-bay-nested` with readout captions matching Gate panels.

#### F-10: Layout jump during agent gates

Gate 1/2 panels inject large grids into BUILD bay; status pill appears in step indicator row; REVIEW may hide preview during gates. The viewport jumps several hundred pixels.

**Proposal:**
- Reserve min-height for gate region when `atGate`.
- Sticky sub-header inside Mill: stage indicator + status pill `position: sticky; top: [header-height]`.
- Consider **modal sheet** or **side drawer** for gates so BUILD bay footprint stays stable (larger change; optional P2).

#### F-11: Agent settings buried in `<details>`

Discoverability is low for a core differentiator. Default closed is correct for no-agent path, but first "Run agent" could auto-expand once (localStorage flag).

#### F-12: GlyphGrid alert colors clash in console

`GlyphGrid.tsx` uses Tailwind `amber-50` / `amber-950` alert styling — designed for Monument light/dark, not console tokens. In Mill, alert looks like a foreign widget.

**Proposal:** Map to `--state-warn` console badge pattern (`.console-badge-warn`).

#### F-13: Unused / duplicate progress UI

`ProgressSteps.tsx` exists but is unused. Mill has both `MillStepIndicator` (stage) and `PipelineGraph` (step abbreviations). Users see two progress metaphors.

**Proposal:** Merge into one component: stages light up; during run, expand active stage to show pipeline nodes inline.

---

### P2 — Design system & Kamino contract gaps

Reference: [kamino-design.md](../plans/kamino-design.md)

| Contract item | Current | Gap |
|---------------|---------|-----|
| Header height 48px (6u) | Variable (~72–120px) | F-01 |
| Registration brackets on bays | Registration band only (tick line) | Missing corner brackets — signature detail |
| IBM Plex Sans for prose | Inter | Monument not using Plex pairing |
| Display serif (Marcellus) on monument | None | Optional for Glyphmill — could use a single Google font for wordmark only |
| Grain + vignette on console ground | Grid only; no grain | Field feels flat on large monitors |
| Chamfer on shell header | Square | Minor brand nod available |
| `square = built, round = alive` | Mostly followed in Mill | Monument buttons are `rounded-xl` — acceptable for marketing surface |

**Proposal (phased):**
- **PR-A:** Switch Monument body font to IBM Plex Sans (already loaded for Mono) — unifies family.
- **PR-B:** Add registration corner brackets to `Bay.tsx` via pseudo-elements (CSS only).
- **PR-C:** Console grain overlay at 3% on `.console-field` (performance test on mobile).

---

### P2 — Navigation & IA

#### F-14: Nav order and labeling

Current: **Foundry · Mill · How it works**. Foundry-first makes sense for story, but live product is Mill. First-time users may click Foundry and hit a dead end.

**Proposal options (pick one):**
- **A)** Reorder nav: **Mill · How it works · Foundry** — prioritizes live path.
- **B)** Keep order but style Foundry link as visually de-emphasized (already has Soon badge).
- **C)** Landing hero CTA is dominant; nav order matters less if hero is fixed (recommended combo: C + B).

#### F-15: Content duplication across routes

`QUICK_ANSWER` and `FONTFORGE_ROWS` appear on both Landing and How it works. Hurts freshness and makes each page feel like the same doc.

**Proposal:**
- Landing: short hero + link "Read the full pipeline explanation →"
- How it works: canonical long-form; landing tables become summary cards with "See comparison →" link.

#### F-16: Footer competes with content

`AppFooter` is inside `PageShell` below every view with `mt-14`. On Mill, footer follows a long console — easy to miss. Privacy one-liner duplicates PrivacyNote in Mill.

**Proposal:** Monument footer = privacy + nav. Mill footer = minimal mono line + links; drop duplicate privacy essay.

---

### P2 — Typography & brand (font product irony)

A font generator using only Inter is a missed branding opportunity.

**Proposal:**
- Load **one display face** for headings only (e.g. Instrument Serif, Fraunces, or the KaminoDeco reference itself in hero as image).
- Show **live font preview** in hero using generated KaminoDeco `@font-face` from bundled TTF — strongest possible proof.
- Wordmark: consider custom letterspacing on "GLYPHMILL" with slightly larger mark (32px).

---

### P3 — Motion, delight, accessibility

| Item | Note |
|------|------|
| Focus rings | Monument buttons lack visible `:focus-visible` ring; console inputs have outline |
| Reduced motion | Console animations respect `prefers-reduced-motion`; add same for route transitions |
| Toast placement | `Toast` in Mill — confirm it doesn't cover sticky controls; consider bottom-center |
| Table mobile | Comparison tables scroll horizontally — add card fallback at `sm` breakpoint |
| OG images | Per-route OG exists in meta; ensure visuals match polished landing (post-polish regen) |

---

## Proposed implementation plan

### Phase 1 — Shell stability (P0) · ~1 PR

**Goal:** Zero header height change when switching any route.

| Task | File(s) |
|------|---------|
| Fixed header grid: logo row + optional tagline slot with min-height | `AppHeader.tsx` |
| Decouple tagline from logo `<a>` | `AppHeader.tsx` |
| Theme toggle slot always reserved; Mill shows locked state | `AppHeader.tsx`, `ThemeToggle.tsx` |
| Unify `PageShell` vertical padding (`py-8` both) | `PageShell.tsx` |
| Scope Mill dark tokens without toggling `html.dark` | `useMillConsoleTheme.ts`, `consoleTheme.css` |
| Instant scroll on route change except anchor navigation | `useAppRoute.ts` |
| E2E: assert header bounding box stable across route clicks | `tests/e2e/smoke.spec.ts` |

**Acceptance:** Playwright test measures `header.getBoundingClientRect().height` on `/`, `/foundry`, `/mill`, `/how-it-works` — variance ≤ 2px.

---

### Phase 2 — Landing section architecture (P1) · ~1 PR

**Goal:** Landing reads as a designed marketing page with clear chapters.

| Task | File(s) |
|------|---------|
| Extract `SectionHeading` | `components/layout/SectionHeading.tsx`, refactor `HowItWorksView.tsx` |
| Rebuild `LandingView` section map (hero, proof, chambers, compare, steps, cta) | `LandingView.tsx` |
| Add `index.css` utilities: `.section-band`, `.section-band--muted` | `index.css` |
| Hero: product-first layout with inline proof | `LandingView.tsx` |
| Reduce CTA duplication; improve CTA copy | `LandingView.tsx` |
| Optional: `public` hero `@font-face` for KaminoDeco | `index.html`, `LandingView.tsx` |

**Acceptance:** Visual review checklist — each section identifiable when blurred (screenshot squint test); hero communicates product in &lt;5s without scrolling.

---

### Phase 3 — Mill micro-UX (P1) · ~1 PR

**Goal:** Mill feels like an instrument panel, not a form.

| Task | File(s) |
|------|---------|
| Collapsed inactive bays by stage | `StudioView.tsx`, new `CollapsedBay.tsx` optional |
| Shorten / relocate PrivacyNote | `StudioView.tsx`, `AppFooter.tsx` |
| PreviewPanel → console nested styling | `PreviewPanel.tsx` |
| Gate min-height reservation | `Gate1Panel.tsx`, `Gate2Panel.tsx`, `StudioView.tsx` |
| Sticky stage indicator row | `StudioView.tsx`, `consoleTheme.css` |
| GlyphGrid warn → console tokens | `GlyphGrid.tsx` |
| Delete or wire `ProgressSteps` | cleanup |

**Acceptance:** Upload → generate → download without any single frame shifting &gt; 100px unexpectedly (manual + optional Playwright screenshot diff).

---

### Phase 4 — Design system alignment (P2) · ~1–2 PRs

| Task | Priority |
|------|----------|
| Plex Sans on Monument | High |
| Registration brackets on bays | Medium |
| Foundry top status banner | Medium |
| Nav order decision + de-emphasize Foundry | Medium |
| Dedupe landing vs how-it-works content | Medium |
| Console grain / vignette | Low |
| Live font in hero | High impact, optional |

---

## Wireframe — stable header (proposed)

```
┌─────────────────────────────────────────────────────────────────┐
│ [mark] GLYPHMILL          Foundry  Mill  How it works    [theme]│  ← row 1: always 48px
│ Tagline slot (fixed height — text or invisible spacer)          │  ← row 2: always 20px
├─────────────────────────────────────────────────────────────────┤  mobile: + nav row 40px
```

Tagline copy by route (or spacer):
- `/` — "PNG letter art in. Installable fonts out."
- `/mill` — "Turn letter images into production-ready fonts — in your browser."
- `/foundry`, `/how-it-works` — empty spacer (same height)

---

## Wireframe — landing section rhythm (proposed)

```
▓▓▓▓▓▓▓▓▓▓▓▓▓ HERO BAND (surface-strong) ▓▓▓▓▓▓▓▓▓▓▓▓▓
  Headline + CTA          [ before | after ]

──────────────────────── PROOF (full width panel) ────────────────────────

  CHAMBERS (two-up cards)

░░░░░░░░░░░░░░░ COMPARE (muted band) ░░░░░░░░░░░░░░░
  table

  THREE STEPS (grid)

▓▓▓▓▓▓▓▓▓▓▓▓▓ CTA BAND (callout) ▓▓▓▓▓▓▓▓▓▓▓▓▓
```

---

## Success metrics

| Metric | Target |
|--------|--------|
| Header height variance across routes | ≤ 2px |
| Time-to-understand on landing (informal user test) | &lt; 10s |
| Landing scroll depth to first CTA click | &lt; 1 screen on desktop |
| Mill: upload → download without confusion | Maintained (smoke tests green) |
| Lighthouse CLS on route change | No new layout shift warnings |
| `npm run ci` | All tests green after each phase |

---

## Out of scope (this polish pass)

- React Router migration
- Foundry implementation / image gen
- Accounts, pricing page, paywall
- Full Kamino re-skin in one pass
- Custom Glyphmill display typeface design
- Mobile native app patterns

---

## Decision log (to fill during execution)

| # | Question | Options | Choice |
|---|----------|---------|--------|
| D-01 | Nav order | Foundry-first vs Mill-first | _TBD_ |
| D-02 | Mill theme | Force global dark vs scoped `.console-root` only | _TBD — recommend scoped only_ |
| D-03 | Quick Answer on landing | Keep visible vs collapsible vs move to how-it-works only | _TBD_ |
| D-04 | Gate UI | Inline panels vs drawer/modal | _TBD — inline + min-height first_ |
| D-05 | Hero font proof | Static images vs live KaminoDeco `@font-face` | _TBD_ |

---

## References

- [platform-evolution-proposal.md](./platform-evolution-proposal.md) — § Monument vs Console
- [kamino-design.md](../plans/kamino-design.md) — §2 structural signature, §5.7 inert/hatched
- [geo-best-practices.md](../plans/geo-best-practices.md) — answer-first content shape (balance with human UX)
- [phase-p2-console-mill.md](../completions/phase-p2-console-mill.md) — what shipped in console pass

---

*Next step:* Review this doc, resolve D-01–D-05, then execute Phase 1 (shell stability) — highest pain-to-effort ratio.*