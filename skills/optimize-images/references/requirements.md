# Important Rules and Requirements

## Core Rules

- **Always ask approval** before running conversions
- **Always ask approval** before modifying source code
- **Do NOT delete** the original PNG/JPG files — keep them as backup
- **Skip files** that already have a `.webp` counterpart unless user passes `--force`

## Configuration

### Default Quality

Default quality is 80 (good balance between size and visual fidelity).

User can override with parameter: `/optimize-images quality=90`

### Quality Guidelines

- `quality=80` (default): Good balance, recommended for most use cases
- `quality=90`: Higher fidelity, larger file size
- `quality=70`: More aggressive compression, acceptable for most web images

## Setup Requirements

### Check for cwebp

If `cwebp` is not installed, tell the user to install it:

```bash
# macOS
brew install webp

# Linux (Ubuntu/Debian)
sudo apt-get install webp

# Linux (Fedora/RHEL)
sudo dnf install webp
```

## Target Directory

**Default target:** Current project's `public/images/` directory

User can specify a custom target directory: `/optimize-images dir=assets/images`

## Supported Formats

Convert from:
- `.png` — PNG images
- `.jpg`, `.jpeg` — JPEG images

Convert to:
- `.webp` — WebP format

## Source Code Extensions

Search for references in these file types:
- `.tsx` — React TypeScript components
- `.ts` — TypeScript files
- `.css` — CSS stylesheets
