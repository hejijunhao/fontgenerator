# Product Blueprint — Agentic Font Generator

The concrete build spec. Where [proposal.md](./proposal.md) says *what* and *why*,
this says *how* — the tool contract, data model, agent design, serverless proxy,
deployment, and a milestone plan with acceptance criteria. The CLI reference for the
underlying font math is [claude-process.md](./claude-process.md).

---

## 1. Positioning

**One line:** drop letter PNGs, an AI agent turns them into an installable font while
you approve two checkpoints, download OTF/WOFF/WOFF2 — all in the browser, nothing
saved.

**Who it's for:** designers who draw letterforms as images (Procreate, Illustrator,
scans) and want a font without learning FontForge or fiddling with trace sliders.

**v1 shape:** stateless (no accounts/DB, refresh = fresh), static on Vercel, font
pipeline entirely client-side WASM, one stateless serverless function for the agent.

**Non-goals for v1:** persistence/accounts, kerning, multiple weights, a full manual
control panel, desktop/filesystem, color fonts. (See proposal *Explicitly deferred*.)

---

## 2. UX Flow (states)

A single-page, single-pass flow. The store moves through these states:

```
empty → uploaded → agent-running → gate1(trace) → agent-running
      → gate2(font) → exporting → done
      (reject/nudge at either gate loops back to agent-running)
```

| State | Screen | Primary actions |
|-------|--------|-----------------|
| `empty` | Drop zone | Drag PNG(s) / file picker |
| `uploaded` | Glyph thumbnails grid | Start, remove glyphs |
| `agent-running` | Run view: streamed agent steps + current stage | (watch) / cancel |
| `gate1` | Original PNG ↔ traced-vector overlay; proposed character | **Accept** · **Re-trace** (text nudge) · **Fix character** |
| `gate2` | Sample text rendered in the built font; validation badges | **Accept & export** · **Adjust** (text nudge) |
| `exporting` | Progress | (watch) |
| `done` | Download buttons + "copy recipe" | Download OTF/WOFF/WOFF2/zip · New run |

**Batch:** for multiple glyphs, Gate 1 is per-glyph (or a batched grid where each
tile is accept/re-trace); Gate 2 is once for the assembled font. Keep gates sparse —
more than two and we've rebuilt the control panel we deleted.

**Gate nudges are natural language**, mapped by the agent to parameter changes:
"sharper corners" → higher `alphamax`; "sits too low" → baseline/vertical override;
"counter is filled" → force winding correction + re-trace.

---

## 3. Deterministic Pipeline Tools

These are plain TypeScript functions wrapping WASM/Canvas. They are also the **agent's
tool surface** (§5). Each is pure-ish: input + params → output + a preview image for
the agent to look at. No tool makes a judgment call; that's the agent's job.

```ts
// All coordinates in font units unless noted. Previews are PNG data URLs.

type PreprocessParams = { threshold: number; close: number; invert: boolean };
type PreprocessResult = {
  bitmap: ImageBitmapLike;          // bilevel
  inkBounds: { x: number; y: number; w: number; h: number };
  canvasHeight: number;             // for the shared px→em transform
  previewPng: string;
};
function preprocess(png: Blob, p: PreprocessParams): Promise<PreprocessResult>;

type TraceParams = { turdsize: number; alphamax: number; opttolerance: number };
type TraceResult = { paths: SvgPath[]; previewPng: string };
function trace(bitmap: ImageBitmapLike, p: TraceParams): Promise<TraceResult>;

type Metrics = { leftBearing: number; rightBearing: number; advanceWidth: number };
type PlaceParams = {
  unitsPerEm: number;               // e.g. 1000
  baselineFraction: number;         // b in [0,1] from top
  verticalOverride?: { dyEm: number; scale: number };  // escape hatch
};
type Contour = { points: Point[]; clockwise: boolean };
type PlacedGlyph = { codepoint: number; contours: Contour[]; metrics: Metrics };
function place(trace: TraceResult, srcHeight: number,
              codepoint: number, p: PlaceParams): PlacedGlyph;   // applies px→em + Y-flip + winding fix

type FontMeta = { family: string; style: string; unitsPerEm: number; baselineFraction: number };
function buildFont(glyphs: PlacedGlyph[], meta: FontMeta): Uint8Array;   // OTF bytes (adds .notdef + space)

function renderSample(otf: Uint8Array, text: string): Promise<string>;   // preview PNG for QA
function validate(otf: Uint8Array): { otsOk: boolean; roundTripOk: boolean; warnings: string[] };
function toWoff2(otf: Uint8Array): Uint8Array;   // wawoff2
function toWoff(otf: Uint8Array): Uint8Array;
```

**Load-bearing details (from [claude-process.md](./claude-process.md)):**

- `preprocess` thresholds on **luminance** (default, not fallback — handles the cream
  background of `A-KaminoDeco.png`); crops **horizontally only**.
- `place` applies the **shared** px→em transform (`s = U / H`, baseline at `b·H`),
  **flips Y** (SVG down → font up), and runs **winding correction** so counters
  (`A`, `o`, `e`…) are punched, not filled.
- `buildFont` synthesizes `.notdef` (glyph 0) and `space`, and writes `cmap`, `name`,
  `OS/2` (vertical metrics from `baselineFraction`), `post`, `head`.
- WOFF/WOFF2 are compressed wrappers over the same OTF tables.

> **opentype.js caveat to resolve during Milestone 2:** opentype.js writes
> TrueType-flavored (`glyf`) outlines robustly; CFF/OTF *writing* support is limited.
> Decide early whether the "OTF master" is CFF or TrueType-flavored, or whether to
> emit TTF as the master and derive WOFF/WOFF2 from that. This is a correctness fork,
> not a UI one — pin it before building the agent on top.

---

## 4. Data Model (ephemeral client state)

All in a Zustand store. Nothing is persisted; a refresh drops it.

```ts
type GlyphJob = {
  id: string;
  sourcePng: Blob;
  codepoint?: number;               // agent-proposed, human-confirmed
  preprocess?: PreprocessResult & { params: PreprocessParams };
  trace?: TraceResult & { params: TraceParams };
  placed?: PlacedGlyph & { params: PlaceParams };
  status: 'pending' | 'running' | 'gate1' | 'gate2' | 'accepted' | 'error';
  agentLog: AgentStep[];            // the recipe: every tool call + params + verdict
  error?: string;
};

type Project = {
  glyphs: GlyphJob[];
  meta: FontMeta;
  output?: { otf: Uint8Array; woff: Uint8Array; woff2: Uint8Array };
  recipe?: Recipe;                  // serializable replay of the whole run
};

type AgentStep = { tool: string; params: unknown; verdict?: string; previewPng?: string };
type Recipe = { version: 1; meta: FontMeta; glyphs: { codepoint: number;
  preprocess: PreprocessParams; trace: TraceParams; place: PlaceParams }[] };
```

**Recipe** is the reproducibility artifact: replaying a recipe re-runs the
deterministic tools with pinned params and **skips the agent entirely** — identical
output, no model cost.

---

## 5. Agent Design

### Role

The agent is the **operator of the deterministic toolchain**, not a font engine. It
(a) chooses parameters from images, (b) visually QAs output, (c) proposes character
assignments, (d) decides when to advance vs. re-run vs. hand off to a gate. It never
reimplements trace/build math.

### Stack, model & request shape

- **Gateway:** **OpenRouter** — one key, many models. Slugs use **dots**:
  `anthropic/claude-opus-4.8` (default), `anthropic/claude-sonnet-5` (cheaper
  multimodal fallback). Not the native `claude-opus-4-8` dashed form.
- **Loop framework:** **Vercel AI SDK** (`ai`) with `@openrouter/ai-sdk-provider`,
  running **client-side** so each tool's `execute` runs in the browser next to its WASM.
- **Tools:** the pipeline functions in §3 as AI SDK tools —
  `tool({ description, inputSchema: <zod>, execute })`. Add `assignCharacter`,
  `requestGate({stage, summary})`, `finish`. Loop control: `stopWhen: stepCountIs(6)`.
- **Reasoning:** `providerOptions.openrouter.reasoning: { effort: "high" }`. OpenRouter
  maps `effort` → Anthropic's native `output_config.effort`; thinking is **adaptive-only**
  on 4.7/4.8 and a fixed `reasoning.max_tokens` budget is **ignored**. ⚠️ A community
  report claims `effort` may be a silent no-op on 4.6+/Fable — verify it takes effect.
- **Vision:** send render previews as AI SDK image parts in the tool result, so the
  agent sees what its last tool produced. (Claude models on OpenRouter are multimodal.)
- **Prompt caching:** `providerOptions.openrouter.cacheControl: { type: "ephemeral" }`
  on the stable system+tools prefix (or top-level automatic caching, which auto-advances
  the breakpoint). ⚠️ An open provider issue reports Anthropic caching sometimes not
  applying through the AI SDK — verify `cache_read` usage is non-zero.

### System prompt responsibilities (outline)

- You operate a fixed toolchain; call tools, look at previews, don't invent geometry.
- Preprocess: pick a luminance threshold that yields clean solid ink; re-run if edges
  are ragged or ink is broken.
- Trace: keep `alphamax` high enough to preserve sharp apexes/feet; check that counters
  are open in the preview.
- Place/build: choose baseline and side bearings; propose the character (you can read
  the glyph); confirm counters render punched, glyph is upright, sits on the baseline.
- Gates: after tracing, `requestGate("trace")`; after build+render, `requestGate("font")`.
- On a human nudge, translate it to a concrete parameter change and re-run the minimal
  stage. Record your chosen params.

### Failure handling

- **Max iterations per glyph** (e.g. 6 tool calls) before forcing a gate, so a
  confused agent can't loop forever.
- **WASM tool throws** → return a `tool_result` with `is_error: true`; agent retries
  with different params or surfaces to the human.
- **Model/proxy error** → browser retries with backoff (the SDK retries 429/5xx); after
  retries, surface to the human with the option to continue manually.
- **Refusal** (`stop_reason: "refusal"`) → unlikely for glyph work, but check
  `stop_reason` before reading content; surface a friendly error.

### Cost / latency envelope (rough)

Per glyph: a handful of turns, each carrying the cached system prompt + one small
render (~1–2K image tokens; our glyphs are simple), a few K output tokens.

- **Opus 4.8** ($5 in / $25 out per 1M native; OpenRouter bills ~provider price plus a
  small gateway margin): order of **$0.05–$0.20 per glyph**; a full A–Z uppercase set
  roughly **$1.50–$5**.
- **Sonnet 5** ($3/$15 native, intro $2/$10 through 2026-08-31): roughly half that.
- Prompt caching cuts the repeated system-prompt input cost ~90%.
- A **fast path** (skip the agent, use default params + the recipe) is free of model
  cost — offer it for confident/simple inputs and for recipe replays.

These are estimates; validate with `count_tokens` on real renders during Milestone 4
before quoting anything to users. Log dropped/capped work rather than silently
truncating.

---

## 6. System Architecture

### Runtime split

- **Static SPA (Vercel CDN):** the whole font pipeline (Canvas + Potrace-WASM +
  opentype.js + wawoff2) and the agent-loop orchestrator run here, in the user's tab.
- **Stateless serverless function (`/api/agent`):** the *only* server code — a thin
  OpenRouter reverse-proxy that injects the key and forgets everything.

### The loop (Vercel AI SDK, client-side)

The AI SDK runs the loop in the browser; we don't hand-roll it:

```ts
streamText({                                   // or the Agent class
  model: openrouter('anthropic/claude-opus-4.8'),   // provider baseURL → /api/agent
  tools: { preprocess, trace, buildFont, renderSample, requestGate, finish },
  // each tool: tool({ inputSchema: <zod>, execute: <browser WASM fn> })
  stopWhen: stepCountIs(6),
  providerOptions: { openrouter: {
    reasoning: { effort: 'high' },
    cacheControl: { type: 'ephemeral' },       // on the stable system+tools prefix
  }},
})
```

The SDK drives model turn → `execute` the requested tool in the browser → next turn.
`requestGate.execute` pauses for the human. Each model turn is one short call through
the proxy, so the loop and all tool execution stay client-side and never hit Vercel's
function time limit.

### `/api/agent` contract (OpenRouter reverse-proxy)

Because `createOpenRouter({ baseURL })` is supported, the function is just a thin
reverse-proxy for OpenRouter — not an Anthropic-specific shim:

```
ANY /api/agent/*  →  https://openrouter.ai/api/v1/*
  adds:  Authorization: Bearer <OPENROUTER_API_KEY>   (hosted mode)
  passes through: request body, and streaming (SSE) responses
  state: none. No logging of image content. No persistence.
```

- **Hosted default:** key from `process.env.OPENROUTER_API_KEY` (Vercel env var).
- **BYO-key:** the user's OpenRouter key is forwarded for that call only, never stored
  (or the browser calls OpenRouter directly if CORS permits — see Risks).
- **Streaming:** SSE passes straight through so the UI can show the agent working.

### Data flow (privacy view)

- PNG bytes, bitmaps, SVG paths, font bytes: **never leave the browser** for the
  conversion.
- Render previews + the agent's messages: **do** go to the model (via the proxy) —
  the one intentional trade for vision-based QA.

---

## 7. Validation & QA

Two layers, matching the CLI reference's structural + visual split:

- **Structural (in `validate`):** a round-trip parse of the built OTF (opentype.js can
  re-read what it wrote) and, ideally, an OTS-equivalent check via an `ots.js` WASM
  build so we catch fonts browsers would silently reject. Surfaces `warnings`.
- **Visual (agent):** `renderSample` → the agent looks at the render and confirms
  counters open, glyph upright, baseline correct. This catches winding/flip bugs that
  pass structural validation but look wrong — the class the deterministic app's
  input-only validation would miss.

Gate 2 shows both: the render and the structural badges.

---

## 8. Deployment (Vercel)

- **Build:** Vite SPA → static output served from Vercel's CDN.
- **Function:** `/api/agent` as a Vercel serverless (Node) function — a thin OpenRouter
  reverse-proxy; env var `OPENROUTER_API_KEY`. Stateless — no `/tmp`, no DB.
- **Time limits:** one model turn per invocation keeps each call to seconds; the loop
  lives in the browser, so long agent runs never hit the function ceiling.
- **WASM assets:** `esm-potrace-wasm`, `wawoff2` (and optionally `ots.js`) ship as
  static assets, loaded and executed client-side.
- **No native binaries** (FontForge/Potrace executables can't run here — that's the
  CLI-only path).
- **Config:** `vercel.json` for the function; env var in the Vercel dashboard.

---

## 9. Security & Privacy

- **API key never in the client bundle.** Hosted mode keeps it in the function's env;
  BYO mode passes the user's key per-request and never stores it.
- **Proxy stores/logs nothing** — especially not image content.
- **Rate limiting** on `/api/agent` (hosted mode) to prevent key abuse — e.g. per-IP
  limits, since there are no accounts. Note this as a v1 must-have if hosted publicly.
- **Font artwork stays local** for all conversion; only renders the agent must see are
  sent to the model. State this in the UI so users aren't surprised.

---

## 10. Milestones & Acceptance Criteria

| # | Milestone | Done when… |
|---|-----------|-----------|
| 1 | Scaffold + deploy | Empty Vite/React/TS/Tailwind SPA live on Vercel |
| 2 | WASM pipeline + font math | `preprocess`/`trace`/`place`/`buildFont`/`toWoff2` exist; Vitest covers px→em transform + winding on `A-KaminoDeco.png`; OTF-vs-TTF master decision pinned |
| 3 | No-agent happy path | Hardcoded params turn `A-KaminoDeco.png` into a downloadable OTF that renders an open-countered, upright `A` |
| 4 | Agent loop | `/api/agent` reverse-proxies OpenRouter; the client-side Vercel AI SDK loop drives the WASM tools; agent traces + builds the `A` unattended; **confirm `reasoning.effort` and `cacheControl` actually take effect** (see Risks); cost measured from OpenRouter usage |
| 5 | Gates | Gate 1 (trace review) + Gate 2 (font review) with accept / re-trace-nudge / fix-character |
| 6 | Full export + recipe | WOFF/WOFF2 + zip; recipe logged and replayable (agent-free) |
| 7 | Polish | Batch upload, streamed agent narration, partial-font warnings, BYO-key mode, rate limiting |

**Proof-of-concept shortcut:** Milestones 2–3 are exactly the CLI reference pipeline,
so validating [claude-process.md](./claude-process.md) on `A-KaminoDeco.png` first
de-risks the hardest correctness questions (threshold, winding, baseline, OTF vs TTF)
before any agent or UI exists.

---

## 11. Open Questions & Risks

| Item | Risk | Mitigation |
|------|------|-----------|
| opentype.js CFF/OTF writing | "OTF master" may be impractical; may need TTF master | Pin the master format in Milestone 2; derive WOFF/WOFF2 from whatever the master is |
| WASM bundle size | Potrace + wawoff2 (+ ots.js) inflate first load | Lazy-load WASM on first use; code-split |
| Agent cost/latency | Vision turns add up on large sets | Prompt caching; Sonnet-5 option; fast-path/recipe replay; measure early |
| Non-determinism | Same PNG → slightly different params run to run | Recipe logging gives replayability; gates catch bad runs |
| Public hosting abuse | Keyless proxy could be abused | Rate limit per-IP; BYO-key mode; usage caps |
| Privacy expectation | Users may assume *nothing* leaves the machine | State plainly that renders go to the model for QA |
| Reasoning-effort passthrough | OpenRouter *documents* `reasoning.effort` → native effort, but a community issue reports it may be a silent no-op on Claude 4.6+/Fable | Verify effort changes behavior/usage at Milestone 4; adaptive thinking still runs regardless of effort |
| Prompt-cache passthrough | An open `@openrouter/ai-sdk-provider` issue reports Anthropic caching sometimes not applying | Confirm non-zero `cache_read` in usage; if it can't be made to cache, accept full input cost (cost envelope still holds without the ~90% discount) |
| BYO-key browser CORS | OpenRouter browser/CORS support isn't documented; direct-from-browser BYO may fail | Route BYO-key through the same `/api/agent` proxy (always works); treat direct-browser as a nice-to-have |
| No custom `fetch` on the provider | `createOpenRouter` documents `baseURL`/`headers`/`extraBody` but not a `fetch` override | `baseURL` → `/api/agent` is sufficient for proxy routing; no `fetch` override needed |

---

## 12. Summary

A static Vercel SPA runs the entire font pipeline in the browser (Canvas, Potrace-WASM,
opentype.js, wawoff2). The **Vercel AI SDK** runs the agent loop client-side against
**OpenRouter** (`anthropic/claude-opus-4.8`, vision + tool use) through a thin stateless
key-injecting reverse-proxy; the agent chooses preprocessing and trace parameters and
visually QAs its own output, while a human approves at two gates. Deterministic font math stays in code; the agent supplies judgment; every run is
logged as a replayable recipe. Nothing is persisted. The pipeline's correctness is
proven first in the CLI reference ([claude-process.md](./claude-process.md)) on
`A-KaminoDeco.png`, then productized here.
