// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanupRendered,
  createFakeSystem,
  renderWithSystem,
  settle,
  type FakeSystem,
} from "@imbatranim-office/shared/testing";
import { fencedSystem } from "../../../shared/src/testing/fencedSystem";
import { App } from "./App";
import { recentsStore } from "./recents";

const host = { appId: "git-gui", assetBase: "/", server: null };

const RECENTS = {
  repos: [
    { root: "home", path: "code/site" },
    { root: "home", path: "code/tool" },
  ],
};

/** The `git` module's answers for a clean repo; `refuse` makes every read fail with that status. */
function answerGit(fake: FakeSystem, refuse?: number) {
  const answers: Record<string, unknown> = {
    "/git/status": { entries: [] },
    "/git/log": { commits: [] },
    "/git/branches": {
      branches: [{ name: "main", current: true }],
      current: "main",
      detached: false,
      dirty: false,
    },
    "/git/stash": { stashes: [] },
  };
  fake.system.http.get = (async (url: string) => {
    if (refuse) {
      throw Object.assign(new Error(`Request failed with status code ${refuse}`), {
        response: { status: refuse, data: { message: "not given" } },
      });
    }
    if (!(url in answers)) throw new Error(`no answer for ${url}`);
    return { data: answers[url], status: 200, headers: {} };
  }) as never;
}

function recentsFile(fake: FakeSystem): unknown {
  return JSON.parse(fake.appData.get("state:recents.json") ?? "null");
}

function clickRecent(path: string) {
  const button = [...document.querySelectorAll("button")].find((b) => b.textContent?.startsWith(path));
  if (!button) throw new Error(`no recent ${path} on screen`);
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => recentsStore.reset());
afterEach(cleanupRendered);

describe("Git GUI as a kit app", () => {
  it("lists its recent repositories from its state folder, with only the capabilities its descriptor grants", async () => {
    const fake = createFakeSystem({
      appId: "git-gui",
      appData: { "state:recents.json": JSON.stringify(RECENTS) },
    });
    const { container } = renderWithSystem(
      <App windowId="window-1" host={host} />,
      fencedSystem(fake.system, "git-gui"),
    );
    await settle();
    expect(container.textContent).toContain("code/site");
    expect(container.textContent).toContain("code/tool");
  });

  it("reopens a recent through the OS, and moves it to the top of the list", async () => {
    const fake = createFakeSystem({
      appId: "git-gui",
      appData: { "state:recents.json": JSON.stringify(RECENTS) },
    });
    answerGit(fake);
    const reopened: string[] = [];
    fake.system.fs.reopenRecent = async (root, path) => void reopened.push(`${root}:${path}`);
    renderWithSystem(<App windowId="window-1" host={host} />, fencedSystem(fake.system, "git-gui"));
    await settle();
    clickRecent("code/tool");
    await settle();
    expect(reopened).toEqual(["home:code/tool"]);
    expect(fake.recents).toEqual(["home:code/tool"]);
    expect(recentsFile(fake)).toEqual({
      repos: [
        { root: "home", path: "code/tool" },
        { root: "home", path: "code/site" },
      ],
    });
  });

  it("opens the repository the OS opened it with, and remembers it", async () => {
    const fake = createFakeSystem({
      appId: "git-gui",
      intent: { root: "home", openPath: "code/new" },
    });
    answerGit(fake);
    const { container } = renderWithSystem(
      <App windowId="window-1" host={host} />,
      fencedSystem(fake.system, "git-gui"),
    );
    await settle();
    expect(container.textContent).toContain("main");
    expect(fake.recents).toEqual(["home:code/new"]);
    expect(recentsFile(fake)).toEqual({ repos: [{ root: "home", path: "code/new" }] });
  });

  it("takes a recent the OS no longer gives off the list", async () => {
    const fake = createFakeSystem({
      appId: "git-gui",
      appData: { "state:recents.json": JSON.stringify(RECENTS) },
    });
    answerGit(fake, 403);
    renderWithSystem(<App windowId="window-1" host={host} />, fencedSystem(fake.system, "git-gui"));
    await settle();
    clickRecent("code/site");
    await settle();
    expect(fake.recents).toEqual([]);
    expect(recentsFile(fake)).toEqual({ repos: [{ root: "home", path: "code/tool" }] });
  });
});
