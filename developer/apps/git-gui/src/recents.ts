import type { SystemData } from "@imbatranim/ui";
import { createDataStore, type DataStoreFiles, type Loaded } from "../../../../packages/shared/src/dataStore";
import type { RecentRepo } from "./types";

/**
 * Git GUI's recent repositories, newest first, in `recents.json` in its state
 * folder (`~/.local/state/imbatranim/git-gui/`). The OS wrote the file once
 * from the rows its `git` module kept when Git GUI was built in.
 *
 * The list is what the open screen shows. What lets a new window have one of
 * them again is the OS's: each opened repository is also one of Git GUI's OS
 * recents (`system.fs.recordRecent`, a folder it held), and
 * `system.fs.reopenRecent` gives a window only what that list holds. An
 * entry here the OS doesn't know (its recents were cleared) opens nothing,
 * and comes off this list.
 */

export const RECENTS_FILE = "recents.json";
/** The open screen shows a short menu, not a history. */
export const MAX_RECENT_REPOS = 10;

type RecentsFile = { repos: RecentRepo[] };

const text = (doc: RecentsFile) => `${JSON.stringify(doc, null, 2)}\n`;

/**
 * The repositories a file holds. A file that isn't the list (hand-edited,
 * cut short) reads as none: the next repository opened writes it again.
 */
export function readRepos(content: string): RecentRepo[] {
  let doc: unknown;
  try {
    doc = JSON.parse(content);
  } catch {
    return [];
  }
  const repos = (doc as { repos?: unknown } | null)?.repos;
  if (!Array.isArray(repos)) return [];
  return repos
    .filter((r: Partial<RecentRepo>): r is RecentRepo => typeof r?.root === "string" && typeof r.path === "string")
    .map((r) => ({ root: r.root, path: r.path }))
    .slice(0, MAX_RECENT_REPOS);
}

const recentsFiles: DataStoreFiles<RecentRepo[]> = {
  async load(data: SystemData): Promise<Loaded<RecentRepo[]>> {
    const file = await data.read(RECENTS_FILE);
    const content = file?.content ?? text({ repos: [] });
    return {
      state: file ? readRepos(content) : [],
      contents: new Map([[RECENTS_FILE, content]]),
      versions: new Map([[RECENTS_FILE, file?.version ?? null]]),
    };
  },
  serialize(repos) {
    return new Map([[RECENTS_FILE, text({ repos })]]);
  },
  keep: new Set([RECENTS_FILE]),
};

/** One list per page, shared by every Git GUI window. Its folder is `state`. */
export const recentsStore = createDataStore<RecentRepo[]>(recentsFiles);

const same = (a: RecentRepo, b: RecentRepo) => a.root === b.root && a.path === b.path;

/** `repo` first, once, and the list kept short. */
export function remembered(repos: RecentRepo[], repo: RecentRepo): RecentRepo[] {
  return [repo, ...repos.filter((r) => !same(r, repo))].slice(0, MAX_RECENT_REPOS);
}

/** The list without `repo`. */
export function forgotten(repos: RecentRepo[], repo: RecentRepo): RecentRepo[] {
  return repos.filter((r) => !same(r, repo));
}
