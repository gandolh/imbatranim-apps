import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build, resolveConfig } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKitSnapshot } from "./kitSnapshot.ts";
import { appStylePaths, discoverApps } from "./osBuild.ts";
import { BARE_SHARED_IMPORT } from "./sharedKit.ts";

/**
 * Every group but Office is a root workspace of its own, a folder like `games`:
 * its apps under `<group>/apps`, its descriptor's template in `<group>/os`.
 * The OS installs it with `npm ci --workspace=<group>` and builds it with
 * `npm run build:os --workspace=<group>`. The scoped install leaves the root's
 * devDependencies out, so a group lists the build's toolchain itself, at the
 * root's versions; these tests hold it to that.
 */
const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const buildDir = fileURLToPath(new URL("./", import.meta.url));
const vendorDir = join(repoRoot, "vendor", "imbatranim-ui");

type Pkg = {
  workspaces?: string[];
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
type Template = {
  id: string;
  sharedKit: number;
  build: { install: string[]; command: string[]; output: string };
  apps: { id: string; entry: string; styles: string[] }[];
};

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;
const rootPkg = readJson<Pkg>(join(repoRoot, "package.json"));

/** The workspaces that hold a descriptor template: the groups. */
const groups = (rootPkg.workspaces ?? []).filter(
  (w) => !w.includes("*") && existsSync(join(repoRoot, w, "os", "descriptor.template.json")),
);

/**
 * What the build helper needs installed: every package its modules import, and
 * the ones it resolves at run time (Tailwind's theme.css in appCss.ts, React's
 * export names in exportNames.ts).
 */
function helperPackages(): string[] {
  const names = new Set(["tailwindcss", "react", "react-dom"]);
  for (const file of readdirSync(buildDir)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    const code = readFileSync(join(buildDir, file), "utf8");
    for (const m of code.matchAll(/^import [^;]*? from '([^'.][^']*)'/gm)) {
      const spec = m[1];
      if (spec.startsWith("node:")) continue;
      const parts = spec.split("/");
      names.add(spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]);
    }
  }
  return [...names].sort();
}

it("finds the groups", () => {
  expect(groups).toContain("games");
});

describe.each(groups)("the %s group", (group) => {
  const dir = join(repoRoot, group);
  const configFile = join(dir, "vite.config.ts");
  const template = readJson<Template>(join(dir, "os", "descriptor.template.json"));
  const pkg = readJson<Pkg>(join(dir, "package.json"));
  let out: string;

  beforeAll(async () => {
    out = mkdtempSync(join(tmpdir(), `imbatranim-${group}-build-`));
    await build({ configFile, build: { outDir: out }, logLevel: "silent" });
  }, 60_000);
  afterAll(() => rmSync(out, { recursive: true, force: true }));

  it("installs and builds only its own workspace, writing where the descriptor says", async () => {
    expect(template.id).toBe(group);
    expect(template.build).toEqual({
      install: ["npm", "ci", `--workspace=${group}`],
      command: ["npm", "run", "build:os", `--workspace=${group}`],
      output: `${group}/dist/os`,
    });
    expect(pkg.scripts?.["build:os"]).toBe("vite build");
    const config = await resolveConfig({ configFile, logLevel: "silent" }, "build");
    expect(relative(repoRoot, config.build.outDir).split("\\").join("/")).toBe(template.build.output);
    expect(template.sharedKit).toBe(readKitSnapshot(vendorDir).sharedKitVersion);
  });

  it("lists one app per <group>/apps/<name>, keeping the name as its id, each file emitted", () => {
    const apps = discoverApps(dir);
    expect(template.apps.map((a) => a.id).sort()).toEqual(apps.map((a) => a.name));
    for (const app of apps) {
      const entry = template.apps.find((a) => a.id === app.name)!;
      expect(entry.entry).toBe(`${app.name}/app.mjs`);
      expect(entry.styles, entry.id).toEqual(appStylePaths(app));
      for (const file of [entry.entry, ...entry.styles]) {
        expect(existsSync(join(out, file)), file).toBe(true);
      }
    }
  });

  it("imports none of the shared specifiers and never reads process.env", () => {
    const files = readdirSync(out, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".mjs"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const code = readFileSync(join(out, f), "utf8");
      expect(code, f).not.toMatch(BARE_SHARED_IMPORT);
      expect(code, f).not.toMatch(/\bprocess\.env\b/);
    }
  });

  it("lists the build helper's toolchain itself, at the root's exact versions", () => {
    const own = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of helperPackages()) {
      expect(own[name], `${group}/package.json lacks ${name}`).toBeDefined();
    }
    for (const [name, version] of Object.entries(own)) {
      const atRoot = rootPkg.devDependencies?.[name];
      if (atRoot !== undefined) expect(version, name).toBe(atRoot);
    }
  });
});
