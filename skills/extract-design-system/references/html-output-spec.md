# design-system.html — Output Specification

## Required Layout

```
┌─────────────────────────────────────────────────────────┐
│  HEADER  Brand name · source · date          [☀/🌙]    │
├──────────┬──────────────────────────────────────────────┤
│  SIDEBAR │  CONTENT                                     │
│ (sticky) │                                              │
│ • Colors │  Section heading                             │
│ • Type   │  Cards / tables / previews                  │
│ • Space  │                                              │
│ • Radius │                                              │
│ • Shadow │                                              │
│ • Comps  │                                              │
│ • Tokens │                                              │
└──────────┴──────────────────────────────────────────────┘
```

## Must-Have Features

**Sidebar**
- Sticky, left-rail navigation. Active section highlighted on scroll (IntersectionObserver).
- Each nav item shows a small count badge (e.g. "Colors 8").

**Colors**
- Swatch grid. Each card: large color block, alias name, CSS var (`--color-{role}`), hex value.
- Clicking hex copies it to clipboard; show a brief "Copied!" toast.
- `extracted` / `generated` badge on each swatch.
- If colors include a background and a foreground, show a WCAG contrast ratio badge on the primary color swatch.

**Typography**
- Live samples using the actual brand font (inject `fontLink` into `<head>`).
- Each row: level label, live text sample rendered at the exact `px`/`weight`/`lh`/`family`, then token columns.
- Sample text: "The quick brown fox jumps over the lazy dog".

**Spacing & Radius**
- Visual bars for spacing (horizontal bar whose width = token value, capped at 300px).
- Visual box for radius (40×40 square with the border-radius applied).

**Shadows**
- White card floating on a light gray background demonstrating each shadow value.

**Components**
- For each component: a live preview panel (inject the component CSS into a `<style>` tag so it renders), then two tabs — **HTML** and **CSS** — showing the code with copy button.
- If `variants` has >1 entry, render all variant previews side by side.
- States table (Hover, Focus, Disabled) if present.

**CSS Variables reference**
- A final section with a copyable `<pre>` block showing the full `:root { … }` variable map.

**Dark mode**
- Toggle button in header. Persist choice in `localStorage`. Dark surface = `#0f1117`, use CSS custom properties throughout so the toggle swaps a single data attribute.

**Copy-to-clipboard**
- All `<pre>` / `<code>` token values have a copy icon button. On click: write to clipboard, swap icon to ✓ for 1.5s, then revert.

**Philosophy & Rules**
- Philosophy paragraphs in a readable prose block.
- Do/Don't two-column card (green / red tinted backgrounds).
- "Not in this system" list if `absent` has entries.

## Embedding Data

Inline the tokens as a JS constant near the top of `<body>`:

```html
<script>
const TOKENS = /* paste the full tokens.json object here */;
</script>
```

A `<script>` block at the bottom builds all sections by reading `TOKENS` — no fetch, works offline, truly self-contained.

## CSS Approach

- CSS custom properties for every color, spacing, font, shadow value so dark mode is a single `[data-theme="dark"]` attribute swap.
- Use CSS Grid for the sidebar+content layout (`grid-template-columns: 220px 1fr`).
- Use system font stack for the shell UI; inject brand fonts only for the typography preview section.
- Clean, professional aesthetic — subtle borders, ample whitespace, neutral grays. Let the brand's own tokens do the talking inside the preview cells.

## Writing the File

Use the Write tool to write the complete HTML in one shot. Do not shell out, do not run Python, do not produce a placeholder.
