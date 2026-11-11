import type { KitAppProps } from "@imbatranim/ui";
import { GitGui } from "./GitGui";

/**
 * The module the desktop imports for `git-gui`. The built-in's manifest
 * became this module plus the Developer descriptor's entry, which carries the
 * name, icon, window sizes and `multiInstance: false` (one repository at a
 * time keeps the picked repo unambiguous). The id is the built-in's, so a pin
 * and a startup entry come back when Developer is installed.
 *
 * Git itself stays the OS's: its `git` module runs git on a repository in the
 * home that this window was given, over a fixed list of subcommands. The app
 * is the screen on top, and its recent repositories are its own
 * (`recents.ts`).
 */
export function App({ windowId }: KitAppProps) {
  return <GitGui windowId={windowId} />;
}
