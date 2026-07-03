# Phase VOID-C — Shared Layout Components (Complete)

**Status:** Complete  
**Date:** 2026-07-03  
**Upstream spec:** [void-design-migration.md](../executing/void-design-migration.md) — Phase C  
**Depends on:** [phase-void-a-token-foundation.md](./phase-void-a-token-foundation.md)  
**Goal:** Section grammar uses VOID editorial + UI type split — violet eyebrow rule, DM Serif titles, muted desc copy.

---

## Problem statement

`SectionHeading` was the shared heading primitive for Landing and How it works sections. It used Kamino patterns: uppercase tracked kickers in `text-subtle`, sans-semibold `h2` at `text-xl`/`text-2xl`, and a small muted lead paragraph. VOID specifies a different hierarchy: `.section-eyebrow` (violet, with `::before` rule), `.section-title` (DM Serif Display at `--text-2xl`), and `.section-desc` (muted body, max 60ch).

Phase C rewires the one shared component so all consuming views inherit VOID section grammar without per-view edits.

---

## What changed

### 1. `SectionHeading.tsx` — VOID class mapping

| Prop | Before | After |
|------|--------|-------|
| `kicker` | `text-xs font-semibold tracking-[0.2em] text-subtle uppercase` | `.section-eyebrow` |
| `title` | `text-xl font-semibold … sm:text-2xl` (sans) | `.section-title` (DM Serif, `--text-2xl`) |
| `lead` | `text-sm text-muted max-w-prose` | `.section-desc` |
| wrapper | `space-y-2` on `<header>` | No extra spacing — VOID classes carry their own margins |

**API unchanged:** `kicker`, `title`, `lead?`, `id?`, `className?` — no call-site updates required.

**Example output structure:**

```html
<header>
  <p class="section-eyebrow">Platform</p>
  <h2 id="chambers-heading" class="section-title">Two chambers</h2>
  <p class="section-desc">Glyphmill is a two-chamber type workshop…</p>
</header>
```

---

### 2. `index.css` — no changes required

VOID section utilities were ported in Phase A:

| Class | Key styles |
|-------|------------|
| `.section-eyebrow` | Uppercase, `--color-primary`, `::before` 16px violet rule |
| `.section-title` | `font-family: var(--font-display)`, `font-size: var(--text-2xl)` |
| `.section-desc` | `--color-text-muted`, `max-width: 60ch`, `line-height: 1.7` |
| `.section` | Section band padding + divider (available for Phase D) |
| `.subsection` / `.subsection-title` | Subsection grammar (available for Phase D/E) |

Phase C task "add utility classes if needed" — already satisfied by Phase A.

---

## Consumers (unchanged call sites)

| View | `SectionHeading` count |
|------|------------------------|
| `LandingView.tsx` | 4 |
| `HowItWorksView.tsx` | 6 |

Page-level `h1` elements (landing hero, how-it-works intro) were **not** changed — Phase D will VOID-style those separately.

---

## Files touched

| File | Action |
|------|--------|
| `src/components/layout/SectionHeading.tsx` | **Rewritten** — VOID class names |
| `src/index.css` | No change (utilities from Phase A) |

---

## Acceptance criteria

| Criterion | Result |
|-----------|--------|
| How it works section headings in DM Serif at `text-2xl` | ✅ `.section-title` uses `--font-display` + `--text-2xl` |
| Eyebrow shows violet rule `::before` | ✅ `.section-eyebrow::before` from Phase A CSS |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ 45 passed |
| `npm run test:e2e` | ✅ 18 passed |

---

## Visual impact

- **Section kickers** now violet with a short horizontal rule prefix (VOID signature)
- **Section titles** switch from Geist semibold to DM Serif Display at fluid 2xl scale
- **Lead copy** slightly larger (`--text-base` vs `text-sm`) with VOID muted colour and 60ch cap
- Spacing between eyebrow/title/desc follows VOID margins (`--space-4`, `--space-3`, `--space-10`)

Landing and How it works sections still use Kamino *containers* (`.panel`, `.section-band`, `.callout`) — only the shared heading primitive is VOID-styled until Phase D.

---

## Next step

**Phase D — Monument views:** VOID-styled landing, how-it-works, and foundry pages; address anti-patterns (asymmetric compare grid, no left-border callouts, hero `.hero` pattern).