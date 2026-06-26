#!/bin/bash
# find-image-references.sh - Find source code files referencing image files

set -e

if [ $# -lt 2 ]; then
  echo "Usage: find-image-references.sh <src_dir> <image_dir>" >&2
  exit 1
fi

SRC_DIR="$1"
IMAGE_DIR="$2"

if [ ! -d "$SRC_DIR" ]; then
  echo "Error: Source directory not found: $SRC_DIR" >&2
  exit 1
fi

# Find all images (use basename to search in code)
images=$(find "$IMAGE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -exec basename {} \; | sort | uniq)

# Search for references in source code
found_any=false

for img in $images; do
  # Search in .tsx, .ts, .css, .jsx, .js files
  matches=$(grep -r "$img" "$SRC_DIR" \
    --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" \
    -l 2>/dev/null || true)
  
  if [ -n "$matches" ]; then
    echo "=== $img ===" >&2
    echo "$matches" | while read -r file; do
      # Show line numbers and context
      grep -n "$img" "$file" | head -5 | sed 's/^/  /'
    done
    echo ""
    found_any=true
  fi
done

if [ "$found_any" = false ]; then
  echo "No image references found in source code" >&2
fi
