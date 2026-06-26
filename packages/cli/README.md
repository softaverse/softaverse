# @softaverse/cli

CLI tool to install and manage Claude Code skills from the Softaverse registry.

## Installation

```bash
npm install -g @softaverse/cli
```

## Usage

```bash
# Install a skill
softaverse add web-design

# List available skills
softaverse list

# Remove a skill
softaverse remove web-design
```

## How it works

Skills are installed into `~/.claude/skills/<skill-name>/` and picked up automatically by Claude Code.

## License

MIT
