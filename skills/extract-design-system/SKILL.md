---
name: extract-design-system
description: Extract design tokens (colors, typography, spacing, radius, shadows) and UI components from a website URL or local HTML file, then generate a clean, engineer-facing design-system.html reference. Use this whenever the user wants to capture, document, audit, catalog, or reverse-engineer the visual design language, design tokens, or component styles of a site or HTML file — e.g. "pull the design system out of this page", "what colors and fonts does this site use", "turn this HTML into a style guide / token reference", "document the buttons and cards in this mockup". Trigger even when the user doesn't say "design system" explicitly but is clearly asking to extract or catalog visual styles from markup. For an immersive brand-identity showcase rather than a developer token reference, prefer extract-brand-book instead.
allowed-tools: WebFetch, Read, Write, Bash
context: fork
---

# Extract Design System

Extract design tokens and components from a URL or local HTML file, then render a self-contained `design-system.html` — a real documentation site with sidebar navigation, live previews, and copy-to-clipboard.

**Args:** `1st` = source (URL or `@file.html`), `2nd` (optional) = output dir (default `./output/`)

---

## Reference Routing

- Token schema and extraction rules: `references/tokens-schema.md`
- HTML output layout, features, and CSS approach: `references/html-output-spec.md`
- Available references index: `references/README.md`

Read only the reference that matches the current phase. If a topic is not covered locally, consult the source HTML/CSS directly.

---

## Workflow

### Phase 1 — Fetch

- URL → `WebFetch` the page; also fetch each `<link rel="stylesheet">` href in `<head>`.
- Local file → `Read` it; also read referenced local CSS files.
- Infer brand name from `<title>` or filename. Confirm in one line.
- `Bash: mkdir -p {output_dir}`

Collect: all `<style>` blocks, fetched CSS files, `<head>` font links, HTML body structure. If the source exceeds 50k chars, prioritise `<head>` CSS + the first third of the body.

### Phase 2 — Extract → write tokens.json

Read `references/tokens-schema.md` for the full JSON schema and per-category extraction rules. Write the result to `{output_dir}/tokens.json`.

### Phase 3 — Write design-system.html

Read `references/html-output-spec.md` for the required layout, must-have features, CSS approach, and data-embedding instructions. Read `{output_dir}/tokens.json`, then use the Write tool to produce `{output_dir}/{brand} design-system.html` in one shot — no Python script, no external dependencies, everything inline.
