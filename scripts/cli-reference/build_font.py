#!/usr/bin/env fontforge
# -*- coding: utf-8 -*-
"""Build KaminoDeco single-glyph reference font from traced SVG."""

import fontforge
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(SCRIPT_DIR, "work")
GOLDEN_DIR = os.path.join(SCRIPT_DIR, "..", "..", "tests", "fixtures", "golden")
PARAMS_PATH = os.path.join(SCRIPT_DIR, "params.json")

SVG_PATH = os.path.join(WORK_DIR, "A.svg")
META_PATH = os.path.join(WORK_DIR, "preprocess-meta.json")


def load_params():
    with open(PARAMS_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_meta():
    with open(META_PATH, encoding="utf-8") as f:
        return json.load(f)


def main():
    params = load_params()
    meta = load_meta()

    place = params["place"]
    metrics_cfg = params["metrics"]
    font_meta = params["fontMeta"]

    U = place["unitsPerEm"]
    H = meta["canvasHeight"]
    b = place["baselineFraction"]
    s = U / H

    left_bearing = metrics_cfg["leftBearing"]
    right_bearing = metrics_cfg["rightBearing"]
    ink_width_em = meta["bitmapWidth"] * s
    advance_width = int(round(ink_width_em + left_bearing + right_bearing))

    os.makedirs(GOLDEN_DIR, exist_ok=True)

    font = fontforge.font()
    font.encoding = "Unicode"
    font.fontname = f"{font_meta['family']}-Regular"
    font.familyname = font_meta["family"]
    font.fullname = f"{font_meta['family']} {font_meta['style']}"
    font.weight = font_meta["style"]
    font.copyright = "Reference build for fontgenerator Phase 0"
    font.em = U
    font.ascent = int(round(b * U))
    font.descent = int(round((1 - b) * U))

    notdef = font.createChar(0, ".notdef")
    notdef.width = metrics_cfg["notdefWidth"]

    space = font.createChar(0x20, "space")
    space.width = metrics_cfg["spaceWidth"]

    glyph = font.createChar(0x41, "A")
    glyph.importOutlines(SVG_PATH)
    glyph.correctDirection()

    # FontForge applies the SVG transform group; imported coords are already y-up.
    # Anchor the foot (min y) to the font baseline at y=0, then scale px→em.
    _xmin, ymin, _xmax, _ymax = glyph.boundingBox()
    glyph.transform((s, 0, 0, s, left_bearing, -ymin * s))
    glyph.width = advance_width

    otf_path = os.path.join(GOLDEN_DIR, "KaminoDeco.otf")
    woff_path = os.path.join(GOLDEN_DIR, "KaminoDeco.woff")
    woff2_path = os.path.join(GOLDEN_DIR, "KaminoDeco.woff2")

    font.generate(otf_path)
    font.generate(woff_path)
    font.generate(woff2_path)

    print(f"Generated: {otf_path}")
    print(f"  advance={advance_width} ascent={font.ascent} descent={font.descent}")
    print(f"  bbox={glyph.boundingBox()}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)