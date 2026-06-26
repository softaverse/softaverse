# Optimize-Images Workflow

## Step 1: Scan for images

Find all PNG and JPG files in the target directory (default: current project's `public/images/`):

```bash
find <target_dir> -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | sort
```

List each file with its size so the user can see what will be processed.

## Step 2: Show the plan

Before doing anything, show the user:
- A table of all images found with current sizes
- The output path for each `.webp` file (same location, same name, `.webp` extension)
- The `cwebp` command that will be used: `cwebp -q 80 <input> -o <output>`
- Ask for explicit approval before proceeding

## Step 3: Convert images

After approval, for each image:
1. Run `cwebp -q 80 "<input>" -o "${input%.*}.webp"`
2. Show before/after size comparison
3. Calculate savings percentage

Use a loop like:
```bash
for f in <list_of_files>; do
  cwebp -q 80 "$f" -o "${f%.*}.webp"
  original=$(wc -c < "$f")
  compressed=$(wc -c < "${f%.*}.webp")
  echo "$f: $(numfmt --to=iec $original) → $(numfmt --to=iec $compressed)"
done
```

## Step 4: Update source code references

After conversion, search for references to the original filenames in `.tsx`, `.ts`, `.css` files:

```bash
grep -r "\.png\|\.jpg\|\.jpeg" <src_dir> --include="*.tsx" --include="*.ts" --include="*.css" -l
```

For each file found, show the user:
- Which lines reference the old filenames
- The proposed change (`.png` → `.webp`, `.jpg` → `.webp`, `.jpeg` → `.webp`)

Ask for approval before updating source code.

## Step 5: Summary

Show a final summary table:
- Total original size
- Total compressed size  
- Total savings (MB and %)
- List of updated source files
