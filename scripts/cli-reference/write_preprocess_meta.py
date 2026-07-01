#!/usr/bin/env python3
"""Write preprocess-meta.json from params + measured ink bounds."""

import json
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..", "..")
WORK = os.path.join(SCRIPT_DIR, "work")
PARAMS_PATH = os.path.join(SCRIPT_DIR, "params.json")
FULL_PBM = os.path.join(WORK, "A-full.pbm")
CROPPED_PBM = os.path.join(WORK, "A.pbm")


def ink_bbox(pbm_path: str) -> tuple[int, int, int, int]:
    out = subprocess.check_output(
        ["magick", pbm_path, "-format", "%@", "info:"],
        text=True,
    ).strip()
    # WxH+X+Y
    bw_s, rest = out.split("x", 1)
    bh_s, xy = rest.split("+", 1)
    bx_s, by_s = xy.split("+", 1)
    bw, bh, bx, by = map(int, (bw_s, bh_s, bx_s, by_s))
    return bx, by, bx + bw - 1, by + bh - 1


def main():
    with open(PARAMS_PATH, encoding="utf-8") as f:
        params = json.load(f)

    _, _, _, ink_bottom = ink_bbox(FULL_PBM)
    ink_left, ink_top, ink_right, _ = ink_bbox(FULL_PBM)

    fw = params["canvas"]["width"]
    fh = params["canvas"]["height"]
    bw = params["canvas"]["bitmapWidth"]
    bh = fh

    meta = {
        "source": params["source"],
        "sourceWidth": params["canvas"]["width"],
        "sourceHeight": params["canvas"]["height"],
        "preprocess": params["preprocess"],
        "inkBounds": {
            "left": ink_left,
            "right": ink_right,
            "top": ink_top,
            "bottom": ink_bottom,
            "width": ink_right - ink_left + 1,
            "height": ink_bottom - ink_top + 1,
        },
        "bitmapWidth": bw,
        "bitmapHeight": bh,
        "canvasHeight": fh,
    }

    out_path = os.path.join(WORK, "preprocess-meta.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    print(f"Wrote {out_path}")


if __name__ == "__main__":
    os.environ["PATH"] = "/opt/homebrew/bin:" + os.environ.get("PATH", "")
    main()