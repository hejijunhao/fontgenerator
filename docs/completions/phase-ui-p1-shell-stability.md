# Phase UI-P1 — Shell Stability (Complete)

**Status:** Complete  
**Date:** 2026-07-02  
**Upstream spec:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) — Phase 1  
**Goal:** Eliminate header height shift and route-transition jank when moving between Foundry, Mill, Landing, and How it works.

---

## Problem statement

Users reported that switching routes — especially **Foundry ↔ Mill** — felt glitchy because the **header grew and shrank**, the theme toggle appeared/disappeared, and the page content jumped. Root causes were traced to conditional header content, global theme forcing on Mill entry, and mismatched page shell padding.

---

## What changed

### 1. Stable header geometry (`AppHeader.tsx`)

**Before**

- Tagline lived inside the logo `<a>` and rendered only on `/` and `/mill`.
- Theme toggle omitted on `/mill`, shrinking the right nav cluster.
- Tagline used `min-height`, so wrapped copy could grow the header on longer routes (e.g. Mill).

**After**

- **Logo link** contains only glyph mark + `GLYPHMILL` wordmark (smaller, predictable hit target).
- **Tagline row** is always present:
  - Fixed slot: `h-10` + `line-clamp-2` + `overflow-hidden` (40px, max two lines).
  - Copy from `TAGLINES` map for `landing` and `mill`; Foundry / How it works get an invisible spacer (`·`) so layout is identical.
- **Primary row** fixed at `h-12` (48px).
- **Theme toggle** always rendered; Mill passes `locked` (see below).
- **Mobile nav** fixed at `h-10` with `mt-2`; hidden on `sm+` via `sm:hidden` (no layout impact on desktop).
- Header marked with `app-header` class for e2e measurement.
- Container uses uniform `py-4` instead of variable inner padding.

**Why:** Reserving space for optional UI is cheaper than animating layout. Fixed heights beat `min-height` when copy length varies per route.

---

### 2. Theme toggle slot always reserved (`ThemeToggle.tsx`)

**Before:** Toggle not mounted on Mill → 36px width delta in header.

**After:**

- New `locked?: boolean` prop.
- When `locked`, renders a non-interactive `36×36` lock icon span with `title` and `aria-label` explaining Mill uses a fixed dark console theme.
- Same `h-9 w-9 shrink-0` box model as the interactive button.

**Why:** Visual stability without hiding chrome. Users still see that theme is a deliberate console choice, not a missing control.

---

### 3. Scoped Mill dark theme — no `html.dark` mutation (`App.tsx`, deleted `useMillConsoleTheme.ts`)

**Before:**

- `useMillConsoleTheme` added `dark` to `<html>` on Mill entry and restored user preference on exit.
- Light-mode users saw a flash when entering/leaving Mill; Monument preference fought Console forcing.

**After:**

- App root on Mill: `className="console-root dark"` (both classes on the same wrapper).
- Tailwind custom variant `@custom-variant dark (&:where(.dark, .dark *))` in `index.css` means `dark:` utilities apply to descendants of `.console-root.dark` without touching `<html>`.
- `consoleTheme.css` continues to override `--color-*` tokens under `.console-root`.
- **`useMillConsoleTheme.ts` deleted**; hook removed from `App.tsx`.

**Why:** Mill dark surface is scoped to the app shell. User's stored Monument theme (`localStorage` + `html.dark`) stays intact when navigating away. `GlyphGrid`, `RunView`, etc. still receive `dark:` styles inside Mill via scoped `.dark`.

---

### 4. Unified page shell padding (`PageShell.tsx`)

**Before:** Mill `py-6`, Monument `py-10`.

**After:** Both use `py-8`.

**Why:** Removes ~16px content jump below the header on route change. Width rules unchanged (`max-w-6xl` landing, `max-w-5xl` elsewhere).

---

### 5. Instant scroll on route change (`useAppRoute.ts`)

**Before:** Smooth scroll to top only for `/how-it-works`; `auto` elsewhere.

**After:** `behavior: 'instant'` for all route changes.

**Why:** SPA route swaps should feel like navigation, not animated scroll. Smooth scroll is reserved for future in-page anchor links (Phase 2 landing sections).

---

### 6. Console background transition (`index.css`)

Added `background-color 200ms ease` on `.console-root` with `prefers-reduced-motion: reduce` override.

**Why:** Softens Monument ↔ Console surface switch without animating layout (review item F-02, minimal implementation).

---

### 7. Regression test (`tests/e2e/smoke.spec.ts`)

New test: **`header height stable across routes`**

- Viewport pinned to `1280×720` (desktop — mobile nav hidden).
- Visits `/`, `/foundry`, `/mill`, `/how-it-works`.
- Measures `header.app-header` bounding box height on each.
- Asserts `max − min ≤ 2px`.

**Note:** First run failed (24px delta) because `min-height` tagline allowed Mill copy to wrap to three lines at default viewport. Fixed by `h-10 line-clamp-2` before test passed.

---

## Files touched

| File | Action |
|------|--------|
| `src/components/AppHeader.tsx` | Restructured stable header grid |
| `src/components/ThemeToggle.tsx` | Added `locked` prop + lock icon |
| `src/App.tsx` | `console-root dark` on Mill; removed hook |
| `src/hooks/useMillConsoleTheme.ts` | **Deleted** |
| `src/components/layout/PageShell.tsx` | Unified `py-8` |
| `src/hooks/useAppRoute.ts` | Instant scroll |
| `src/index.css` | Console root transition |
| `tests/e2e/smoke.spec.ts` | Header stability test |

**Not changed:** `consoleTheme.css` (existing `.console-root` token overrides sufficient), views, pipeline, store.

---

## Verification

```bash
npm run typecheck   # pass
npm run lint        # pass
npm test            # 40 pass
npm run test:e2e    # 14 pass (includes new header test)
```

---

## Acceptance checklist (Phase 1)

| Criterion | Status |
|-----------|--------|
| Header height variance across routes ≤ 2px (desktop) | ✅ e2e |
| Tagline decoupled from logo link | ✅ |
| Theme toggle slot always reserved | ✅ |
| Mill does not mutate `html.dark` | ✅ |
| Page shell padding unified | ✅ |
| Route scroll is instant | ✅ |
| Existing smoke / pipeline / gate tests green | ✅ |

---

## Known limitations / follow-ups

| Item | Phase |
|------|-------|
| Mobile header is taller than desktop (extra nav row) — stable across routes but not identical to desktop height | Acceptable; test uses desktop viewport |
| Mill FAQ copy still says "console forces dark theme" via global preference — technically now scoped; update in Phase 4 content pass | UI-P4 / GEO |
| Route cross-fade on main content not implemented | Optional P2 |
| Sticky Mill stage indicator | UI-P3 |
| Landing section bands | UI-P2 |

---

## Decision log

| ID | Decision | Choice | Rationale |
|----|----------|--------|-----------|
| D-02 | Mill theme scoping | `.console-root.dark` on app wrapper | Preserves user Monument theme; enables `dark:` in Mill |
| — | Theme toggle on Mill | Locked icon, not hidden | Keeps header width stable |
| — | Tagline on Foundry/HTW | Invisible spacer in fixed slot | Same geometry as routes with copy |
| — | e2e viewport | 1280×720 | Mobile nav row would be same across routes but different from desktop; desktop was the reported glitch context |

---

## Handoff

Phase 1 is strictly **shell/infrastructure** — no landing visual redesign, no Mill bay collapse. The Foundry ↔ Mill toggle should no longer shift the header on desktop.

**Recommended next:** [ui-ux-polish-review.md](../executing/ui-ux-polish-review.md) Phase 2 — landing section architecture (`SectionHeading`, hero band, proof-first layout).