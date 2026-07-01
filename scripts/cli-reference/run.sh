#!/usr/bin/env bash
# Phase 0 — reproducible CLI reference pipeline for A-KaminoDeco.png
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$ROOT/scripts/cli-reference/work"
GOLDEN="$ROOT/tests/fixtures/golden"
SRC="$ROOT/A-KaminoDeco.png"
PARAMS="$ROOT/scripts/cli-reference/params.json"

export PATH="/opt/homebrew/bin:${PATH:-}"

mkdir -p "$WORK" "$GOLDEN"

echo "==> 0.1 Inspect source"
W=$(magick identify -format "%w" "$SRC")
H=$(magick identify -format "%h" "$SRC")
echo "    Source dimensions: ${W}x${H}"

THRESHOLD=$(python3 -c "import json; print(int(json.load(open('$PARAMS'))['preprocess']['threshold']*100))")

echo "==> 0.2 Preprocess (luminance threshold ${THRESHOLD}%, horizontal-only crop)"
magick "$SRC" -colorspace Gray -threshold "${THRESHOLD}%" -morphology Close Disk:1 \
  "$WORK/A-full.pbm"

BBOX=$(magick "$WORK/A-full.pbm" -format "%@" info:)
BW=${BBOX%%x*}
REST=${BBOX#*x}
BX=${REST#*+}
BX=${BX%%+*}

magick "$WORK/A-full.pbm" -crop "${BW}x${H}+${BX}+0" +repage "$WORK/A.pbm"
magick "$WORK/A.pbm" "$WORK/A-preprocessed.png"

python3 "$ROOT/scripts/cli-reference/write_preprocess_meta.py"

echo "==> 0.3 Trace (Potrace)"
TRACE_TURD=$(python3 -c "import json; print(json.load(open('$PARAMS'))['trace']['turdsize'])")
TRACE_ALPHA=$(python3 -c "import json; print(json.load(open('$PARAMS'))['trace']['alphamax'])")
TRACE_OPT=$(python3 -c "import json; print(json.load(open('$PARAMS'))['trace']['opttolerance'])")

potrace "$WORK/A.pbm" --svg -o "$WORK/A.svg" \
  --turdsize "$TRACE_TURD" --alphamax "$TRACE_ALPHA" --opttolerance "$TRACE_OPT"

cp "$WORK/A.svg" "$GOLDEN/A.svg"

echo "==> 0.4–0.5 Build + export (FontForge)"
fontforge -lang=py -script "$ROOT/scripts/cli-reference/build_font.py"

echo "==> 0.6 Structural validation"
ttx -o "$WORK/KaminoDeco.ttx" "$GOLDEN/KaminoDeco.otf"
echo "    ttx round-trip: OK"

if command -v ots-sanitize >/dev/null 2>&1; then
  ots-sanitize "$GOLDEN/KaminoDeco.woff2"
  echo "    ots-sanitize WOFF2: OK"
else
  echo "    ots-sanitize: skipped (not installed)"
fi

echo "==> 0.7 Visual validation"
FONT_SIZE=200
hb-view --font-file="$GOLDEN/KaminoDeco.otf" --text="A" --font-size="$FONT_SIZE" \
  --margin=40 --output-file="$GOLDEN/A-render-hb.png"
magick "$GOLDEN/A-render-hb.png" -background white -flatten "$GOLDEN/A-render.png"

echo "==> Done. Golden artifacts in $GOLDEN"