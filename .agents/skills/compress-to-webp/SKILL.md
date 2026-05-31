---
name: compress-to-webp
description: Batch-convert PNG/JPG images to WebP using cwebp. Moves originals to an original/ subfolder. Use when the user wants to compress or convert showcase/game images to WebP format.
user-invocable: true
allowed-tools:
  - Bash(cwebp *)
  - Bash(mkdir *)
  - Bash(mv *)
  - Bash(stat *)
  - Bash(ls *)
---

# compress-to-webp

Converts all PNG/JPG images in a directory to WebP and archives the originals.

Arguments: `$ARGUMENTS`

## Usage

```
/compress-to-webp [directory] [quality]
```

- `directory` — path to the image folder (default: `./img/showcase`)
- `quality` — WebP quality 0–100 (default: `80`)

## Steps

1. Validate that `cwebp` is installed (`brew install webp` if missing).
2. Run the skill script:

```bash
bash .agents/skills/compress-to-webp/compress-to-webp.sh [directory] [quality]
```

3. Report per-file size reduction and total savings.
4. Remind the user to update any hardcoded `.png`/`.jpg` paths in `content.js` or HTML to `.webp`.

## Notes

- Originals are moved to `<directory>/original/` — nothing is deleted.
- Re-running on a folder that already has WebPs will skip files (no source PNGs left).
- Quality 80 is a good default; go lower (60–70) for screenshots with flat colors, higher (85–90) for photos.
