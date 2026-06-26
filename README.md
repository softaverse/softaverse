# Softaverse

Softaverse helps you install reusable AI agent skills into the coding assistants and rule-file based tools you already use.

## Installation

Install the CLI globally if you plan to use it often:

```bash
npm install -g softaverse
```

If you do not want to install anything globally, run it with `npx`:

```bash
npx softaverse add web-design
```

## Usage

Install a skill interactively:

```bash
softaverse add web-design
```

Choose skills and targets interactively:

```bash
softaverse add skills
```

Install without prompts:

```bash
softaverse add web-design --target claude-code codex cursor
```

List available skills:

```bash
softaverse list
```

List supported targets:

```bash
softaverse targets
```

Remove an installed skill:

```bash
softaverse remove web-design
```

Every command can also be run through `npx`:

```bash
npx softaverse list
npx softaverse targets
npx softaverse add web-design --target claude-code codex
```

## Supported targets

Skill-directory targets:

- Claude Code: `.claude/skills/<skill>/`
- Codex: `.codex/skills/<skill>/`
- Antigravity: `.agents/skills/<skill>/`

Rule-file targets:

- Cursor: `.cursor/rules/<skill>.mdc`
- Windsurf: `.windsurf/rules/<skill>.md`
- GitHub Copilot: `.github/copilot-instructions.md`
- Cline: `.clinerules/<skill>.md`
- Roo Code: `.roo/rules/<skill>.md`
- Gemini CLI: `GEMINI.md`

## Development

Use these steps if you want to work on Softaverse locally.

Install CLI dependencies:

```bash
npm install
```

Build the CLI:

```bash
npm run build
```

Publish a new version:

```bash
npm publish
```

The CLI loads skills from a local `skills/` directory when one is available. Otherwise, it falls back to the remote registry at `registry/skills.json`.

## Adding a skill

1. Create a new directory under `skills/<skill-name>/`.
2. Add a `SKILL.md` file with the skill instructions and frontmatter.
3. Add the skill to `registry/skills.json` with its repository URL and path.

Example:

```json
{
  "web-design": {
    "repo": "https://github.com/softaverse/softaverse",
    "path": "skills/web-design"
  }
}
```

## License

MIT
