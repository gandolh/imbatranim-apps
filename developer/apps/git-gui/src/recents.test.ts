import { describe, expect, it } from "vitest";
import { MAX_RECENT_REPOS, forgotten, readRepos, remembered } from "./recents";

const repo = (path: string) => ({ root: "home", path });

describe("Git GUI's recent repositories", () => {
  it("reads the list the OS wrote, and none from a file that is not one", () => {
    expect(readRepos('{"repos":[{"root":"home","path":"a"},{"root":1}]}')).toEqual([repo("a")]);
    expect(readRepos("not json")).toEqual([]);
    expect(readRepos('{"repos":"a"}')).toEqual([]);
  });

  it("puts an opened repository first, once, and keeps the list short", () => {
    const many = Array.from({ length: MAX_RECENT_REPOS }, (_, i) => repo(`r${i}`));
    const next = remembered(many, repo("r5"));
    expect(next[0]).toEqual(repo("r5"));
    expect(next.filter((r) => r.path === "r5")).toHaveLength(1);
    expect(remembered(many, repo("new"))).toHaveLength(MAX_RECENT_REPOS);
    expect(forgotten(many, repo("r0")).some((r) => r.path === "r0")).toBe(false);
  });
});
