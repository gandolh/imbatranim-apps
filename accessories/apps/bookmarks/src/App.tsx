import type { KitAppProps } from "@imbatranim/ui";
import { Bookmarks } from "./Bookmarks";
import { bookmarksSource } from "./commandSource";

/**
 * The module the desktop imports for `bookmarks`. The built-in's manifest
 * became this module plus the Accessories descriptor's entry, which carries
 * the name, icon, window sizes, `multiInstance: false` and
 * `commandSources: true`. The id is the built-in's, so a pin and a startup
 * entry come back when Accessories is installed, and the folders are the
 * file the OS moved into Bookmarks' data folder.
 *
 * Three things are fixed for the Browser, which opens a bookmark with
 * `openApp('browser', { url })`:
 *
 * 1. **The field is `url`**, on `BookmarkLink` and in the file.
 * 2. **Only `http:` and `https:` are kept** (`store/bookmarkUrl.ts`), on
 *    every write and every read, so a stored value is safe to hand to the
 *    Browser and to render as `<a href>`.
 * 3. **The folders are flat + `parentId`**; the tree is assembled in the app
 *    (`tree.ts`).
 *
 * Activating a bookmark opens it in the Browser when this machine has one
 * set up, and in a tab of the viewing browser otherwise. The command palette
 * still opens a tab: its `activate` has no `system` handle to launch an app
 * with.
 *
 * **No favicons**, a decision rather than an omission: fetching one is an
 * outbound request per bookmark from the desktop origin, which needs a CSP
 * hole and leaks browsing interest. Imported `ICON` attributes are dropped
 * for the same reason (`netscape.ts`).
 */
export function App({ windowId }: KitAppProps) {
  return <Bookmarks windowId={windowId} />;
}

/** Bookmarks in the command palette and Start's search, with no window open. */
export const commandSources = [bookmarksSource];
