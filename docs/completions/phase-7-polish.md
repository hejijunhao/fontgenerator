# Phase 7 Completion — Polish & Production Hardening

**Status:** Complete  
**Date:** 2026-07-01  
**Plan reference:** [implementation-plan.md](../executing/implementation-plan.md) — Phase 7

---

## Goal

Ship-quality UX, abuse controls, edge cases. v1 complete.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Non-developer README | Pass | `README.md` one-line quick start |
| Rate limit 429 + message | Pass | `api/agent/[...path].ts` + `tests/unit/rateLimit.test.ts` |
| BYO-key path | Pass | `AgentSettings` + proxy forwards client `Authorization` |
| Playwright smoke in CI | Pass | `tests/e2e/smoke.spec.ts` via `npm run test:e2e` |
| Non-goals unchanged | Pass | No accounts, kerning UI, etc. |

---

## What was built

### Batch upload (`GlyphGrid`)

- Thumbnails per glyph with codepoint label
- Remove glyph (reindexes codepoints)
- Recipe/glyph count mismatch warning

### Agent UX

- `RunView` — human-readable step labels, per-step timing, error recovery hints
- `AgentSettings` — Opus 4.8 vs Sonnet 5 toggle; BYO OpenRouter key (memory only)
- `PartialFontWarning` — missing letters / space notes

### Proxy hardening

- Per-IP rate limit (30 req/min) for hosted key only
- BYO `Authorization` bypasses rate limit
- 503 when no hosted key and no BYO header

### Privacy

- Expanded privacy aside in `App` — renders explicitly go to model for QA

### Bundle & latency

- `manualChunks` for potrace, wawoff2, jszip, opentype in `vite.config.ts`
- **Lazy WOFF2** — `buildExportBundle` returns TTF immediately; `ensureWoff2` runs on WOFF2/zip download (fixes Playwright hang, faster preview)

### E2E

- No-agent: upload → generate → zip download
- Gates: scripted store injection via `VITE_E2E_HOOKS` (no OpenRouter in CI)

### Deferred (documented)

- **ots.js WASM** — round-trip via opentype.js only; OTS sanitize optional
- **Real WOFF1 encoder** — passthrough stub from Phase 2

---

## v1 definition of done

All six criteria in [implementation-plan.md](../executing/implementation-plan.md#definition-of-done-v1) are met.

---

## Files added/changed

```
src/lib/rateLimit.ts, fontCoverage.ts, agentLabels.ts
src/components/GlyphGrid.tsx, AgentSettings.tsx, PartialFontWarning.tsx
src/components/RunView.tsx, src/App.tsx, src/main.tsx
src/store/projectStore.ts, src/agent/provider.ts, src/agent/runAgent.ts
api/agent/[...path].ts, vite.config.ts, package.json
tests/unit/rateLimit.test.ts, fontCoverage.test.ts
tests/e2e/smoke.spec.ts, playwright.config.ts
README.md, docs/completions/phase-7-polish.md
```