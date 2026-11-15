import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "node:process";
import { defineConfig } from "@playwright/test";

/**
 * Browser checks of the apps inside a running imbatranimOS desktop. The apps
 * render only in an OS window, so these run against imbatranimOS's dev
 * container (its desktop on an exposed port, its own home volume), never a
 * desktop on the host, with the suite installed from a local checkout
 * (os/README.md). Run by hand, headless, at most two workers:
 *
 *   DESKTOP_URL=http://localhost:5173 OS_E2E_PASSWORD=… npx playwright test -c tools/browser
 *
 * `npm run check` never runs them. The dev account's password comes from the
 * command line only (imbatranimOS's infrastructure/README.md names it). The
 * session, the results and the saved appearance live in the system's temp
 * folder, outside the repo.
 */
export const E2E_DIR = join(tmpdir(), "imbatranim-apps-e2e");
export const STATE_FILE = join(E2E_DIR, "session.json");

const phone = { isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

export default defineConfig({
  testDir: ".",
  outputDir: join(E2E_DIR, "results"),
  globalSetup: "./globalSetup.ts",
  globalTeardown: "./globalTeardown.ts",
  workers: 2,
  // One dev account backs every worker, and the specs change its appearance.
  fullyParallel: false,
  retries: 0,
  timeout: 120_000,
  reporter: "list",
  use: {
    baseURL: env.DESKTOP_URL ?? "http://localhost:5173",
    storageState: STATE_FILE,
    // A trace records what was typed, the password included.
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 800 } } },
    // Ruling 8's in-between widths: only the measurements run there.
    { name: "desktop-1024", testMatch: "measure.spec.ts", use: { viewport: { width: 1024, height: 768 } } },
    { name: "tablet-768", testMatch: "measure.spec.ts", use: { viewport: { width: 768, height: 1024 } } },
    { name: "phone-390", use: { viewport: { width: 390, height: 844 }, ...phone } },
    { name: "phone-360", use: { viewport: { width: 360, height: 800 }, ...phone } },
  ],
});
