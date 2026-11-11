import type { KitAppProps } from "@imbatranim/ui";
import { RestApiClient } from "./RestApiClient";

/**
 * The module the desktop imports for `rest-api-client`. The built-in's
 * manifest became this module plus the Developer descriptor's entry, which
 * carries the name, icon, window sizes and `multiInstance: false` (one
 * request workspace). The id is the built-in's, so a pin and a startup entry
 * come back when Developer is installed.
 *
 * Requests go out through the OS's `http-proxy`, which sends them from the
 * machine behind its guard. The collections, history and environments are a
 * file in the app's data folder (`api/collectionsApi.ts`), where they have
 * been since the app was built in, so installing brings them back as they
 * were.
 */
export function App({ windowId }: KitAppProps) {
  return <RestApiClient windowId={windowId} />;
}
