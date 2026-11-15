import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { closeWindows, motionReset, motionSeen, openDesktop, recordMotion, settle } from "./desktop.ts";
import { report } from "./report.ts";
import { screens } from "./screens.ts";

/**
 * With `prefers-reduced-motion: reduce`, nothing of the app's own runs while
 * each screen opens, loads and opens its panel or dialog: a sampler records
 * every running animation and transition frame by frame. What moves in
 * SuperDoc's or Univer's own parts, in the kit's controls (the desktop's) or
 * in another window is listed in the report and not asserted, as the focus
 * walk does with their rings.
 */
const APP_IDS = new Set([
  "office-docs",
  "office-sheets",
  "office-slides",
  "office-pdf",
  "office-cad",
  "todo",
  "bookmarks",
  "git-gui",
  "rest-api-client",
]);
const VENDOR = /(^|\s)(sd-|univer-|superdoc)/;
/** The kit's own class strings, from the snapshot: a part that carries one is the kit's. */
const kitDir = join(import.meta.dirname, "..", "..", "vendor", "imbatranim-ui", "src", "components");
const KIT = readdirSync(kitDir)
  .filter((f) => f.endsWith(".tsx"))
  .flatMap((f) => [...readFileSync(join(kitDir, f), "utf8").matchAll(/"([^"\n]{30,})"/g)].map((m) => m[1]));

function part(entry: string): "app" | "vendor" | "kit" | "other" {
  const [, appId = "", , cls = ""] = /^\S+ (\S+) (\S+?)\.(.*)$/.exec(entry) ?? [];
  if (!APP_IDS.has(appId)) return "other";
  if (VENDOR.test(cls)) return "vendor";
  if (KIT.some((k) => cls.includes(k))) return "kit";
  return "app";
}

test.beforeEach(() => {
  test.skip(test.info().project.name !== "desktop-1280", "the motion checks run at 1280");
});

test("the sampler sees motion when motion is allowed", async ({ page }) => {
  await recordMotion(page);
  await openDesktop(page);
  await closeWindows(page);
  await motionReset(page);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await settle(page);
  expect((await motionSeen(page)).length, "something moved").toBeGreaterThan(0);
  await page.keyboard.press("Escape");
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  for (const screen of screens((s) => s.only !== "phone")) {
    test(`nothing of the app's moves: ${screen.name}`, async ({ page }) => {
      await recordMotion(page);
      await openDesktop(page);
      await closeWindows(page);
      await motionReset(page);
      await screen.open(page, false);
      await settle(page, 800);
      const seen = (await motionSeen(page)).map((entry) => ({ part: part(entry), entry: entry.slice(0, 160) }));
      // At rest: what document.getAnimations() still lists as running, sorted the same way.
      const atRest = (
        await page.evaluate(() =>
          document
            .getAnimations()
            .filter((a) => a.playState === "running")
            .map((a) => {
              const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
              const id = t?.closest("[data-window-id]")?.getAttribute("data-app-id") ?? "desktop";
              return `${a.constructor.name} ${id} ${t?.tagName.toLowerCase() ?? "?"}.${t?.getAttribute("class") ?? ""}`;
            }),
        )
      ).map((entry) => ({ part: part(entry), entry: entry.slice(0, 160) }));
      report("motion", { screen: screen.name, seen, atRest });
      expect(
        seen.filter((s) => s.part === "app").map((s) => s.entry),
        "the app's animations or transitions that ran",
      ).toEqual([]);
      expect(
        atRest.filter((s) => s.part === "app").map((s) => s.entry),
        "the app's animations still running at rest",
      ).toEqual([]);
      await page.keyboard.press("Escape");
      await closeWindows(page);
    });
  }
});
