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

## Skills

| Skill | Use it for |
| --- | --- |
| [`web-design`](skills/web-design/SKILL.md) | Designing modern websites with stronger visual direction and layout decisions. |
| [`extract-design-system`](skills/extract-design-system/SKILL.md) | Extracting design tokens and reusable components from a website URL or local HTML file. |

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

## License

[MIT](LICENSE)
