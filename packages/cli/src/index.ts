#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import os from "os";
import path from "path";
import axios from "axios";
import decompress from "decompress";
import ora from "ora";
import chalk from "chalk";
import { checkbox } from "@inquirer/prompts";

const program = new Command();

const REGISTRY =
  "https://raw.githubusercontent.com/softaverse/softaverse/main/registry/skills.json";

const primary = chalk.hex("#38BDF8");
const muted = chalk.gray;

// ────────────────────────────────────────────────────────────
// Target definitions
// Each entry maps a tool name to its native project-level instruction format.
// ────────────────────────────────────────────────────────────
type TargetKind = "skill-directory" | "rule-file" | "shared-rule-file";
type TargetGroup = "Skills" | "Rules";

interface RegistrySkill {
  repo: string;
  path: string;
  description?: string;
  localPath?: string;
}

type SkillRegistry = Record<string, RegistrySkill>;

interface ToolTarget {
  label: string;
  group: TargetGroup;
  kind: TargetKind;
  description: string;
  /** Resolves the install path for a given skill name */
  resolvePath: (skillName: string) => string;
}

const TOOL_TARGETS: Record<string, ToolTarget> = {
  "claude-code": {
    label: "Claude Code",
    group: "Skills",
    kind: "skill-directory",
    description: ".claude/skills/<skill>",
    resolvePath: (skill) => path.join(process.cwd(), ".claude", "skills", skill),
  },
  codex: {
    label: "Codex",
    group: "Skills",
    kind: "skill-directory",
    description: ".codex/skills/<skill>",
    resolvePath: (skill) => path.join(process.cwd(), ".codex", "skills", skill),
  },
  antigravity: {
    label: "Antigravity",
    group: "Skills",
    kind: "skill-directory",
    description: ".agents/skills/<skill>",
    resolvePath: (skill) => path.join(process.cwd(), ".agents", "skills", skill),
  },
  cursor: {
    label: "Cursor",
    group: "Rules",
    kind: "rule-file",
    description: ".cursor/rules/<skill>.mdc",
    resolvePath: (skill) => path.join(process.cwd(), ".cursor", "rules", `${skill}.mdc`),
  },
  windsurf: {
    label: "Windsurf",
    group: "Rules",
    kind: "rule-file",
    description: ".windsurf/rules/<skill>.md",
    resolvePath: (skill) => path.join(process.cwd(), ".windsurf", "rules", `${skill}.md`),
  },
  "github-copilot": {
    label: "GitHub Copilot",
    group: "Rules",
    kind: "shared-rule-file",
    description: ".github/copilot-instructions.md",
    resolvePath: () => path.join(process.cwd(), ".github", "copilot-instructions.md"),
  },
  cline: {
    label: "Cline",
    group: "Rules",
    kind: "rule-file",
    description: ".clinerules/<skill>.md",
    resolvePath: (skill) => path.join(process.cwd(), ".clinerules", `${skill}.md`),
  },
  "roo-code": {
    label: "Roo Code",
    group: "Rules",
    kind: "rule-file",
    description: ".roo/rules/<skill>.md",
    resolvePath: (skill) => path.join(process.cwd(), ".roo", "rules", `${skill}.md`),
  },
  "gemini-cli": {
    label: "Gemini CLI",
    group: "Rules",
    kind: "shared-rule-file",
    description: "GEMINI.md",
    resolvePath: () => path.join(process.cwd(), "GEMINI.md"),
  },
};

const allTargetKeys = Object.keys(TOOL_TARGETS);
const skillTargetKeys = Object.entries(TOOL_TARGETS)
  .filter(([, target]) => target.group === "Skills")
  .map(([key]) => key);
const ruleTargetKeys = Object.entries(TOOL_TARGETS)
  .filter(([, target]) => target.group === "Rules")
  .map(([key]) => key);

function validateTargets(targets: string[]) {
  const invalid = targets.filter((t) => !(t in TOOL_TARGETS));
  if (invalid.length) {
    console.error(
      chalk.red(`Unknown target(s): ${invalid.join(", ")}`) +
        `\nValid targets: ${Object.keys(TOOL_TARGETS).join(", ")}`
    );
    process.exit(1);
  }
}

function expandTargetSelection(selected: string[]) {
  const expanded = new Set<string>();

  for (const key of selected) {
    if (key === "__all__") {
      allTargetKeys.forEach((targetKey) => expanded.add(targetKey));
    } else if (key === "__skills__") {
      skillTargetKeys.forEach((targetKey) => expanded.add(targetKey));
    } else if (key === "__rules__") {
      ruleTargetKeys.forEach((targetKey) => expanded.add(targetKey));
    } else {
      expanded.add(key);
    }
  }

  return [...expanded];
}

function markerFor(skillName: string) {
  return {
    start: `<!-- softaverse:${skillName}:start -->`,
    end: `<!-- softaverse:${skillName}:end -->`,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractDescription(markdown: string) {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  const descriptionMatch = frontmatterMatch?.[1].match(/^description:\s*(.+)$/m);

  return descriptionMatch?.[1].trim().replace(/^["']|["']$/g, "");
}

async function loadLocalSkills() {
  const skillsDir = await findSkillsDir(process.cwd());
  const registry: SkillRegistry = {};

  if (!skillsDir) {
    return registry;
  }

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillDir = path.join(skillsDir, entry.name);
    const skillFile = path.join(skillDir, "SKILL.md");
    const description = (await fs.pathExists(skillFile))
      ? extractDescription(await fs.readFile(skillFile, "utf8"))
      : undefined;

    registry[entry.name] = {
      repo: "local",
      path: path.relative(process.cwd(), skillDir),
      description,
      localPath: skillDir,
    };
  }

  return registry;
}

async function findSkillsDir(startDir: string) {
  let currentDir = path.resolve(startDir);

  while (true) {
    const candidate = path.join(currentDir, "skills");

    if (await fs.pathExists(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return undefined;
    }

    currentDir = parentDir;
  }
}

async function loadRemoteRegistry() {
  const { data } = await axios.get<SkillRegistry>(REGISTRY);
  return data;
}

async function loadSkillRegistry() {
  const localRegistry = await loadLocalSkills();

  if (Object.keys(localRegistry).length > 0) {
    return {
      registry: localRegistry,
      sourceLabel: "./skills",
    };
  }

  return {
    registry: await loadRemoteRegistry(),
    sourceLabel: "registry",
  };
}

async function readSkillInstructions(source: string) {
  const skillFile = path.join(source, "SKILL.md");

  if (await fs.pathExists(skillFile)) {
    return fs.readFile(skillFile, "utf8");
  }

  const markdownFiles = (await fs.readdir(source)).filter((file) =>
    file.toLowerCase().endsWith(".md")
  );

  if (markdownFiles.length > 0) {
    return fs.readFile(path.join(source, markdownFiles[0]), "utf8");
  }

  throw new Error("Could not find SKILL.md or another Markdown instruction file");
}

async function writeRuleFile(targetPath: string, skillName: string, content: string) {
  const markers = markerFor(skillName);
  const body = `${markers.start}\n${content.trim()}\n${markers.end}\n`;

  await fs.ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, body);
}

async function upsertSharedRuleFile(targetPath: string, skillName: string, content: string) {
  const markers = markerFor(skillName);
  const body = `${markers.start}\n${content.trim()}\n${markers.end}`;
  const existing = (await fs.pathExists(targetPath))
    ? await fs.readFile(targetPath, "utf8")
    : "";
  const blockPattern = new RegExp(
    `${escapeRegExp(markers.start)}[\\s\\S]*?${escapeRegExp(markers.end)}`,
    "m"
  );
  const next = blockPattern.test(existing)
    ? existing.replace(blockPattern, body)
    : `${existing.trimEnd()}${existing.trim() ? "\n\n" : ""}${body}\n`;

  await fs.ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, next);
}

async function removeSharedRuleBlock(targetPath: string, skillName: string) {
  if (!(await fs.pathExists(targetPath))) {
    return;
  }

  const markers = markerFor(skillName);
  const existing = await fs.readFile(targetPath, "utf8");
  const blockPattern = new RegExp(
    `\\n?${escapeRegExp(markers.start)}[\\s\\S]*?${escapeRegExp(markers.end)}\\n?`,
    "m"
  );
  const next = existing.replace(blockPattern, "\n").trimEnd();

  if (next.trim()) {
    await fs.writeFile(targetPath, `${next}\n`);
  } else {
    await fs.remove(targetPath);
  }
}

async function installTarget(target: ToolTarget, source: string, skillName: string) {
  const targetPath = target.resolvePath(skillName);

  if (target.kind === "skill-directory") {
    await fs.ensureDir(path.dirname(targetPath));
    await fs.remove(targetPath);
    await fs.copy(source, targetPath);
    return targetPath;
  }

  const content = await readSkillInstructions(source);

  if (target.kind === "shared-rule-file") {
    await upsertSharedRuleFile(targetPath, skillName, content);
  } else {
    await writeRuleFile(targetPath, skillName, content);
  }

  return targetPath;
}

async function downloadSkillSource(skill: RegistrySkill, skillName: string) {
  if (skill.localPath) {
    return skill.localPath;
  }

  const tarball =
    skill.repo.replace("github.com", "codeload.github.com") +
    "/tar.gz/refs/heads/main";
  const tempDir = path.join(os.tmpdir(), "softaverse", skillName);

  await fs.remove(tempDir);
  await fs.ensureDir(tempDir);

  const response = await axios.get(tarball, {
    responseType: "arraybuffer",
  });
  const tarPath = path.join(tempDir, "repo.tar.gz");

  await fs.writeFile(tarPath, response.data);
  await decompress(tarPath, tempDir);

  const extracted = (await fs.readdir(tempDir)).find((file) =>
    file.startsWith("softaverse-")
  );

  if (!extracted) {
    throw new Error("Could not find extracted archive");
  }

  return path.join(tempDir, extracted, skill.path);
}

async function removeTarget(target: ToolTarget, skillName: string) {
  const targetPath = target.resolvePath(skillName);

  if (target.kind === "shared-rule-file") {
    await removeSharedRuleBlock(targetPath, skillName);
  } else {
    await fs.remove(targetPath);
  }

  return targetPath;
}

function printPanel(title: string, rows: string[]) {
  const width = Math.max(title.length, ...rows.map((row) => row.length)) + 4;
  const top = `╭${"─".repeat(width)}╮`;
  const bottom = `╰${"─".repeat(width)}╯`;

  console.log();
  console.log(primary(top));
  console.log(primary("│ ") + chalk.bold.white(title.padEnd(width - 2)) + primary(" │"));
  console.log(primary("├") + primary("─".repeat(width)) + primary("┤"));
  for (const row of rows) {
    console.log(primary("│ ") + row.padEnd(width - 2) + primary(" │"));
  }
  console.log(primary(bottom));
  console.log();
}

async function promptTargets(action: "install" | "remove", skillName: string) {
  const title =
    action === "install"
      ? `Install ${skillName}`
      : `Remove ${skillName}`;
  const actionText = action === "install" ? "Choose destinations" : "Choose locations";

  printPanel(title, [
    `${actionText} with Space, confirm with Enter.`,
    "Select one or more tools.",
  ]);

  const selected = await checkbox<string>({
    message: primary.bold(actionText),
    loop: false,
    choices: [
      {
        name: `${chalk.bold("All skill targets")}  ${muted("Claude Code, Codex, Antigravity")}`,
        value: "__skills__",
        checked: action === "install",
      },
      {
        name: `${chalk.bold("All rule targets")}   ${muted("Cursor, Windsurf, Copilot, Cline, Roo Code, Gemini CLI")}`,
        value: "__rules__",
        checked: false,
      },
      {
        name: `${chalk.bold("Everything")}          ${muted("All supported targets")}`,
        value: "__all__",
        checked: false,
      },
      ...Object.entries(TOOL_TARGETS).map(([key, t]) => ({
        name: `${chalk.bold(t.label.padEnd(13))} ${primary("→")} ${muted(t.description)}`,
        value: key,
        checked: false,
      })),
    ],
    validate: (answers) =>
      answers.length > 0 ? true : "Please select at least one target.",
  });

  return expandTargetSelection(selected);
}

async function promptSkills(registry: SkillRegistry) {
  printPanel("Choose skills", [
    "Select skills with Space, confirm with Enter.",
    "You can install one or more skills.",
  ]);

  return checkbox<string>({
    message: primary.bold("Choose skills"),
    loop: false,
    choices: Object.entries(registry).map(([name, info]) => ({
      name: `${chalk.bold(name.padEnd(20))} ${muted(info.description ?? "")}`,
      value: name,
      checked: false,
    })),
    validate: (answers) =>
      answers.length > 0 ? true : "Please select at least one skill.",
  });
}

function printTargetSummary(title: string, targets: string[]) {
  printPanel(
    title,
    targets.map((key) => {
      const target = TOOL_TARGETS[key];
      return `${target.label.padEnd(13)} ${target.description}`;
    })
  );
}

function printSkillSummary(title: string, skills: string[]) {
  printPanel(title, skills.map((skill) => skill));
}

// ────────────────────────────────────────────────────────────
// add [skill]
// ────────────────────────────────────────────────────────────
program
  .command("add [skill]")
  .description("Install skill(s) from ./skills or the registry")
  .option(
    "-t, --target <tools...>",
    `Target tools to install into (${allTargetKeys.join(" | ")}). Skips the interactive prompt.`
  )
  .action(async (skillName: string | undefined, opts: { target?: string[] }) => {
    if (opts.target && opts.target.length > 0) {
      validateTargets(opts.target);
    }

    // ── 1. Load skills ─────────────────────────────────────
    const fetchSpinner = ora(primary("Loading skills…")).start();

    let registry: SkillRegistry;
    let sourceLabel: string;

    try {
      ({ registry, sourceLabel } = await loadSkillRegistry());
    } catch {
      fetchSpinner.fail(chalk.red("Failed to load skills"));
      process.exit(1);
    }

    fetchSpinner.succeed(primary(`Loaded skills from ${chalk.bold(sourceLabel)}`));

    const shouldPromptSkills = !skillName || skillName === "skills";
    const chosenSkillNames = shouldPromptSkills
      ? await promptSkills(registry)
      : [skillName];

    const missingSkills = chosenSkillNames.filter((name) => !registry[name]);
    if (missingSkills.length) {
      console.error(
        chalk.red(`Skill(s) not found in registry: ${missingSkills.join(", ")}`)
      );
      process.exit(1);
    }

    printSkillSummary("Selected skills", chosenSkillNames);

    // ── 2. Choose targets via TUI (or --target flag) ───────
    let chosenKeys: string[];

    if (opts.target && opts.target.length > 0) {
      chosenKeys = opts.target;
    } else {
      const targetPromptLabel =
        chosenSkillNames.length === 1
          ? chosenSkillNames[0]
          : `${chosenSkillNames.length} skills`;
      chosenKeys = await promptTargets("install", targetPromptLabel);
    }

    if (chosenKeys.length === 0) {
      console.log(chalk.yellow("No targets selected — nothing was installed."));
      process.exit(0);
    }

    // ── 3. Download tarball (once) ─────────────────────────
    printTargetSummary("Selected targets", chosenKeys);

    for (const selectedSkillName of chosenSkillNames) {
      const skill = registry[selectedSkillName];
      const dlSpinner = ora(
        skill.localPath
          ? primary(`Preparing ${chalk.bold(selectedSkillName)} from ./skills…`)
          : primary(`Downloading ${chalk.bold(selectedSkillName)}…`)
      ).start();

      let source: string;

      try {
        source = await downloadSkillSource(skill, selectedSkillName);
        dlSpinner.succeed(
          skill.localPath
            ? primary(`Using ${chalk.bold(selectedSkillName)} from ./skills`)
            : primary(`Downloaded ${chalk.bold(selectedSkillName)}`)
        );
      } catch (err) {
        dlSpinner.fail(chalk.red(`Download failed: ${(err as Error).message}`));
        process.exit(1);
      }

      // ── 4. Copy to each chosen target ─────────────────────
      for (const key of chosenKeys) {
        const t = TOOL_TARGETS[key];
        const installSpinner = ora(
          primary(`Installing ${chalk.bold(selectedSkillName)} into ${chalk.bold(t.label)}…`)
        ).start();

        try {
          const targetPath = await installTarget(t, source, selectedSkillName);
          installSpinner.succeed(
            chalk.green(
              `Installed ${chalk.bold(selectedSkillName)} into ${chalk.bold(t.label)} ${chalk.dim("→")} ${chalk.dim(targetPath)}`
            )
          );
        } catch (err) {
          installSpinner.fail(
            chalk.red(`Failed to install ${selectedSkillName} into ${t.label}: ${(err as Error).message}`)
          );
        }
      }
    }

    console.log();
    console.log(primary.bold("Done."));
  });

// ────────────────────────────────────────────────────────────
// list
// ────────────────────────────────────────────────────────────
program
  .command("list")
  .description("List all available skills")
  .action(async () => {
    const spinner = ora(primary("Loading skills…")).start();
    try {
      const { registry, sourceLabel } = await loadSkillRegistry();
      spinner.succeed(primary(`Available skills from ${chalk.bold(sourceLabel)}:`));
      console.log();
      for (const [name, info] of Object.entries(registry)) {
        console.log(
          `  ${primary.bold(name.padEnd(20))} ${muted(info.description ?? "")}`
        );
      }
    } catch {
      spinner.fail(chalk.red("Failed to reach registry"));
      process.exit(1);
    }
  });

// ────────────────────────────────────────────────────────────
// remove <skill>
// ────────────────────────────────────────────────────────────
program
  .command("remove <skill>")
  .description("Remove an installed skill")
  .option(
    "-t, --target <tools...>",
    `Target tool(s) to remove from (${allTargetKeys.join(" | ")}). Skips the interactive prompt.`
  )
  .action(async (skillName: string, opts: { target?: string[] }) => {
    let chosenKeys: string[];

    if (opts.target && opts.target.length > 0) {
      validateTargets(opts.target);
      chosenKeys = opts.target;
    } else {
      chosenKeys = await promptTargets("remove", skillName);
    }

    printTargetSummary("Selected targets", chosenKeys);

    for (const key of chosenKeys) {
      const t = TOOL_TARGETS[key];
      const targetPath = await removeTarget(t, skillName);
      console.log(
        primary(`Removed from ${chalk.bold(t.label)} ${muted("→")} ${muted(targetPath)}`)
      );
    }
  });

// ────────────────────────────────────────────────────────────
// targets  (new helper command — shows all supported tools)
// ────────────────────────────────────────────────────────────
program
  .command("targets")
  .description("List supported tool targets")
  .action(() => {
    console.log();
    console.log(primary.bold("Supported installation targets:\n"));
    for (const [key, t] of Object.entries(TOOL_TARGETS)) {
      console.log(
        `  ${chalk.bold.white(key.padEnd(15))} ${primary(t.label.padEnd(15))} ${muted(t.description)}`
      );
    }
    console.log();
  });

program.parse();
