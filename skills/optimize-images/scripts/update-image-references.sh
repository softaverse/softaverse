#!/bin/bash
# update-image-references.sh - Replace old image references with WebP versions

set -e

if [ $# -lt 2 ]; then
  echo "Usage: update-image-references.sh <src_dir> <old_ext> <new_ext>" >&2
  echo "Example: update-image-references.sh src/ png webp" >&2
  exit 1
fi

SRC_DIR="$1"
OLD_EXT="$2"
NEW_EXT="$3"

if [ ! -d "$SRC_DIR" ]; then
  echo "Error: Source directory not found: $SRC_DIR" >&2
  exit 1
fi

# Files to update
files=$(grep -r "\.$OLD_EXT" "$SRC_DIR" \
  --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" \
  -l 2>/dev/null || true)

if [ -z "$files" ]; then
  echo "No files found with .$OLD_EXT references" >&2
  exit 0
fi

updated_count=0

echo "$files" | while read -r file; do
  # Use sed to replace extensions
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\.$OLD_EXT\(['\"\s/]\)/$NEW_EXT\1/g" "$file"
  else
    # Linux
    sed -i "s/\.$OLD_EXT\(['\"\s/]\)/$NEW_EXT\1/g" "$file"
  fi
  
  echo "Updated: $file" >&2
  updated_count=$((updated_count + 1))
done

echo "✓ Updated $updated_count files" >&2
