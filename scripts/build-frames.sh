#!/usr/bin/env bash
# Build a scroll-scrub frame sequence for BoxShowcaseSection.
#
#   scripts/build-frames.sh <input.mp4> <outDir> <width> <count> <endSeconds> [webpQuality]
#
# Example (both sets as shipped):
#   scripts/build-frames.sh "public/videos/001 - HORZ.mp4" public/frames/box-horz 2048 120 7.8 80
#   scripts/build-frames.sh "public/videos/001 - VERT.mp4" public/frames/box-vert  402 120 7.8 80
#
# Pipeline: extract lossless PNG -> erase the baked-in CTA pill -> encode WebP once.
# Going through PNG matters: de-pilling a JPEG and then encoding WebP would put the
# frames through two lossy generations. This way they are encoded exactly once.
#
# Requires: swift (AVFoundation), python3 + PIL, cwebp.
set -euo pipefail

if [ "$#" -lt 5 ]; then
  sed -n '2,12p' "$0" >&2
  exit 1
fi

input=$1; outDir=$2; width=$3; count=$4; endSeconds=$5; quality=${6:-80}
here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

echo "1/3 extracting $count PNG frames at ${width}px"
swift "$here/extract-frames.swift" "$input" "$work" "$width" "$count" "$endSeconds" 1.0 png

echo "2/3 erasing the CTA pill"
python3 "$here/depill-frames.py" "$work"

echo "3/3 encoding WebP q$quality"
mkdir -p "$outDir"
# -sharp_yuv: the callout text is thin light-on-warm, which is where 4:2:0 chroma
# subsampling shows fringing first.
for f in "$work"/*.png; do
  cwebp -q "$quality" -sharp_yuv -quiet "$f" -o "$outDir/$(basename "${f%.png}").webp"
done

total=$(du -sk "$outDir" | cut -f1)
echo "done: $outDir — $count frames, $((total / 1024)) MB"
