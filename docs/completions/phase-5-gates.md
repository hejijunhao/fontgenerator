# Phase 5 Completion — Human Gates

**Status:** Complete  
**Date:** 2026-07-01  
**Plan reference:** [implementation-plan.md](../executing/implementation-plan.md) — Phase 5

---

## Goal

Replace stub gates with real review UI; natural-language nudges re-run minimal pipeline
stages via the agent.

---

## Exit checklist

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Re-trace nudge changes trace path | Code ready | `requestGate` returns `action: retrace` + nudge; prompt maps to `alphamax` etc. |
| Fix character updates codepoint | Pass | Gate 1 **Fix character** → `ctx.codepoint` before agent resumes |
| Gate 2 "counter filled" nudge | Code ready | **Adjust** returns `action: adjust`; prompt maps to re-trace/re-place |
| Two human interactions minimum | Pass | Gate 1 + Gate 2 block `generateText` until Accept |
| Nudge loops → `agent-running` not blank | Pass | `onGateClose` sets `agent-running`; log preserved |

---

## State machine

```
pending → agent-running → gate1 → agent-running → gate2 → exporting → done
              ↑_______________|        ↑_______________|
              (retrace / fix)          (adjust nudge)
```

`GlyphJob.status`: `gate1` | `gate2` | `exporting` added.

---

## What was built

### Gate pause (`src/agent/gateController.ts`)

`requestGate` `execute` awaits `GateController.waitForHuman()` — blocks the AI SDK
loop until the user acts. Responses: accept, retrace+nudge, fixCharacter, adjust+nudge.

### Gate UI

| Component | Actions |
|-----------|---------|
| `Gate1Panel` | Accept trace · Re-trace (nudge) · Fix character |
| `Gate2Panel` | Accept & export (triggers download) · Adjust (nudge) |

Side-by-side source PNG + trace preview (Gate 1); render + validation badges (Gate 2).

### Store

- `gateHandlers` exposed while paused
- `gate` snapshot on `GlyphJob` for UI
- Cancel aborts agent + clears gate

### System prompt

Nudge → parameter map (sharper corners, counter filled, baseline, etc.) in
`src/agent/systemPrompt.ts`.

### Guards

- `stopWhen: stepCountIs(12)` for nudge loops
- Gate summary notes when ≥8 tool calls

---

## Handoff to Phase 6

1. Export panel: WOFF/WOFF2 + zip
2. Recipe serializer from `agentLog`
3. Copy recipe + replay path

---

## Files added/changed

```
src/agent/gateController.ts
src/agent/tools.ts (requestGate)
src/agent/runAgent.ts
src/agent/systemPrompt.ts
src/types/agent.ts (GateSnapshot)
src/components/Gate1Panel.tsx, Gate2Panel.tsx
src/store/projectStore.ts, src/App.tsx, src/components/DropZone.tsx
tests/unit/gateController.test.ts
docs/completions/phase-5-gates.md
```