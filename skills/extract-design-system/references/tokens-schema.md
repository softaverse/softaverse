# tokens.json — Schema & Extraction Rules

## Schema

Write one file: `{output_dir}/tokens.json`.

```json
{
  "brand": "Acme",
  "source": "https://acme.com",
  "date": "YYYY-MM-DD",
  "fontLink": "<link href=\"https://fonts.googleapis.com/...\" rel=\"stylesheet\">",
  "fonts": { "display": "'Inter',sans-serif", "text": "'Inter',sans-serif" },
  "transition": "0.2s ease",
  "philosophy": ["Para 1 inferred from token patterns.", "Para 2."],
  "absent": ["No gradients — flat surfaces are intentional", "No shadows"],
  "rules": { "do": ["Use Electric Blue for CTAs"], "dont": ["Don't add gradients"] },
  "colors": [
    { "role": "primary", "alias": "Electric Blue", "hex": "#2563eb", "source": "extracted" }
  ],
  "typography": [
    { "level": "H1", "px": "64px", "weight": "700", "lh": "1.1", "family": "var(--font-display)", "source": "extracted" }
  ],
  "spacing": [ { "name": "--spacing-1", "value": "4px", "source": "extracted" } ],
  "radius":  [ { "name": "--radius-sm", "value": "4px", "source": "extracted" } ],
  "shadows": [ { "name": "--shadow-md", "value": "0 4px 12px rgba(0,0,0,.1)", "source": "generated" } ],
  "components": [
    {
      "name": "Button",
      "variants": [ { "variant": "primary", "class": ".btn", "desc": "Primary action" } ],
      "states": [ { "state": "Hover", "changes": "background: #1d4ed8;" } ],
      "preview": "<button class=\"btn\">Get started</button>",
      "html": "<button class=\"btn\">Get started</button>",
      "css": ".btn{background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;border:0}\n.btn:hover{background:#1d4ed8}"
    }
  ]
}
```

`source` is always `"extracted"` (found in source) or `"generated"` (inferred). Every array is optional — omit a section by leaving it out or empty.

## Extraction Rules

**Colors** — collect hex/rgb from `color`, `background`, `border-color`, `fill`, `stroke`, CSS vars. Cluster near-duplicates (<5% diff). Assign roles: `primary` (most frequent chromatic), `secondary`, `background` (near-white), `foreground` (near-black), `danger`/`success`/`warning`/`info` by hue, `neutral` (mid-gray). Derive missing semantic roles from the primary hue and mark `generated`. Give each a memorable `alias` (e.g. "Electric Blue", "Carbon Dark").

**Typography** — collect `font-family/size/weight/line-height`. Sort sizes → H1–H6, body, small, caption. Derive missing levels from the ratio between found sizes (`generated`). Set `family` to `var(--font-display)` for headings, `var(--font-text)` for body.

**Spacing** — from `padding/margin/gap`. Find base unit (4 or 8px), fill scale 4 8 12 16 24 32 48 64 96 128px as `--spacing-1..n`.

**Radius / Shadows** — `border-radius` → none/sm/md/lg/xl/full; `box-shadow` → sm/md/lg/xl. If none found, generate from the neutral color.

**Components** — detect Button (`<button>`, `.btn*`), Input (`<input>/<textarea>/<select>`), Navigation (`<nav>`, `.nav*`), Card (`.card*` or border+padding+title/image), Badge (`.badge*`), Alert (`.alert*|.toast*|.banner*`). For each: minimal self-contained `html` skeleton (no real content), a `css` string with **concrete values resolved** (so previews render standalone), variants if >1, and only the interaction states actually found in CSS.

**philosophy / rules / absent** — infer from patterns: e.g. ≤2 chromatic colors → restraint prose + "don't add accent colors"; no shadows → "depth via spacing"; radius ≤4px → "don't use pill buttons"; weights only 400–500 → "don't use bold". Record absent categories (no gradients/shadows/serif).
