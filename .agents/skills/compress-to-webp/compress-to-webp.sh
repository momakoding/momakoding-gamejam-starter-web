#!/usr/bin/env bash
# Usage: ./compress-to-webp.sh [directory] [quality]
#   directory  — folder containing images (default: ./img/showcase)
#   quality    — WebP quality 0-100 (default: 80)
#
# What it does:
#   1. Finds all .png / .jpg / .jpeg in the target directory (non-recursive)
#   2. Converts each to .webp via cwebp
#   3. Moves originals into an original/ subfolder

set -euo pipefail

DIR="${1:-./img/showcase}"
QUALITY="${2:-80}"
ORIG_DIR="$DIR/original"

if ! command -v cwebp &>/dev/null; then
  echo "Error: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

if [[ ! -d "$DIR" ]]; then
  echo "Error: directory '$DIR' does not exist" >&2
  exit 1
fi

mkdir -p "$ORIG_DIR"

shopt -s nullglob
files=("$DIR"/*.png "$DIR"/*.jpg "$DIR"/*.jpeg)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No PNG/JPG images found in $DIR"
  exit 0
fi

total=0
saved=0

for src in "${files[@]}"; do
  filename=$(basename "$src")
  stem="${filename%.*}"
  dest="$DIR/${stem}.webp"

  orig_size=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src")
  cwebp -q "$QUALITY" -quiet "$src" -o "$dest"
  webp_size=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest")

  reduction=$(( (orig_size - webp_size) * 100 / orig_size ))
  echo "  $filename → ${stem}.webp  ($(( orig_size/1024 ))KB → $(( webp_size/1024 ))KB, -${reduction}%)"

  mv "$src" "$ORIG_DIR/$filename"

  total=$(( total + orig_size ))
  saved=$(( saved + orig_size - webp_size ))
done

echo ""
echo "Done. Total saved: $(( saved/1024 ))KB / $(( total/1024 ))KB  ($(( saved*100/total ))%)"
echo "Originals moved to: $ORIG_DIR"
