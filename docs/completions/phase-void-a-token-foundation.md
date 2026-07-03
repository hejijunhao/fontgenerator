# Phase VOID-A — Token Foundation (Complete)

**Status:** Complete  
**Date:** 2026-07-03  
**Upstream spec:** [void-design-migration.md](../executing/void-design-migration.md) — Phase A  
**Canonical tokens:** [void-design-system.html](../plans/void-design-system.html)  
**Goal:** VOID CSS variables, theme mechanism, Tailwind semantic mapping, and component primitives live — body renders with VOID dark palette before any view/shell changes.

---

## Problem statement

Glyphmill’s visual layer was built on Kamino dual-surface tokens: cream Monument pages (`index.css` hard-coded hex values + `html.dark` overrides) and a scoped warm-obsidian Console (`consoleTheme.css` on `.console-root`). Theme toggling mutated `classList.add('dark')` on `<html>`, and typography used IBM Plex Sans/Mono.

Phase A lays the VOID foundation so later phases (shell, views, Mill) can migrate components without re-plumbing tokens or theme mechanics.

---

## Architectural decisions applied

| ID | Choice | Rationale |
|----|--------|-----------|
| V-01 | Full VOID token system | `voidTokens.css` is the single source of truth; Kamino hex blocks removed from `index.css` |
| V-02 | `data-theme` on `<html>` | `applyTheme` / bootstrap script set `data-theme="dark\|light"`; Tailwind `dark:` maps to `[data-theme="dark"]` |
| V-05 | Dark-first HTML default | `<html data-theme="dark">` before paint; stored preference or `prefers-color-scheme` resolved in inline script |
| V-06 | Map existing Tailwind names | `@theme` keeps `canvas`, `ink`, `accent`, etc. but values now reference VOID CSS variables — zero component churn in Phase A |

**Deferred to later phases:** V-03 (Mill toggle unlock), V-04 (56px nav), V-07 (logo mark), V-08 (inert styling).

---

## What changed

### 1. Created `src/lib/voidTokens.css`

New file extracted verbatim from [void-design-system.html](../plans/void-design-system.html) § tokens:

- **Fluid type scale:** `--text-xs` through `--text-hero` (clamp-based)
- **Spacing scale:** `--space-1` through `--space-32`
- **Font stacks:** `--font-body` (Geist), `--font-display` (DM Serif Display), `--font-mono` (Geist Mono)
- **Radii, shadows, transitions, content widths**
- **Dark palette** on `:root, [data-theme="dark"]` — near-void `#07060b` canvas, electric-violet `#7c5cfc` primary
- **Light palette** on `[data-theme="light"]` — `#f9f8ff` canvas, `#6340f5` primary

**Why a separate file:** Keeps `index.css` focused on Tailwind integration and component layer; tokens are portable and match the VOID spec document 1:1 for agent/human reference.

---

### 2. Rewrote `src/index.css` token + theme integration

**Imports & variant**

```css
@import './lib/voidTokens.css';
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *, .dark, .dark *));
```

- `dark:` utilities now respond to `data-theme` on `<html>`.
- `.dark` descendant selector retained temporarily so Mill’s scoped `console-root dark` wrapper (Phase E removal) still activates `dark:` utilities inside `/mill` without mutating `<html>`.

**`@theme` semantic mapping (V-06)**

| Tailwind token | VOID source |
|----------------|-------------|
| `--color-canvas` | `var(--color-bg)` |
| `--color-cream` | `var(--color-surface-2)` |
| `--color-ink` | `var(--color-text)` |
| `--color-surface` | `var(--color-surface-2)` |
| `--color-surface-muted` | `var(--color-surface-3)` |
| `--color-surface-strong` | `var(--color-surface)` |
| `--color-surface-hover` | `var(--color-surface-3)` |
| `--color-muted` | `var(--color-text-muted)` |
| `--color-subtle` | `var(--color-text-faint)` |
| `--color-border` | `var(--color-border)` |
| `--color-border-strong` | `var(--color-divider)` |
| `--color-accent` | `var(--color-primary)` |
| `--color-accent-fg` | `#ffffff` |
| `--color-input` | `var(--color-surface)` |
| `--font-sans` | `var(--font-body)` |
| `--font-mono` | `var(--font-mono)` |
| `--font-display` | `var(--font-display)` |

**Removed:** `html.dark { --color-canvas: … }` block (38 lines of Kamino hex overrides). Theme colours now flow exclusively from `voidTokens.css` via `data-theme`.

**Base layer additions**

- `::selection` — primary-highlight background, primary text colour
- `:focus-visible` — 2px primary outline, 3px offset, `radius-sm`
- `body` — Geist via `font-sans`, fluid `--text-base`, VOID transition timing
- `prefers-reduced-motion` — zeroes animation/transition durations globally

**VOID component primitives ported** (`@layer components`)

| Class group | Notes |
|-------------|-------|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-sm`, `.btn-lg` | Solid violet primary with glow hover; legacy `.btn-primary` aliases updated |
| `.card`, `.card-grid` | `radius-xl`, `shadow-card`, hover glow lift |
| `.badge`, `.badge-default`, `.badge-primary`, `.badge-success`, `.badge-error`, `.badge-warning` | Full semantic badge set |
| `.section`, `.section-eyebrow`, `.section-title`, `.section-desc`, `.subsection`, `.subsection-title` | Editorial grammar with DM Serif titles + violet eyebrow rule |
| `.hero`, `.hero-badge`, `.hero-title`, `.hero-desc`, `.pulse-dot` | Radial glow `::before` capped at primary-glow opacity |
| `.input`, `.input-label` | Merged with legacy `.field-input` — surface fill, primary focus ring |
| `.table-wrap`, `.table` | VOID table chrome |
| `.empty-state` | Dashed border empty pattern |

**Legacy Kamino classes retained** (`.panel`, `.callout`, `.inert-frame`, `.badge-inert`, etc.) so existing views compile and e2e pass until Phases D/E. Dark-scoped selectors updated from `html.dark` → `[data-theme='dark']`.

---

### 3. Theme mechanism — `src/lib/theme.ts`

```typescript
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
```

**Before:** `classList.toggle('dark', theme === 'dark')`  
**After:** `setAttribute('data-theme', theme)`

`initTheme`, `persistTheme`, `toggleTheme`, and `useTheme` hook unchanged in API — only the DOM mutation target changed. `localStorage` key `glyphmill-theme` preserved.

---

### 4. Pre-paint bootstrap + fonts — `index.html`

**HTML default**

```html
<html lang="en" data-theme="dark">
```

Ensures VOID dark canvas renders even if inline script fails (FOUC guard).

**Inline script (before CSS paint)**

```javascript
var theme =
  stored === 'light' || stored === 'dark'
    ? stored
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
document.documentElement.setAttribute('data-theme', theme)
```

**Fonts replaced**

| Before | After |
|--------|-------|
| IBM Plex Sans + IBM Plex Mono | Geist + Geist Mono + DM Serif Display |

Google Fonts link matches VOID spec weights (`Geist 300..900`, `Geist Mono 300..700`, `DM Serif Display` regular + italic).

---

## Files touched

| File | Action |
|------|--------|
| `src/lib/voidTokens.css` | **Created** |
| `src/index.css` | **Rewritten** — import, `@theme` map, VOID primitives, `data-theme` selectors |
| `src/lib/theme.ts` | **Updated** — `data-theme` attribute |
| `index.html` | **Updated** — bootstrap script, fonts, default `data-theme="dark"` |

**Not changed (by design):**

- `src/lib/consoleTheme.css` — Mill Kamino overrides remain until Phase E
- `src/App.tsx` — `console-root dark` wrapper unchanged
- View components — inherit new palette via semantic Tailwind tokens automatically
- `src/hooks/useTheme.ts` — no changes needed

---

## Acceptance criteria

| Criterion | Result |
|-----------|--------|
| Toggle light/dark updates all routes without flash | ✅ Bootstrap + `applyTheme` both use `data-theme`; `initTheme()` runs before React paint |
| `npm run typecheck` passes | ✅ |
| Body renders VOID dark palette on `/` before view changes | ✅ `#07060b` canvas via `--color-bg` → `--color-canvas`; violet accent on buttons |

**Additional verification run:**

- `npm run lint` — pass
- `npm run build` — pass (CSS bundle 56 kB)

---

## Visual state after Phase A

Expect a **mixed but functional** site:

- **Monument routes** (`/`, `/how-it-works`, `/foundry`): VOID near-void dark canvas, violet CTAs, Geist body — but Kamino layout classes (`.section-band`, `.callout` left bar, symmetric grids) still present until Phase D.
- **Mill** (`/mill`): `consoleTheme.css` still overrides semantic tokens inside `.console-root`; Kamino console chrome persists until Phase E.
- **Header/footer**: Kamino geometry (tagline row, locked theme toggle) unchanged until Phase B.

This is expected per migration plan: *"PR-1 may look visually mixed until PR-3/4 complete."*

---

## Risks & follow-ups

| Item | Phase |
|------|-------|
| Remove `.dark` from `@custom-variant` once `console-root dark` deleted | E |
| Delete `consoleTheme.css` | E |
| Replace `html.dark` references in any missed files (`rg 'html\.dark'`) | B–E |
| Header e2e height thresholds (56px VOID nav) | F |
| Geist CDN availability — `Inter` fallback already in `--font-body` | Monitor |

---

## Next step

**Phase B — App shell:** 56px VOID nav, remove tagline row, unlock theme toggle on Mill, `PageShell` content widths, remove `console-root dark` route wrapper.