#!/bin/bash
# scan-images.sh - Find all PNG/JPG images and their sizes

set -e

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Directory not found: $TARGET_DIR" >&2
  exit 1
fi

# Find images with size info
find "$TARGET_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) \
  -exec sh -c 'echo "{}" | xargs -I {} sh -c "stat -f%z \"{}\" 2>/dev/null || stat -c%s \"{}\" 2>/dev/null" | xargs -I @ printf "%s\t%s\n" @ "{}"' \; \
  | awk '{print $2, $1}' | sort

echo "✓ Scan complete" >&2
