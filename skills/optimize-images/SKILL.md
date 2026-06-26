---
name: optimize-images
description: Convert and compress PNG/JPG images to WebP format using cwebp to reduce file size. Use when the user wants to optimize, compress, or convert images while keeping originals as backup. Includes source code reference updates.
model: sonnet
---

# Optimize Images

This skill scans a directory for PNG and JPEG images, converts them to WebP format using `cwebp`, and updates source code references (`.tsx`, `.ts`, `.css` files) to point to the new `.webp` files.

## Core Workflow

1. **Scan** — Find all PNG/JPG images in target directory
2. **Plan** — Show user a table with sizes and the conversion plan
3. **Convert** — Run `cwebp` and show before/after comparisons
4. **Update** — Find and update source code references (with approval)
5. **Summary** — Report total savings and modified files

## Reference Routing

- **[references/workflow.md](./references/workflow.md)** — Read this for the detailed 5-step workflow with bash commands and examples.
- **[references/requirements.md](./references/requirements.md)** — Read this for important rules, setup requirements, quality settings, and supported formats.
- **[references/scripts.md](./references/scripts.md)** — Read this for reusable modular scripts in the `scripts/` directory that handle scanning, converting, finding, and updating image references.

## Fallback

If local references don't answer your question, consult the official [cwebp documentation](https://developers.google.com/speed/webp/docs/cwebp) and [cwebp man page](https://manpages.ubuntu.com/manpages/jammy/man1/cwebp.1.html).

## Quality Checks

- ✓ The description clearly states what the skill does and when to use it
- ✓ `SKILL.md` is concise and readable; detailed content is in references
- ✓ Each reference has one obvious purpose and is linked directly
- ✓ The agent can decide which reference to open based on the task
- ✓ Missing coverage has a clear fallback to official docs
