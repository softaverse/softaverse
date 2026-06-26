# Optimize-Images Reusable Scripts

This directory contains modular shell scripts designed to be executed via bash commands. Each script:

1. **Runs deterministically** without consuming context (only output is loaded)
2. **Takes input parameters** for flexibility across different use cases
3. **Returns structured output** that Claude processes independently

## Available Scripts

### scan-images.sh

Find all PNG/JPG images and their current sizes.

```bash
# Scan current directory
./scripts/scan-images.sh .

# Scan specific directory
./scripts/scan-images.sh ./public/images
```

**Output**: Tab-separated file paths and sizes
- Line 1: `/path/to/image.png` `1024000`
- Line 2: `/path/to/image.jpg` `2048000`

### convert-images.sh

Convert images to WebP format with specified quality level.

```bash
# Convert with default quality (80)
./scripts/convert-images.sh 80 file1.png file2.jpg

# Convert with higher quality (90)
./scripts/convert-images.sh 90 ./public/images/*.png

# Force overwrite existing WebP files
FORCE=true ./scripts/convert-images.sh 80 image.png
```

**Parameters**:
- `$1` — Quality level (1-100, default: 80)
- `$2...$n` — Image file paths

**Output**: Tab-separated results for each file
- Format: `<original_path>` `<original_bytes>` `<compressed_bytes>` `<savings_%>`

### find-image-references.sh

Search source code for references to image files.

```bash
# Find references to images in src/
./scripts/find-image-references.sh ./src ./public/images

# Find references in app directory
./scripts/find-image-references.sh ./app ./assets/images
```

**Parameters**:
- `$1` — Source code directory to search
- `$2` — Image directory (used to find image basenames)

**Output**: 
- Groups matching files by image name
- Shows line numbers and context for each match

### update-image-references.sh

Replace image extension references in source code (macOS and Linux compatible).

```bash
# Replace .png with .webp in src/
./scripts/update-image-references.sh ./src png webp

# Replace .jpg with .webp in app/
./scripts/update-image-references.sh ./app jpg webp
```

**Parameters**:
- `$1` — Source code directory to update
- `$2` — Old extension (without dot)
- `$3` — New extension (without dot)

**Output**: List of updated files and total count

## Architecture Notes

### Why Scripts Over Inline Code

According to [Claude's Agent Skills architecture](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview):

- **No context penalty**: Script code never enters context window, only output is loaded
- **Deterministic execution**: Scripts run reliably without AI reasoning
- **Reusable across conversations**: Write once, use in every invocation
- **Easy to test**: Run scripts locally to verify behavior before deploying

### How Claude Uses These Scripts

1. **Step 1 (Scan)**: `bash ./scripts/scan-images.sh ./public/images` → loads file list
2. **Step 2 (Plan)**: Claude processes output to show user a summary table
3. **Step 3 (Convert)**: `bash ./scripts/convert-images.sh 80 file1.png file2.jpg` → receives conversion results
4. **Step 4 (Find)**: `bash ./scripts/find-image-references.sh ./src ./public/images` → finds code references
5. **Step 5 (Update)**: `bash ./scripts/update-image-references.sh ./src png webp` → updates files

The script outputs are what inform Claude's decisions, not the script code itself.

## Best Practices for Skill Scripts

1. **Use `set -e`**: Exit on first error for predictable behavior
2. **Validate inputs**: Check required parameters and directory existence
3. **Output to stderr for logging**: `echo "message" >&2`
4. **Output to stdout for data**: Results Claude processes go to stdout
5. **Return structured data**: Tab-separated, one result per line for easy parsing
6. **Handle platform differences**: Check `$OSTYPE` for macOS vs Linux (e.g., sed -i vs sed -i '')
7. **Be explicit about environment variables**: Document when scripts use `$FORCE`, `$QUALITY`, etc.

## Testing Scripts Locally

```bash
# Make scripts executable
chmod +x ./scripts/*.sh

# Test scan script
./scripts/scan-images.sh ./public/images

# Test convert script
./scripts/convert-images.sh 80 ./public/images/test.png

# Test find references
./scripts/find-image-references.sh ./src ./public/images
```
