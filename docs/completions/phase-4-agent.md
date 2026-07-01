# Phase 4 Completion — Agent Infrastructure

**Status:** Complete (code); live agent run requires `OPENROUTER_API_KEY`  
**Date:** 2026-07-01  
**Plan reference:** [implementation-plan.md](../executing/implementation-plan.md) — Phase 4

---

## Goal

Client-side Vercel AI SDK loop drives pipeline tools; `/api/agent` proxies OpenRouter;
agent completes `A` unattended with vision QA (gates stubbed).

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Upload → Start agent → font builds (gates stubbed) | Code ready | `runGlyphAgent` + tools; needs API key for live run |
| Final font quality matches no-agent path | Code ready | Same WASM tools; agent picks params |
| `agentLog` records every tool call + params | Pass | `RunView` + `GlyphJob.agentLog` |
| API key absent from client bundle | Pass | `rg sk-or dist/` — no matches; proxy injects server-side |
| Proxy adds auth header only server-side | Pass | `api/agent/[...path].ts` + Vite dev proxy |
| Provider verification note in Decision log | Pass | implementation-plan Decision log updated |

---

## What was built

### `/api/agent` edge proxy (`api/agent/[...path].ts`)

- Rewrites `/api/agent/*` → `https://openrouter.ai/api/*`
- Injects `OPENROUTER_API_KEY` when client sends no `Authorization`
- Streams SSE through; no body logging

### Vite dev proxy (`vite.config.ts`)

- Same rewrite for local `npm run dev`
- Reads `OPENROUTER_API_KEY` from `.env.local`

### Agent module (`src/agent/`)

| File | Role |
|------|------|
| `provider.ts` | `createOpenRouter({ baseURL: origin + '/api/agent/v1' })` — no client key |
| `systemPrompt.ts` | Toolchain operator prompt |
| `tools.ts` | preprocess, trace, place, buildFont, validate, renderSample, assignCharacter, requestGate (auto-accept), finish |
| `runAgent.ts` | `generateText` + `stopWhen: stepCountIs(6)` + reasoning/cache providerOptions |
| `toolOutput.ts` | `toModelOutput` with PNG previews for vision QA |

### UI

| Component | Role |
|-----------|------|
| `RunView` | Live agent step log + usage tokens/cache read |
| `App` | **Run agent** + **Generate (no agent)** + privacy note |
| Store | `runAgent`, `cancelAgent`, lazy-imports agent chunk |

### Dependencies

- `ai@^6`, `@openrouter/ai-sdk-provider`, `zod`

---

## Bundle split

| Chunk | Gzip | Loads when |
|-------|------|------------|
| Main SPA | ~87 kB | Page load |
| Pipeline WASM | ~149 kB | Generate / agent tools |
| `runAgent` | ~87 kB | First **Run agent** click |

---

## Local agent run

```bash
# .env.local
OPENROUTER_API_KEY=sk-or-...

npm run dev
# Upload A-KaminoDeco.png → Run agent
# Check browser console for [agent] provider usage (cacheReadTokens)
```

Deploy: set `OPENROUTER_API_KEY` in Vercel project env.

---

## Handoff to Phase 5

1. Replace `requestGate` stub with real pause/resume UI
2. App state machine: `gate1` / `gate2` statuses
3. Nudge → param mapping in system prompt

---

## Files added/changed

```
api/agent/[...path].ts
src/agent/*
src/types/agent.ts
src/lib/dataUrl.ts
src/components/RunView.tsx
src/store/projectStore.ts, src/App.tsx
vite.config.ts, vercel.json
package.json (ai, @openrouter/ai-sdk-provider, zod)
tests/unit/agentTools.test.ts, tests/unit/proxyPath.test.ts
docs/completions/phase-4-agent.md
docs/executing/implementation-plan.md (decision log)
```