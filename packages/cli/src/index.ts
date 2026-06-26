#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import os from "os";
import path from "path";
import axios from "axios";
import decompress from "decompress";
import ora from "ora";

const program = new Command();

const REGISTRY =
  "https://raw.githubusercontent.com/softaverse/softaverse/main/registry/skills.json";

program
  .command("add <skill>")
  .description("Install a skill from the registry")
  .action(async (skillName) => {
    const spinner = ora("Fetching registry").start();

    const { data } = await axios.get(REGISTRY);

    const skill = data[skillName];

    if (!skill) {
      spinner.fail("Skill not found");
      process.exit(1);
    }

    spinner.text = "Downloading skill";

    const tarball =
      skill.repo.replace("github.com", "codeload.github.com") +
      "/tar.gz/refs/heads/main";

    const tempDir = path.join(os.tmpdir(), "softaverse");

    await fs.remove(tempDir);
    await fs.ensureDir(tempDir);

    const response = await axios.get(tarball, {
      responseType: "arraybuffer",
    });

    const tarPath = path.join(tempDir, "repo.tar.gz");

    await fs.writeFile(tarPath, response.data);

    await decompress(tarPath, tempDir);

    const extracted = (await fs.readdir(tempDir)).find((f) =>
      f.startsWith("softaverse-")
    );

    const source = path.join(tempDir, extracted!, skill.path);

    const target = path.join(process.cwd(), ".claude", "skills", skillName);

    await fs.ensureDir(path.dirname(target));

    await fs.remove(target);

    await fs.copy(source, target);

    spinner.succeed(`Installed ${skillName}`);
  });

program
  .command("list")
  .description("List all available skills in the registry")
  .action(async () => {
    const { data } = await axios.get(REGISTRY);

    console.log(Object.keys(data));
  });

program
  .command("remove <skill>")
  .description("Remove an installed skill")
  .action(async (skill) => {
    const target = path.join(process.cwd(), ".claude", "skills", skill);

    await fs.remove(target);

    console.log(`Removed ${skill}`);
  });

program.parse();
