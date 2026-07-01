# Phase 1 Completion — Project Scaffold & Deploy

**Status:** Complete  
**Date:** 2026-07-01  
**Plan reference:** [implementation-plan.md](../executing/implementation-plan.md) — Phase 1

---

## Goal

Empty but deployable SPA on Vercel: Vite + React + TypeScript + Tailwind, Vitest wired,
placeholder upload UI. No font pipeline.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `npm run dev` serves shell locally | Pass | Vite dev server starts on `:5173` |
| `npm run build` succeeds | Pass | `dist/` — 195 kB JS, 12.6 kB CSS |
| Vercel preview/production loads app | Pass | https://fontgenerator-gamma.vercel.app |
| Vitest runs | Pass | `tests/unit/smoke.test.ts` — 1 test |

---

## What was built

### Stack (per blueprint)

| Layer | Choice | Version |
|-------|--------|---------|
| Build | Vite | 7.3.x |
| UI | React | 19.2.x |
| Language | TypeScript | 5.9.x |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | 4.2.x |
| Tests | Vitest + jsdom | 4.1.x |
| Deploy | Vercel (static SPA) | Linked project |

### App shell (`src/`)

| File | Role |
|------|------|
| `App.tsx` | Header, drop zone, “not implemented” status banner |
| `components/DropZone.tsx` | Drag/drop + file picker; counts selected PNGs (no processing) |
| `index.css` | Tailwind import; cream/ink theme tokens from reference asset |
| `main.tsx` | React root |

**UX notes:**

- Cream background (`#f1efe2`) matches `A-KaminoDeco.png` reference palette
- Drop zone accepts PNG only; selection count shown but files are not stored yet
- Footer + banner state pipeline is Phase 2+

### Config files

| File | Purpose |
|------|---------|
| `vite.config.ts` | React + Tailwind plugins; `@/` path alias |
| `vitest.config.ts` | jsdom environment; tests in `tests/unit/` |
| `vercel.json` | `npm run build` → `dist/` |
| `package.json` | Scripts: `dev`, `build`, `test`, `ci`, `typecheck`, `lint` |
| `.gitignore` | `node_modules`, `dist`, `.vercel`, CLI `work/` |
| `eslint.config.js` | TypeScript + React hooks |

### Scripts

```bash
npm run dev        # local dev server
npm run build      # production bundle
npm run test       # vitest run
npm run ci         # build + test (CI entry point)
```

### Tests

- `tests/unit/smoke.test.ts` — scaffold sanity check (Phase 2 adds pipeline tests)
- `tests/fixtures/A-KaminoDeco.png` — already present from Phase 0

### Vercel

| Item | Value |
|------|-------|
| Project | `crimsonsuntechnologies/fontgenerator` |
| Production URL | https://fontgenerator-gamma.vercel.app |
| Inspect (this deploy) | https://vercel.com/crimsonsuntechnologies/fontgenerator/9DBAGUHYXvPeUBqYjJ3X9pWTDWWy |
| Node | `engines.node >= 20` in `package.json` |

Deploy command used:

```bash
npx vercel@latest deploy --yes
```

Global `vercel` CLI (v39) was too old for upload API; use `npx vercel@latest` until upgraded.

**Deferred to Phase 4:** `api/agent.ts` OpenRouter proxy — not added yet (static-only deploy).

---

## Repository layout after Phase 1

```
fontgenerator/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/DropZone.tsx
│   └── vite-env.d.ts
├── public/favicon.svg
├── tests/
│   ├── fixtures/          # Phase 0 golden + source PNG
│   └── unit/smoke.test.ts
├── scripts/cli-reference/ # Phase 0 (unchanged)
├── docs/
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
└── dist/                  # build output (gitignored)
```

---

## Handoff to Phase 2

1. Add `src/pipeline/` and `src/lib/` per implementation plan
2. Add pipeline Vitest tests against `tests/fixtures/golden/`
3. Pin master format (TTF vs CFF) before `buildFont`
4. Wire Zustand store when no-agent happy path begins (Phase 3)

### Local dev

```bash
npm install
npm run dev
```

### CI (local or GitHub Actions)

```bash
npm run ci
```

---

## Files added/changed in this phase

```
package.json, package-lock.json
index.html
vite.config.ts, vitest.config.ts
tsconfig.json, tsconfig.app.json, tsconfig.node.json
eslint.config.js, .gitignore, vercel.json
src/**, public/favicon.svg
tests/unit/smoke.test.ts
docs/completions/phase-1-scaffold.md
.vercel/ (local link metadata, gitignored)
```