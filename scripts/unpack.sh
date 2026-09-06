#!/bin/bash
set -e

# Tab Empire - extract the packaged source archive into the repository root.
# Usage: bash scripts/unpack.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE="$ROOT_DIR/tapempire---telegram-tap-to-earn-platform.zip"
TMP_DIR="$ROOT_DIR/.unpack_tmp"

if [ ! -f "$ARCHIVE" ]; then
  echo "ERROR: Archive not found: $ARCHIVE"
  exit 1
fi

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
unzip -q "$ARCHIVE" -d "$TMP_DIR"

# Copy extracted files while preserving directories.
# Ignore common macOS metadata.
find "$TMP_DIR" -name '__MACOSX' -type d -prune -exec rm -rf {} + 2>/dev/null || true
find "$TMP_DIR" -name '.DS_Store' -type f -delete 2>/dev/null || true

shopt -s dotglob nullglob
ITEMS=("$TMP_DIR"/*)
if [ ${#ITEMS[@]} -eq 0 ]; then
  echo "ERROR: Archive is empty."
  rm -rf "$TMP_DIR"
  exit 1
fi

for item in "${ITEMS[@]}"; do
  base="$(basename "$item")"
  [ "$base" = "tapempire---telegram-tap-to-earn-platform.zip" ] && continue
  [ "$base" = "scripts" ] && continue
  cp -a "$item" "$ROOT_DIR/"
done

rm -rf "$TMP_DIR"
echo "SUCCESS: Tab Empire archive extracted into the repository root."
