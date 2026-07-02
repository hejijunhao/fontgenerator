# Phase UI-P2 — Landing Section Architecture (Complete)

**Status:** Complete  
**Date:** 2026-07-02  
**Upstream spec:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) — Phase 2  
**Depends on:** [phase-ui-p1-shell-stability.md](./phase-ui-p1-shell-stability.md)  
**Goal:** Landing page reads as a designed marketing site with clear visual chapters — not one long document.

---

## Problem statement

The landing route (`/`) had semantic `<section>` elements but **no visual architecture**: uniform `gap-14` spacing, identical `.panel` treatment throughout, proof images below the fold, four duplicate “Open Mill” buttons, and a prominent Quick Answer list that dominated the hero like documentation rather than marketing.

---

## What changed

### 1. Shared `SectionHeading` component

**New file:** `src/components/layout/SectionHeading.tsx`

Extracted from inline `HowItWorksView` helper. Props: `kicker`, `title`, `lead?`, `id?`, `className?`.

**Refactor:** `HowItWorksView.tsx` imports shared component; local duplicate removed. Added `id="fontforge-heading"` on the FontForge comparison section so landing compare link can deep-anchor.

**Why:** One heading pattern across Monument pages; kickers + leads give chapter rhythm without copy-pasting markup.

---

### 2. Landing section map (`LandingView.tsx`)

Rebuilt as six anchored chapters with distinct surfaces:

| ID | Kicker | Surface | Purpose |
|----|--------|---------|---------|
| `#hero` | Browser font mill | `.section-band--hero` (white/strong + border-y) | Product-first: headline + inline proof + primary CTA |
| `#proof` | Proof | Default canvas | Full-size before/after reference glyph |
| `#chambers` | Platform | Default canvas | Mill (live) vs Foundry (inert) cards |
| `#compare` | Alternatives | `.section-band--muted` (cream strip) | 3 highlight cards — not full table |
| `#steps` | Workflow | Default canvas | Three-step grid |
| `#cta` | — | `.callout` band | Final conversion strip |

**Layout technique:** Sections that need full column width use `-mx-6 px-6` to cancel `PageShell` horizontal padding and bleed edge-to-edge within `max-w-6xl`.

**Hero (product-first):**

- Two-column grid on `lg+`: copy left, compact `HeroProof` panel right (before/after thumbnails).
- H1 unchanged for GEO/e2e compatibility: *“Glyphmill is a browser tool that converts PNG letter images into installable fonts.”*
- Primary CTA: **“Try with sample letter A”** (action-oriented, ties to demo glyph).
- Secondary path: text link **“How it works →”** — not a competing `btn-secondary`.

**Quick Answer (GEO without hero clutter):**

- Moved into collapsible `<details>` below hero (`summary`: “Quick answers”).
- Bullets sourced from `geoPrerenderContent.json` `landingQuickAnswer` — same strings as prerender/GEO layer.
- Still in DOM for crawlers; collapsed by default for human visitors.

**CTA de-duplication:**

| Location | Before | After |
|----------|--------|-------|
| Hero | `btn-primary` Open Mill + `btn-secondary` How it works | Primary “Try with sample letter A” + text link |
| Chambers Mill card | `btn-primary` Open Mill | Text link “Open Mill →” |
| Final band | `btn-primary` Open Mill | `btn-primary` “Try with sample letter A” |

Two primary buttons total (hero + CTA band); middle sections use text links.

**Compare de-duplication (F-15):**

- Removed full FontForge table from landing (canonical table stays on `/how-it-works`).
- Three `COMPARE_HIGHLIGHTS` summary cards on muted band.
- Link: **“See full comparison table →”** → `/how-it-works#fontforge-heading`.

---

### 3. Section band utilities (`index.css`)

```css
.section-band              /* relative positioning anchor */
.section-band--hero        /* bg-surface-strong + border-y */
.section-band--muted       /* bg-cream + border-y; dark mode override */
.landing-section           /* scroll-mt-24 for future in-page nav */
```

**Why:** Alternating surfaces create chapter breaks without new colors or illustration assets. Hero and CTA bands bookend the page; compare strip provides mid-page contrast.

---

### 4. Tests

| Test | File | What it guards |
|------|------|----------------|
| `landing → Mill navigation` | `smoke.spec.ts` | Updated CTA label → `/mill` |
| `landing has distinct section chapters` | `smoke.spec.ts` | `#hero` … `#cta`, band classes, compare link, Quick answers details |
| GEO / prerender / unknown-path | unchanged | H1 copy and prerender snippets still match |

**Not added:** KaminoDeco `@font-face` in hero (optional per spec; deferred — would need public font asset + FOIT handling).

---

## Files touched

| File | Action |
|------|--------|
| `src/components/layout/SectionHeading.tsx` | **Created** |
| `src/views/LandingView.tsx` | Rebuilt section architecture |
| `src/views/HowItWorksView.tsx` | Import `SectionHeading`; `fontforge-heading` id |
| `src/index.css` | Section band + landing scroll-margin utilities |
| `tests/e2e/smoke.spec.ts` | CTA label + landing chapters test |

**Not changed:** `PageShell`, prerender scripts, `geoPrerenderContent.json`, OG image generation.

---

## Verification

```bash
npm run typecheck   # pass
npm run lint        # pass
npm test            # 40 pass
npm run test:e2e    # 15 pass
```

---

## Acceptance checklist (Phase 2)

| Criterion | Status |
|-----------|--------|
| Six identifiable landing sections with IDs | ✅ |
| Hero shows product proof without scrolling (lg) | ✅ |
| Quick Answer collapsible, GEO strings preserved | ✅ |
| CTA hierarchy reduced (2 primary, text links elsewhere) | ✅ |
| FontForge table only on how-it-works | ✅ |
| `SectionHeading` shared with how-it-works | ✅ |
| All CI tests green | ✅ |

---

## Known limitations / follow-ups

| Item | Phase |
|------|-------|
| Live KaminoDeco `@font-face` in hero | Optional polish |
| In-page section nav / scroll-spy in header | UI-P2+ or P3 |
| IBM Plex Sans on Monument | UI-P4 design system |
| Mobile compare cards stack — no card→table fallback needed (cards already responsive) | Done |
| Regenerate OG `landing.png` to match new hero layout | Post-deploy visual |

---

## Decision log

| ID | Decision | Choice | Rationale |
|----|----------|--------|-----------|
| D-03 | Quick Answer on landing | Collapsible `<details>` | Keeps GEO strings visible in DOM; declutters hero |
| D-05 | Hero font proof | Static images (compact + full proof section) | No public TTF asset path yet; images already validated |
| — | H1 copy | Unchanged | GEO prerender, e2e, and llms.txt alignment |
| — | Compare on landing | 3 cards + deep link | Avoid duplicate table; how-it-works remains canonical |

---

## Handoff

Landing now has clear visual chapters. Combined with UI-P1 stable header, route transitions should feel intentional.

**Recommended next:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) Phase 3 — Mill micro-UX (collapse inactive bays, gate min-height, sticky stage indicator, console alert tokens).