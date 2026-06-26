#!/bin/bash
# convert-images.sh - Convert PNG/JPG to WebP format

set -e

QUALITY="${1:-80}"
shift || true

if [ $# -eq 0 ]; then
  echo "Usage: convert-images.sh <quality> <image1> [image2 ...]" >&2
  exit 1
fi

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
  echo "Error: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

total_original=0
total_compressed=0
converted_count=0

for image in "$@"; do
  if [ ! -f "$image" ]; then
    echo "Skipping: $image (not found)" >&2
    continue
  fi

  output="${image%.*}.webp"
  
  if [ -f "$output" ] && [ "$FORCE" != "true" ]; then
    echo "Skipping: $image (WebP already exists, use FORCE=true to overwrite)" >&2
    continue
  fi

  # Get original size
  original_size=$(stat -f%z "$image" 2>/dev/null || stat -c%s "$image" 2>/dev/null)
  
  # Convert to WebP
  cwebp -q "$QUALITY" "$image" -o "$output" -quiet
  
  # Get compressed size
  compressed_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
  
  # Calculate savings
  savings=$((original_size - compressed_size))
  savings_pct=$((savings * 100 / original_size))
  
  printf "%s\t%s\t%s\t%d%%\n" "$image" "$original_size" "$compressed_size" "$savings_pct"
  
  total_original=$((total_original + original_size))
  total_compressed=$((total_compressed + compressed_size))
  converted_count=$((converted_count + 1))
done

# Summary
if [ $converted_count -gt 0 ]; then
  total_savings=$((total_original - total_compressed))
  total_pct=$((total_savings * 100 / total_original))
  echo ""
  echo "=== Summary ===" >&2
  echo "Converted: $converted_count images" >&2
  echo "Original: $total_original bytes" >&2
  echo "Compressed: $total_compressed bytes" >&2
  echo "Total savings: $total_savings bytes ($total_pct%)" >&2
fi
