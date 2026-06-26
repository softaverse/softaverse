# @softaverse/cli

CLI tool to install and manage AI agent skills from the Softaverse registry.

## Installation

```bash
npm install -g @softaverse/cli
```

## Usage

```bash
# Install a skill
softaverse add web-design

# Pick skill(s), then pick AI target(s)
softaverse add skills

# Install a skill without the terminal UI
softaverse add web-design --target claude-code codex cursor

# List available skills
softaverse list

# List supported target tools
softaverse targets

# Remove a skill
softaverse remove web-design
```

## How it works

When you run `softaverse add skills`, the CLI first lets you choose one or more skills from `./skills`, then lets you choose where to install them. If `./skills` is not available, it falls back to the remote registry.

When you run `softaverse add <skill>` without `--target`, the CLI skips skill selection and only asks where to install that skill. The UI uses `#38BDF8` as the primary color and includes shortcuts for all skill targets, all rule targets, or everything.

Skill targets copy the full skill directory:

- `claude-code` installs into `.claude/skills/<skill-name>/`
- `codex` installs into `.codex/skills/<skill-name>/`
- `antigravity` installs into `.agents/skills/<skill-name>/`

Rule targets generate tool-specific instruction files from `SKILL.md`:

- `cursor` installs into `.cursor/rules/<skill-name>.mdc`
- `windsurf` installs into `.windsurf/rules/<skill-name>.md`
- `github-copilot` updates `.github/copilot-instructions.md`
- `cline` installs into `.clinerules/<skill-name>.md`
- `roo-code` installs into `.roo/rules/<skill-name>.md`
- `gemini-cli` updates `GEMINI.md`

Use Space to select one or more tools, then Enter to confirm.

## License

MIT
