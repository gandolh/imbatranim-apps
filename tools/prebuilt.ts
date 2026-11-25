/**
 * npm run prebuilt -- <group> [--out <dir>] [--tag <release tag>]
 *
 * Builds <group> (office, games, accessories or developer) at HEAD exactly as the OS's marketplace would (the
 * install and build its descriptor template names), in a temporary worktree so nothing uncommitted reaches it,
 * and writes the output as the archive the OS installs instead of building (imbatranimOS's `build.prebuilt`,
 * 2026-11-24). Prints the archive's SHA-256 and the `prebuilt` block for the OS's catalog descriptor. Publishing
 * is the owner's: the archive goes up as a release asset under the URL the block names. Nothing is committed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { packTree, sha256 } from "../packages/shared/src/build/prebuilt.ts";

const REPO = "https://github.com/gandolh/imbatranim-apps";
const GROUPS = ["office", "games", "accessories", "developer"];

const args = process.argv.slice(2);
const option = (name: string): string | null => {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const value = args[i + 1] ?? null;
  args.splice(i, 2);
  return value;
};
const out = resolve(option("--out") ?? "dist/prebuilt");
const tagOption = option("--tag");
const group = args[0];
if (args.length !== 1 || group === undefined || !GROUPS.includes(group)) {
  console.error(`usage: npm run prebuilt -- <${GROUPS.join("|")}> [--out <dir>] [--tag <release tag>]`);
  process.exit(2);
}

const root = resolve(import.meta.dirname, "..");
const template = join(root, ...(group === "office" ? [] : [group]), "os", "descriptor.template.json");
const descriptor = JSON.parse(readFileSync(template, "utf8")) as {
  build: { install?: string[]; command: string[]; output: string };
};
const git = (...argv: string[]) => execFileSync("git", argv, { cwd: root, encoding: "utf8" }).trim();
const commit = git("rev-parse", "HEAD");
if (git("status", "--porcelain", "--untracked-files=no") !== "") {
  console.error("prebuilt: the working tree has changes; the archive is built from HEAD, without them.");
}

const tree = mkdtempSync(join(tmpdir(), `prebuilt-${group}-`));
try {
  git("worktree", "add", "--detach", tree, commit);
  const run = (argv: string[]) => {
    console.log(`$ ${argv.join(" ")}`);
    const [command, ...rest] = argv;
    if (command === undefined) throw new Error("an empty command in the descriptor template");
    execFileSync(command, rest, { cwd: tree, stdio: "inherit" });
  };
  if (descriptor.build.install) run(descriptor.build.install);
  run(descriptor.build.command);
  const output = join(tree, descriptor.build.output);
  if (!existsSync(output)) throw new Error(`the build did not write ${descriptor.build.output}`);

  const archive = packTree(output);
  const digest = sha256(archive);
  const file = `${group}-${commit.slice(0, 12)}.tgz`;
  const tag = tagOption ?? `os-${commit.slice(0, 12)}`;
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, file), archive);
  const block = { prebuilt: { url: `${REPO}/releases/download/${tag}/${file}`, sha256: digest, commit } };
  console.log(`\nprebuilt: ${relative(process.cwd(), join(out, file))}, ${archive.length} bytes, from ${commit}`);
  console.log(`prebuilt: SHA-256 ${digest}`);
  console.log(`prebuilt: upload it as a release asset of ${REPO} under the tag ${tag}; the OS descriptor's`);
  console.log("prebuilt: build then takes, with source.ref at the same commit:\n");
  console.log(JSON.stringify(block, null, 2));
} catch (err) {
  console.error(`prebuilt: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
} finally {
  try {
    git("worktree", "remove", "--force", tree);
  } catch {
    rmSync(tree, { recursive: true, force: true });
    git("worktree", "prune");
  }
}
