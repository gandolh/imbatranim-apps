import type { KitAppProps, KitBackgroundProps } from "@imbatranim/ui";
import { Todo } from "./Todo";
import { TodoBackground } from "./TodoBackground";

/**
 * The module the desktop imports for `todo`. The built-in's manifest became
 * this module plus the Accessories descriptor's entry, which carries the
 * name, icon, window sizes, `multiInstance: false` and `background: true`.
 * The id is the built-in's, so a pin and a startup entry come back when
 * Accessories is installed, and the tasks are the files the OS moved into
 * Todo's data folder.
 */
export function App({ windowId }: KitAppProps) {
  return <Todo windowId={windowId} />;
}

/**
 * Mounted by the desktop from sign-in to sign-out while Todo is installed and
 * on, with no window: it keeps the tasks read and announces due ones.
 */
export function Background(_props: KitBackgroundProps) {
  return <TodoBackground />;
}
