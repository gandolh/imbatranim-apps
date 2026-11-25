import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { packTree, sha256 } from "./prebuilt.ts";

describe("packTree", () => {
  let work: string;
  let tree: string;
  beforeEach(() => {
    work = mkdtempSync(join(tmpdir(), "prebuilt-"));
    tree = join(work, "os");
    mkdirSync(join(tree, "todo"), { recursive: true });
    mkdirSync(join(tree, "chunks"));
    writeFileSync(join(tree, "todo", "app.mjs"), "export function App() {}\n");
    writeFileSync(join(tree, "todo", "app.css"), "");
    writeFileSync(join(tree, "chunks", "shared.mjs"), "x".repeat(1500));
  });
  afterEach(() => rmSync(work, { recursive: true, force: true }));

  /** What tar itself reads back: an independent check of the format. */
  const list = (archive: Buffer) => {
    writeFileSync(join(work, "a.tgz"), archive);
    return execFileSync("tar", ["-tzvf", join(work, "a.tgz")], { encoding: "utf8" })
      .trim()
      .split("\n")
      .map((line) => {
        const cols = line.trim().split(/\s+/);
        return `${cols[0]} ${cols[2]} ${cols[cols.length - 1]}`;
      });
  };

  it("holds the folders and files in name order, 0755 and 0644, which tar reads back", () => {
    expect(list(packTree(tree))).toEqual([
      "drwxr-xr-x 0 chunks/",
      "-rw-r--r-- 1500 chunks/shared.mjs",
      "drwxr-xr-x 0 todo/",
      "-rw-r--r-- 0 todo/app.css",
      "-rw-r--r-- 25 todo/app.mjs",
    ]);
    execFileSync("tar", ["-xzf", join(work, "a.tgz"), "-C", work]);
    expect(execFileSync("cat", [join(work, "chunks", "shared.mjs")], { encoding: "utf8" })).toBe("x".repeat(1500));
  });

  it("comes out byte for byte the same from the same files, whatever their times", () => {
    const first = packTree(tree);
    utimesSync(join(tree, "todo", "app.mjs"), new Date(2001, 1, 1), new Date(2001, 1, 1));
    expect(sha256(packTree(tree))).toBe(sha256(first));
    expect(first[9]).toBe(3);
    writeFileSync(join(tree, "todo", "app.mjs"), "export function App() { return 1; }\n");
    expect(sha256(packTree(tree))).not.toBe(sha256(first));
  });

  it("writes a long path through the ustar prefix", () => {
    const deep = join("a".repeat(70), "b".repeat(70));
    mkdirSync(join(tree, deep), { recursive: true });
    writeFileSync(join(tree, deep, `${"c".repeat(90)}.mjs`), "1");
    expect(list(packTree(tree))).toContain(`-rw-r--r-- 1 ${deep}/${"c".repeat(90)}.mjs`);
  });

  it("refuses a link", () => {
    symlinkSync("/etc/hostname", join(tree, "todo", "link.txt"));
    expect(() => packTree(tree)).toThrow(/todo\/link.txt is not a file or a folder/);
  });
});
