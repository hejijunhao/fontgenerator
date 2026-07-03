# Phase VOID-B — App Shell (Complete)

**Status:** Complete  
**Date:** 2026-07-03  
**Upstream spec:** [void-design-migration.md](../executing/void-design-migration.md) — Phase B  
**Depends on:** [phase-void-a-token-foundation.md](./phase-void-a-token-foundation.md)  
**Goal:** Header, footer, nav, and page shell match VOID layout patterns; unified surface with no Mill theme lock or `console-root` wrapper.

---

## Problem statement

After Phase A, VOID tokens and `data-theme` worked globally, but the app shell still used Kamino UI-P1 geometry: a two-row header (logo + tagline), uppercase accent-filled nav pills, a locked theme toggle on Mill, route-specific `console-root dark` wrapper, and mismatched content widths (`max-w-6xl` / `max-w-5xl` + `console-field`).

Phase B replaces the shell with VOID's 56px sticky blur nav, unlocks theme on all routes, and unifies page layout widths.

---

## Architectural decisions applied

| ID | Choice | Implementation |
|----|--------|----------------|
| V-03 | Full theme toggle on Mill | `ThemeToggle` `locked` prop removed; interactive toggle on every route |
| V-04 | VOID 56px single-row nav | Tagline row + `TAGLINES` map deleted; header is exactly 56px on desktop |
| V-07 | VOID-inspired logo mark | Crosshair frame SVG + violet centre dot + embedded A glyph |
| V-08 | (partial) | Foundry `Soon` badge uses `.badge.badge-default` in nav |

---

## What changed

### 1. VOID nav CSS — `src/index.css`

Added component-layer classes ported from [void-design-system.html](../plans/void-design-system.html):

| Class | Purpose |
|-------|---------|
| `.skip-link` | Off-screen until focused; first tab stop |
| `.nav` | Sticky 56px header, `color-mix` blur background, border-bottom |
| `.nav-inner` | `max-width: var(--content-wide)`, fluid horizontal padding |
| `.nav-logo` | Uppercase wordmark, `letter-spacing: 0.12em` |
| `.nav-links` | Desktop nav cluster; `display: none` below 640px |
| `.nav-link` / `.active` | Muted text → `surface-2` background on hover/active |
| `.nav-link--muted` | `opacity: 0.75` for Foundry de-emphasis |
| `.nav-mobile` | Second row below 640px; hidden on `sm+` |
| `.theme-toggle` | 36×36 ghost button, `surface-2` hover |

**Mobile pattern:** Matches VOID `@media` behaviour (hide desktop links) while preserving Glyphmill's mobile nav row — VOID spec doc has no mobile nav alternative, but Glyphmill needs touch targets.

---

### 2. `AppHeader.tsx` — full restructure

**Removed**

- `TAGLINES` map and `app-header__tagline` row (40px variable slot)
- Kamino `h-12` primary row + `py-4` container padding
- `ThemeToggle locked={route === 'mill'}`
- Old bordered square A-glyph mark

**Added**

- `.nav` + `.nav-inner` single-row layout (56px)
- VOID crosshair logo SVG with violet A glyph (V-07)
- Desktop `.nav-links` + mobile `.nav-mobile` (duplicate links, stable across routes)
- `app-header` class retained for e2e measurement

**Why:** Tagline copy belongs in landing hero (Phase D); reserving a second header row was the root cause of route-height jitter documented in UI-P1.

---

### 3. `AppNavLink.tsx` — VOID link styling

**Before:** Uppercase tracked pills; active = `bg-accent text-accent-fg`; `Soon` = `.badge-inert` hatch.

**After:**

- Base class `nav-link`; active state via `.active` (surface-2 fill, not violet fill)
- Muted routes use `nav-link--muted`
- Badges use `badge badge-default`

Nav order unchanged: Mill · How it works · Foundry.

---

### 4. `ThemeToggle.tsx` — unlocked everywhere

- Deleted `locked` prop, `LockIcon`, and non-interactive lock span
- Uses `.theme-toggle` class (borderless, 36×36)
- Same sun/moon icons and `aria-label` pattern

Mill now respects user's `data-theme` preference like every other route.

---

### 5. `AppFooter.tsx` — minimal VOID bar

- Unified copy across routes (removed Mill-specific `/api/agent` code snippet)
- `bg-cream` (`surface-2`) + `border-t border-border`
- Footer nav reuses `AppNavLink` with VOID classes
- Consistent `mt-12 py-6` spacing

---

### 6. `PageShell.tsx` — content widths

**Before:** Mill used `console-field` + `max-w-5xl`; landing `max-w-6xl`; others `max-w-5xl`; split padding.

**After:** Single code path:

| Route | Max width |
|-------|-----------|
| `landing` | `var(--content-wide)` — 1200px |
| all others | `var(--content-default)` — 960px |

- `id="main-content"` + `tabIndex={-1}` for skip-link target
- Fluid padding: `clamp(var(--space-4), 4vw, var(--space-12))`
- `console-field` class removed

---

### 7. `App.tsx` — unified root

**Before:**

```tsx
<div className={[..., route === 'mill' ? 'console-root dark' : ''].join(' ')}>
```

**After:**

```tsx
<div className="relative flex min-h-dvh flex-col">
  <a href="#main-content" className="skip-link">Skip to content</a>
  ...
</div>
```

- `console-root dark` wrapper removed — Mill uses global VOID tokens via `data-theme`
- `consoleTheme.css` still imported in `main.tsx` but inactive until `.console-root` is re-added (Phase E deletes the file entirely)
- Skip link is first focusable element per VOID a11y

---

### 8. E2E updates — `tests/e2e/smoke.spec.ts`

| Test | Change |
|------|--------|
| `primary nav prioritizes Mill…` | Assert `nav-link--muted` instead of Tailwind `opacity-75` |
| `mill primary bays wear registration brackets` | **Replaced** with `mill has working theme toggle` — brackets depended on `.console-root .console-bay::after` (removed with wrapper) |

`header height stable across routes` still passes at `1280×720` — all routes now measure 56px (±0px variance).

---

## Files touched

| File | Action |
|------|--------|
| `src/index.css` | Added nav, skip-link, theme-toggle CSS |
| `src/components/AppHeader.tsx` | Rewritten |
| `src/components/AppNavLink.tsx` | VOID nav-link classes |
| `src/components/ThemeToggle.tsx` | Removed lock; `.theme-toggle` |
| `src/components/AppFooter.tsx` | VOID minimal footer |
| `src/components/layout/PageShell.tsx` | Unified widths, skip target |
| `src/App.tsx` | Skip link, no `console-root` |
| `tests/e2e/smoke.spec.ts` | Nav muted class + theme toggle test |

---

## Acceptance criteria

| Criterion | Result |
|-----------|--------|
| Header height stable across routes | ✅ 56px on desktop; e2e variance ≤ 2px |
| Mill has working theme toggle | ✅ New e2e test; no lock icon |
| Mobile nav matches VOID pattern | ✅ Desktop links hidden `<640px`; mobile row shown |
| `npm run typecheck` | ✅ |
| `npm run ci` components | ✅ lint, 45 unit, 18 e2e |

---

## Visual state after Phase B

- **Header:** VOID blur nav, crosshair logo, surface-2 active links, theme toggle always interactive
- **Footer:** Muted `surface-2` band with consistent nav links
- **Layout:** 1200px landing / 960px other routes with fluid gutters
- **Mill:** Kamino console *component* classes (`.console-bay`, `.console-readout`, etc.) still present but **without** scoped Kamino token overrides — looks transitional until Phase E
- **Views:** Landing/How it works/Foundry still use Kamino section classes (`.section-band`, `.callout`) until Phase D

---

## Risks & follow-ups

| Item | Phase |
|------|-------|
| Mill console components still use Kamino class names | E |
| Delete `consoleTheme.css` + remove import | E |
| Landing hero tagline (moved from header) | D |
| `SectionHeading` VOID rewrite | C |
| VOID card assertion for Mill bays (full replacement) | E/F |

---

## Next step

**Phase C — Shared layout components:** Rewrite `SectionHeading` to `section-eyebrow` + DM Serif `section-title`; verify How it works headings at `text-2xl` scale.