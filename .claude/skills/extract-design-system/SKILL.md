---
description: Extract design tokens and components from a website URL or local HTML file, and generate an engineer-friendly design-system.html reference document
allowed-tools: WebFetch, Read, Write, Bash
context: fork
---

# Extract Design System

Extract design tokens from any website URL or local HTML file and generate `design-system.html` — an engineer-facing token reference and component showcase.

---

## Phase 1 — Parse Arguments and Confirm Required Info

**The source (URL or local path) is read from skill args:**

- If the user invoked the skill with an argument (e.g. `/extract-design-system https://example.com` or `/extract-design-system ./src/index.html`), use that value directly as the source without prompting.
- If no argument was provided, ask:
  ```
  Source: URL or local HTML file path?
  (URL example: https://example.com | Local example: ./src/index.html)
  ```

Once the source is confirmed, ask for the following two items (auto-infer the brand name from the source when possible and ask only for confirmation):

```
1. Brand name (used as the title of the output file)

2. Output directory (default: ./output/)
```

---

## Phase 2 — Fetch Raw Materials

**If URL:**
Use WebFetch to retrieve the page HTML. Also attempt to fetch external CSS files referenced by the page (parse `<link rel="stylesheet">` hrefs and fetch each one).

**If local HTML file:**
Use Read to load the full file. If it references local CSS files (`<link href="...">`), read those as well.

Collect:
- All `<style>` block contents
- All external CSS file contents
- HTML structure (for component detection)
- Google Fonts / `@font-face` declarations in `<head>`

---

## Phase 3 — Extract Design Tokens

Analyze all collected CSS and HTML and extract the categories below. While extracting, build a **token schema (JSON structure)** in memory to be embedded in the output file during Phase 5:

```json
{
  "meta": { "brand": "...", "source": "...", "generatedAt": "..." },
  "colors": {
    "primary": { "value": "#f9e950", "variable": "--color-primary", "role": "brand primary", "source": "extracted" }
  },
  "typography": {
    "h1": { "size": "64px", "weight": "700", "lineHeight": "1.1", "source": "extracted" }
  },
  "spacing": { "4": { "value": "4px", "variable": "--spacing-1", "source": "extracted" } },
  "radius": { "sm": { "value": "4px", "variable": "--radius-sm", "source": "extracted" } },
  "shadow": { "md": { "value": "0 4px 12px ...", "variable": "--shadow-md", "source": "generated" } }
}
```

`source` has exactly two valid values: `"extracted"` (found in source code) or `"generated"` (inferred/derived).

### 3-A Colors

1. Collect all color values: CSS variables (`--*`), and concrete values from `color`, `background-color`, `border-color`, `fill`, `stroke`, etc.
2. Deduplicate and cluster similar colors (difference < 5% treated as the same color).
3. Assign a semantic role to each color:
   - Highest frequency → `primary`
   - Second highest → `secondary`
   - Near white / very light → `background`
   - Near black / very dark → `foreground`
   - Red hues → `danger`
   - Green hues → `success`
   - Yellow / orange hues → `warning`
   - Blue hues (if not primary) → `info`
   - Mid-range grays → `neutral`
4. If any of `danger` / `success` / `warning` / `info` is missing → **fill in**: derive a semantic color from the primary hue that matches the brand tone (preserve similar saturation/lightness style).
5. Output format: `--color-{role}[-{shade}]: {value};`

### 3-B Typography

1. Collect all `font-family` (including fallback stacks), `font-size`, `font-weight`, `line-height`, `letter-spacing`.
2. Sort font sizes and build a type scale, mapping levels:
   - Largest → H1, next → H2, and so on.
3. **Fill in missing levels**: if only H1/H2 are found, derive H3–H6, body, small, caption.
   - Calculate the scale ratio between found levels (e.g. H1=64px, H2=48px → ratio ≈ 1.33).
   - Apply the same ratio to derive missing levels, rounding to whole numbers or 0.5px.
   - Weight trend: H1–H3 typically bolder, H4–H6 medium, body regular.
   - Line-height trend: larger headings have smaller line-height (H1 ≈ 1.1, body ≈ 1.5–1.6).
4. Output format: one CSS class + custom properties per level.

### 3-C Spacing

1. Collect all `padding`, `margin`, `gap`, `top/right/bottom/left` values.
2. Find the most frequently occurring value to identify the base spacing unit (typically 4 or 8).
3. **Fill in a complete spacing scale**: ensure coverage of 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128 (px or proportional equivalent). Derive missing values from the identified base unit.
4. Output format: `--spacing-{n}: {value};` (n is a sequential index 1–12 or the raw value)

### 3-D Border Radius

1. Collect all `border-radius` values.
2. Build a scale: none(0) / sm / md / lg / xl / full(9999px).
3. Derive and fill in missing levels from found values.
4. Output format: `--radius-{size}: {value};`

### 3-E Shadow

1. Collect all `box-shadow` values.
2. Sort by blur radius into sm / md / lg / xl.
3. If no shadows are found → generate 4 levels matching the brand tone (use primary or neutral color as shadow color).
4. Output format: `--shadow-{size}: {value};`

### 3-F Evocative Color Names + Do/Don't Rules

Run after all token categories are complete. Produces two outputs used by Phase 5.

**Evocative color names** — assign a memorable English alias to each semantic color based on hue and lightness. Examples:

| Hue range | Lightness | Suggested alias |
|-----------|-----------|-----------------|
| Blue, high saturation | mid | Electric Blue / Ocean Blue |
| Near-black, blue undertone | dark | Carbon Dark / Midnight |
| Mid gray, warm | mid | Graphite / Pewter |
| Light gray | light | Silver Fog / Cloud Gray |
| Green, vivid | mid | Emerald / Meadow |
| Red, vivid | mid | Crimson / Ember |

Add the alias to the token schema: `"alias": "Electric Blue"`.

**Do/Don't rules** — derive automatically from what was (and was not) found:

| Observation | Do rule | Don't rule |
|-------------|---------|------------|
| `box-shadow` absent across all elements | — | Don't add shadows — depth is achieved through spacing and photography |
| Only 1 chromatic color found | Use {primary alias} exclusively for primary CTAs | Don't introduce additional accent colors |
| All border-radius ≤ 4px | Keep interactive elements at ≤ 4px radius | Don't use pill-shaped or heavily rounded buttons |
| No `text-transform: uppercase` | Keep text in natural case | Don't apply uppercase transforms to navigation or CTAs |
| No gradients found | — | Don't add gradients or decorative backgrounds |
| All transitions share the same duration | Match the {Xms} timing for all interactive states | Don't mix transition durations |
| Only weights 400 and 500 used | Stay within weight 400–500 | Don't use bold (700) or light (300) |

Also record **intentional absences** — a list of design categories not present in the source (e.g. "no gradients", "no shadows", "no serif typeface") for display in Phase 5.

---

## Phase 4 — Component Detection and Extraction

Scan the HTML structure to automatically detect and extract reusable components.

**Detection rules (identify by characteristics):**

| Component | Detection criteria |
|-----------|-------------------|
| Button | `<button>`, `role="button"`, `<a>` with class containing `btn`/`button` |
| Input | `<input>`, `<textarea>`, `<select>` and their labels/wrappers |
| Card | `<div>` with `border`+`padding` containing an image/title/description structure |
| Badge / Tag | Small inline element with `border-radius`+`background-color` |
| Navigation | `<nav>`, block with class containing `nav`/`navbar`/`header` |
| Alert / Banner | Class containing `alert`/`notice`/`toast`/`banner` |
| Avatar | Circular image or circular container with initials |
| Divider | `<hr>` or an empty `<div>` with only `border-top/bottom` |

For each detected component:
1. Extract the minimal independently renderable HTML structure (strip page-specific content, keep structural skeleton).
2. Extract the corresponding CSS class definitions (original class names, no transformation).
3. If a component type has multiple variants (e.g. primary button / outline button), preserve each one and build a variant table:

   | Variant | Class(es) | Description |
   |---------|-----------|-------------|
   | primary | `.btn .btn-primary` | Primary action button |
   | outline | `.btn .btn-outline` | Secondary / border button |

4. If a component depends on CSS variables, ensure those variables are included in the output.
5. Extract **interaction states** from CSS — collect `:hover`, `:focus`, `:active`, and `[disabled]` rules for each component's classes. Record which properties change per state (e.g. `background-color`, `border-color`, `color`, `opacity`) and the transition timing if present.
6. Also retain a **plain-text version of the HTML and CSS source** (no span highlight tags) for use as `data-raw` storage in Phase 5.

---

## Phase 5 — Generate design-system.html

**Start by reading the reference template:**

```
Read resources/reference.html
```

Understand its complete DOM structure, CSS class names, placeholder comments, and JS logic before writing a single line of output. Then generate `design-system.html` by filling in all `{{placeholder}}` values with extracted token data. **Do not alter the element hierarchy, CSS class names, or JS block.**

### Placeholder substitution rules

| Placeholder | What to fill in |
|-------------|----------------|
| `{{brand-name}}` | Brand name confirmed in Phase 1 |
| `{{source-url}}` | Source URL or file path |
| `{{generated-date}}` | Today's date (YYYY-MM-DD) |
| `{{token-schema-json}}` | Full JSON object from Phase 3 |
| `{{color-primary}}` … | Each extracted/generated hex value |
| `{{font-family-display}}` … | Font family strings |
| `{{spacing-1}}` … `{{spacing-12}}` | Spacing values (e.g. `4px`) |
| `{{radius-sm}}` … `{{radius-xl}}` | Border radius values |
| `{{shadow-sm}}` … `{{shadow-xl}}` | Full `box-shadow` values |
| `{{transition-duration}}` / `{{transition-easing}}` | Extracted or `0.2s` / `ease` as fallback |
| `{{sidebar-component-links}}` | One `<a>` per detected component |
| `{{design-philosophy-prose}}` | 2–3 paragraphs — see inference table below |
| `{{not-in-system-items}}` | One `.not-in-system__item` per absent category |
| `{{dos-donts-count}}` | Total rule count |
| `{{dos-items}}` / `{{donts-items}}` | `<li>` elements from Phase 3-F rules |
| `{{color-cards}}` | One `.color-card` per semantic color |
| `{{color-count}}` / `{{color-generated-count}}` | Token counts |
| `{{type-rows}}` | One `<tr>` per typography level |
| `{{type-count}}` / `{{type-generated-count}}` | Level counts |
| `{{spacing-rows}}` | One `.spacing-row` per spacing step |
| `{{spacing-count}}` / `{{spacing-generated-count}}` / `{{spacing-base-unit}}` | Spacing stats |
| `{{radius-cards}}` | One `.radius-card` per radius level |
| `{{shadow-cards}}` | One `.shadow-card` per shadow level |
| `{{component-count}}` | Number of detected components |
| `{{component-type-slug}}` / `{{component-type-name}}` | Per component |
| `{{component-variant-rows}}` | `<tr>` per variant (omit table if only one variant) |
| `{{component-preview-html}}` | Minimal skeleton HTML using original CSS classes |
| `{{component-state-items}}` | One `.state-item` per found interaction state |
| `{{component-html-raw}}` / `{{component-html-highlighted}}` | Plain-text and highlight-span versions |
| `{{component-css-raw}}` / `{{component-css-highlighted}}` | Plain-text and highlight-span versions |
| `{{export-css-variables}}` | Full `:root { ... }` block |
| `{{export-json-tokens}}` | Token schema JSON (same as `{{token-schema-json}}`) |
| `{{export-tailwind-config}}` | `theme: { extend: { ... } }` object |
| `{{ref-color-rows}}` | One `<tr>` per color in the Quick Reference table |
| `{{prompt-cards}}` | 2–3 `.prompt-card` elements with embedded token values |

### Design Philosophy inference rules

Use these to generate `{{design-philosophy-prose}}`:

| Pattern observed | Prose direction |
|-----------------|----------------|
| ≤ 2 chromatic colors | "The palette practices extreme restraint — a near-monochrome foundation with a single accent color as the sole interactive signal." |
| No `box-shadow` found | "Elevation is achieved without shadow — depth comes from spacing and layering rather than drop shadows or blur." |
| No gradients found | "Surfaces are flat and undecorated. Gradients and patterns are absent by design." |
| All `font-weight` ≤ 500 | "Typography avoids dramatic weight contrasts — the type system operates between regular (400) and medium (500) only." |
| Border-radius ≥ 16px | "Rounded surfaces signal approachability — the radius scale leans generous, softening all edges." |
| Border-radius ≤ 4px | "Corners are precise and nearly sharp — reflecting an engineered, technical aesthetic." |
| Spacing base unit = 4 | "A 4px grid governs all spatial decisions." |
| Spacing base unit = 8 | "An 8px grid governs all spatial decisions." |

### Critical rules (never violate)
- Color swatches: always `style="background:var(--color-{role})"` — never hardcode hex
- Badges: only `badge-extracted` or `badge-generated` — no plain text `(generated)`
- Copy buttons: always read from `data-raw` — never from `innerHTML`
- Interaction states: only show states found in source CSS; mark absent states `(not defined)`, do not fabricate
- Syntax highlighting: wrap with `.hl-tag`, `.hl-attr`, `.hl-val`, `.hl-prop`, `.hl-sel`, `.hl-num`, `.hl-str`, `.hl-com` spans — classes are already defined in reference.html

---

## Phase 6 — Output and Report

1. Create the file in the specified output directory:
   - `{output_dir}/design-system.html`

2. Print a summary report:

```
✓ design-system.html
  Colors:     {n} tokens ({n} generated) — {n} evocative aliases assigned
  Typography: {n} levels ({n} generated)
  Spacing:    {n} steps ({n} generated)
  Components: {n} components detected ({list types})
              {n} with interaction states · {n} with multiple variants
  Do/Don't:   {n} rules derived
  Absences:   {list: no gradients, no shadows, ...}
```

3. If any values could not be determined during extraction, list them as "derived assumptions" in the report so the user can manually adjust.

---

## Notes

- The output HTML must **not depend on any CDN or external resources** (fonts are the exception — if the original design uses Google Fonts, keep the `<link>`).
- Component extraction captures only the HTML structural skeleton — no page-specific real content (e.g. real usernames, real image URLs).
- If the source HTML exceeds 50,000 characters, prioritize parsing `<head>` CSS and the first third of the page structure for component detection; reading the entire page is not required.
- **Badge consistency**: use only `badge-extracted` and `badge-generated` CSS classes throughout the entire file. Never mix in plain-text `(generated)` labels or other naming — CSS controls the visual style from one place.
- **Single source of truth for token values**: color swatches, spacing bars, and other visual elements must reference CSS variables defined in `:root`. Never hardcode the same value again in `style=""` or elsewhere.
- Syntax highlighting wraps code in spans, but the Copy function must always read from `data-raw` for plain text. Reading from `innerHTML` is not allowed.
