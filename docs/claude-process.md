# PNG → Font: CLI Process

How to turn a raster glyph image (PNG) into a fully formatted font (OTF master,
plus WOFF/WOFF2 for the web) from the command line — no web app involved.

This is the reference pipeline Claude Code follows to prototype and verify glyph
conversion before the logic is committed to the browser-based app described in
[proposal.md](./proposal.md). The web app (Potrace-WASM + opentype.js + woff2-WASM)
is the product; this CLI path is the fast route to prove the pipeline is sound.

## Scope note

**One PNG is one glyph.** A single image produces a *valid, installable* font that
contains only that one letter. Every per-glyph step below works unchanged for a full
character set — the steps just run in a loop, one image per glyph.

## Reference asset

`A-KaminoDeco.png` — a decorative capital **A**. Two properties drive the plan:

- **Not transparent.** The glyph is near-black on a solid cream background
  (~`#f1efe2`). Preprocessing must key out the background *by luminance*, not by
  relying on an alpha channel.
- **Has a real counter.** The enclosed triangle above the crossbar must be punched
  as a hole, not filled — so contour winding direction matters.

---

## Steps

### 1. Inspect & establish the target frame

Read image dimensions and confirm it can be reduced to bilevel (`sips -g pixelWidth
-g pixelHeight`, or Pillow). Decide the font coordinate system **first** — everything
downstream is measured against it:

- `unitsPerEm = 1000`
- a chosen baseline row (as a fraction of canvas height)
- a cap-height target (~700 units)

A capital `A` has no descender: it runs from baseline (`y = 0`) up to cap height.

### 2. Preprocess into a clean bilevel bitmap

Threshold on luminance so cream → white and ink → solid black, remove anti-aliased
grey edge pixels, and autocrop to ink bounds. Output **PBM/PGM** (Potrace's native
input).

```
magick A-KaminoDeco.png -colorspace Gray -threshold 60% -morphology Close Disk:1 -trim A.pbm
```

- Tracers produce jagged micro-contours from grey anti-aliased edges. A hard
  threshold *before* tracing improves quality more than any tracer setting after.
- **Autocrop horizontally only.** Cropping vertically per-glyph discards the shared
  baseline reference. Crop to ink for *width*; keep a shared vertical transform.

### 3. Trace the bitmap to vector paths

```
potrace A.pbm --svg -o A.svg
```

Tune three knobs:

- `--turdsize` — drop speckles
- `--alphamax` — corner sharpness (keep **high/sharp** to preserve the A's crisp
  apex and pointed feet)
- `--opttolerance` — Bézier curve fit

Output is SVG Bézier paths: the outer outline plus the counter.

### 4. Normalize geometry into em-space & fix winding

Scale the traced contour into the 1000-unit em with the baseline at `y = 0`, then
run a contour-direction correction so outer shape and inner counter wind **opposite**
ways.

- SVG fill rule and OpenType/CFF non-zero fill disagree by default. Same-direction
  contours make CFF paint the counter **solid** — the hole vanishes. Fix with
  FontForge `correctDirection()` or fonttools `ReverseContourPen`. Mandatory for any
  glyph with a hole (`A O a e o p` …).
- SVG Y-axis points **down**; font Y-axis points **up**. The px→em transform must
  flip Y or the glyph imports upside-down.

### 5. Set per-glyph metrics

- `advance width = ink width + left/right side bearings` (proportional, not
  monospaced spacing)
- assign the Unicode code point (`A` → `U+0041`)

### 6. Assemble into a font with required scaffolding

A font is not just outlines — the format requires housekeeping glyphs and tables.
**FontForge's Python API** is the cleanest single CLI tool: it imports the SVG, sets
metrics, and exports every format in one process.

- synthesize `.notdef` (glyph 0, required) and `space` (no outline, real advance
  width)
- populate `cmap` (character → glyph), `name` (family/style — "KaminoDeco"), `OS/2`
  (weight, vertical metrics from the baseline fraction), `post`, `head`

### 7. Export master, then derive web formats

Generate `OTF` as the master, then derive `WOFF` and `WOFF2`.

- FontForge: `font.generate("KaminoDeco.woff2")` etc.
- or `fonttools` / `woff2_compress` separately

WOFF/WOFF2 are compressed wrappers around the same SFNT tables — identical outlines,
fewer bytes.

### 8. Validate and eyeball

"It exported" ≠ "it's correct." Two checks:

- **Structural:** `fonttools ttx KaminoDeco.otf` to dump tables and confirm a clean
  round-trip parse; `ots-sanitize` to confirm the WOFF2 is valid for browsers.
- **Visual:** render a sample with the actual font (`hb-view KaminoDeco.otf "A"`, or
  Pillow `ImageFont` → PNG) and confirm the counter is open, the apex is sharp, and
  the glyph sits on the baseline. This catches winding/flip bugs that pass structural
  validation but look wrong.

---

## Tooling summary

| Step | Tool |
|------|------|
| Preprocess | ImageMagick or Pillow |
| Trace | Potrace |
| Assemble + metrics + export | **FontForge (Python)** — most self-contained; or opentype.js / fonttools for finer control |
| WOFF2 | FontForge, or `woff2_compress` / fonttools |
| Validate | fonttools `ttx`, `ots-sanitize`, `hb-view` |

## Relationship to the web app

The [proposal](./proposal.md) specifies a **browser** pipeline (Potrace-WASM,
opentype.js, woff2-WASM) for privacy and static deployment. This CLI path implements
the same logic natively — FontForge alone collapses steps 6–7 into one script — and
serves as the reference for verifying correctness (threshold values, counter winding,
baseline placement) before that logic is ported to TypeScript.
