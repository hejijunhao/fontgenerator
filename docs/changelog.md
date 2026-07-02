# Changelog

All notable changes to Font Generator are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Index

- **[0.1.1](#011--2026-07-02)** — CI hardening, lint fixes, repo hygiene
- **[0.1.0](#010--2026-07-01)** — Initial v1: browser PNG → font pipeline with optional agent

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