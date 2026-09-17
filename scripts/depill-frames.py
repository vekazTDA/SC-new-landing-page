#!/usr/bin/env python3
"""
Erase the baked-in "Explore Our Options" pill from a scroll-scrub frame sequence.

    python3 depill_frames.py public/frames/box-horz
    python3 depill_frames.py public/frames/box-vert --dry-run

Rewrites every frame in <dir> IN PLACE. The pill sits on bare, smooth taupe
backdrop, so it is erased by replacing a rectangle with a Coons (bilinear-from-
the-four-boundary-edges) reconstruction of that backdrop. Measured on
public/frames/box-*/0120.jpg: max per-channel delta across the patch boundary
1.00/255 (horz) and 0.00/255 (vert); reconstruction error against known
backdrop, same rect size, 8 control positions: max 4.46 mean 0.53 (horz),
max 1.97 mean 0.07 (vert) — i.e. below the JPEG blocking floor of the source.

The rect is stored as fractions of the frame, so it survives re-extraction at a
different width. JPEGs are re-encoded with the SOURCE quantization tables and
subsampling, which is near-idempotent for the untouched 99.5% of the frame
(measured max delta 6/255 on a handful of pixels, mean 0.002/255).

Only PIL is required.
"""
import argparse, os, sys
from statistics import median
from PIL import Image, JpegImagePlugin

# Pill rect as fractions of the frame: (left, top, right, bottom), right/bottom
# exclusive. = detected pill bbox of the busiest frame (0120) + ~4px of safety.
#   horz  pill core x[600..841] y[797..865] of 1440x930
#   vert  pill core x[112..287] y[688..735] of 402x874
RECTS = {
    "horz": (594 / 1440, 792 / 930, 847 / 1440, 872 / 930),
    "vert": (106 / 402, 683 / 874, 294 / 402, 741 / 874),
}
GUARD = 8          # px of backdrop that must surround the rect
GUARD_TOL = 4.0    # levels; source JPEG blocking measures 2.0, real content >10


def pick_set(w, h):
    return "horz" if w >= h else "vert"


def rect_px(name, w, h):
    fx0, fy0, fx1, fy1 = RECTS[name]
    return (round(fx0 * w), round(fy0 * h), round(fx1 * w) - 1, round(fy1 * h) - 1)


def _rows(px, x0, y0, x1, y1):
    return [[px[x, y] for x in range(x0, x1 + 1)] for y in range(y0, y1 + 1)]


def guard_is_clean(px, w, h, r, win=21, tol=GUARD_TOL):
    """True when the GUARD-px ring around r is bare backdrop (no box, shadow,
    callout or connector line has wandered in). Deviation from a rolling median
    along each row, which is flat for a smooth gradient and spikes on any mark."""
    x0, y0, x1, y1 = r
    gx0, gy0 = max(x0 - GUARD, 0), max(y0 - GUARD, 0)
    gx1, gy1 = min(x1 + GUARD, w - 1), min(y1 + GUARD, h - 1)
    worst = 0.0
    half = win // 2
    for y in range(gy0, gy1 + 1):
        inside_v = y0 <= y <= y1
        row = [sum(px[x, y]) / 3.0 for x in range(gx0, gx1 + 1)]
        n = len(row)
        for i, v in enumerate(row):
            x = gx0 + i
            if inside_v and x0 <= x <= x1:
                continue  # the pill itself
            lo, hi = max(0, i - half), min(n, i + half + 1)
            worst = max(worst, abs(v - median(row[lo:hi])))
    return worst <= tol, worst


def coons(px, r):
    """Backdrop inside r, interpolated from the four adjacent boundary lines."""
    x0, y0, x1, y1 = r
    w, h = x1 - x0 + 1, y1 - y0 + 1
    top = [px[x, y0 - 1] for x in range(x0, x1 + 1)]
    bot = [px[x, y1 + 1] for x in range(x0, x1 + 1)]
    left = [px[x0 - 1, y] for y in range(y0, y1 + 1)]
    right = [px[x1 + 1, y] for y in range(y0, y1 + 1)]
    c00, c01 = px[x0 - 1, y0 - 1], px[x1 + 1, y0 - 1]
    c10, c11 = px[x0 - 1, y1 + 1], px[x1 + 1, y1 + 1]
    out = bytearray(w * h * 3)
    k = 0
    for i in range(h):
        a = (i + 1) / (h + 1)
        li, ri = left[i], right[i]
        for j in range(w):
            b = (j + 1) / (w + 1)
            tj, bj = top[j], bot[j]
            for c in range(3):
                s1 = (1 - a) * tj[c] + a * bj[c]
                s2 = (1 - b) * li[c] + b * ri[c]
                s3 = ((1 - a) * ((1 - b) * c00[c] + b * c01[c])
                      + a * ((1 - b) * c10[c] + b * c11[c]))
                v = int(s1 + s2 - s3 + 0.5)
                out[k] = 0 if v < 0 else (255 if v > 255 else v)
                k += 1
    return Image.frombytes("RGB", (w, h), bytes(out))


def process(path, forced_set=None, verify=True, dry=False):
    src = Image.open(path)
    fmt = src.format
    qtables = getattr(src, "quantization", None)
    try:
        subsampling = JpegImagePlugin.get_sampling(src)
    except Exception:
        subsampling = -1
    im = src.convert("RGB")
    w, h = im.size
    name = forced_set or pick_set(w, h)
    r = rect_px(name, w, h)
    px = im.load()
    if verify:
        ok, worst = guard_is_clean(px, w, h, r)
        if not ok:
            return ("SKIP", name, r, worst)
    else:
        worst = float("nan")
    patch = coons(px, r)
    if dry:
        return ("DRY", name, r, worst)
    im.paste(patch, (r[0], r[1]))
    if fmt == "JPEG":
        kw = dict(optimize=True)
        if qtables:
            kw["qtables"] = qtables
        if subsampling is not None and subsampling >= 0:
            kw["subsampling"] = subsampling
        im.save(path, "JPEG", **kw)
    else:
        im.save(path, fmt or "PNG")
    return ("OK", name, r, worst)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("directory", help="directory of frames, rewritten in place")
    ap.add_argument("--set", choices=("horz", "vert"),
                    help="force the rect (default: horz when w >= h, else vert)")
    ap.add_argument("--no-verify", action="store_true",
                    help="skip the guard-ring check (not recommended)")
    ap.add_argument("--dry-run", action="store_true", help="report, write nothing")
    a = ap.parse_args()
    files = sorted(f for f in os.listdir(a.directory)
                   if f.lower().endswith((".jpg", ".jpeg", ".png")))
    if not files:
        sys.exit(f"no frames in {a.directory}")
    counts, skipped, worst_all, rect = {}, [], 0.0, None
    for f in files:
        st, name, r, worst = process(os.path.join(a.directory, f), a.set,
                                     not a.no_verify, a.dry_run)
        counts[st] = counts.get(st, 0) + 1
        rect = r
        if worst == worst:
            worst_all = max(worst_all, worst)
        if st == "SKIP":
            skipped.append((f, worst))
    print(f"{a.directory}: {len(files)} frames, set={a.set or name}, "
          f"rect x[{rect[0]}..{rect[2]}] y[{rect[1]}..{rect[3]}], "
          f"guard-ring worst deviation {worst_all:.2f}/255 (tolerance {GUARD_TOL})")
    print("  " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))
    for f, worst in skipped:
        print(f"  SKIPPED {f}: guard ring deviates {worst:.2f} — content is "
              f"inside the pill rect, refusing to smear it")
    if skipped:
        sys.exit(1)


if __name__ == "__main__":
    main()
