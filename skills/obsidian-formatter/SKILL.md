---
name: obsidian-formatter
description: Format markdown files for proper display in Obsidian. User mentions content doesn't display correctly in Obsidian.
---

# Obsidian Formatter

Format markdown content to display correctly in Obsidian.

## Formatting Rules

### 1. Headings

Convert plain text titles to proper Markdown headings:

```markdown
# Main Title (H1)
## Section (H2)
### Subsection (H3)
```

### 2. Tables

Convert ASCII art tables to Markdown table syntax:

```markdown
| 項目 | 說明 |
|------|------|
| A | 描述 A |
```

### 3. Diagrams and ASCII Art

Wrap ASCII art diagrams, flowcharts, and file tree structures in code blocks:

````markdown
```
    ┌─────────┐
    │ Server  │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Client  │
    └─────────┘
```
````

### 4. Code Blocks

Add language identifiers to code blocks:

````markdown
```bash
aws ecs update-service --cluster my-cluster --service api
```

```javascript
const config = { port: 3000 };
```

```json
{ "key": "value" }
```
````

### 5. Horizontal Rules

Use `---` for section separators (already valid in Obsidian).

## Process

1. Read the target file
2. Identify formatting issues:
   - ASCII tables → convert to Markdown tables
   - ASCII diagrams → wrap in code blocks
   - Plain text titles → add heading syntax
   - Unfenced code → add code block fencing with language
3. Apply all formatting fixes
4. Write the updated content back to the file
