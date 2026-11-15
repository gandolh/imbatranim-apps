import { join } from "node:path";
import { test, type Page } from "@playwright/test";
import { LOOKS, closeWindows, expectLook, openDesktop, setLook, settle } from "./desktop.ts";
import { screens, type Screen } from "./screens.ts";

/**
 * Screenshots for comparing with the board's twins, kept outside the repo:
 * `SHOTS_DIR=<folder> … npx playwright test -c tools/browser shots --workers=1`.
 * The drawn screens in all four looks, the rest in Apricot light, at 1280
 * (the 958 px window) and 390 (maximized), named `<screen>-<look>-<width>.png`.
 * It sets the dev account's look; the teardown puts it back.
 */
const SHOTS_DIR = process.env.SHOTS_DIR;
test.use({ deviceScaleFactor: 1 });
test.beforeEach(() => {
  const name = test.info().project.name;
  test.skip(!SHOTS_DIR, "SHOTS_DIR names the folder");
  test.skip(name !== "desktop-1280" && name !== "phone-390", "the board drew 1280 and 390");
});

async function shoot(page: Page, list: Screen[], look: keyof typeof LOOKS, width: number) {
  for (const screen of list) {
    await openDesktop(page);
    await expectLook(page, LOOKS[look]);
    await closeWindows(page);
    await screen.open(page, width < 600);
    // CAD's and PDF's canvases, a slide and SuperDoc's pages settle first.
    await settle(page, 1500);
    await page.screenshot({ path: join(SHOTS_DIR ?? "", `${screen.name}-${look}-${width}.png`) });
    await page.keyboard.press("Escape");
    await closeWindows(page);
  }
}

for (const look of Object.keys(LOOKS) as (keyof typeof LOOKS)[]) {
  test(`the drawn screens, ${look}`, async ({ page, request }, info) => {
    await setLook(request, LOOKS[look]);
    await shoot(
      page,
      screens((s) => s.drawn),
      look,
      info.project.use.viewport?.width ?? 0,
    );
  });
}

test("the undrawn screens, light", async ({ page, request }, info) => {
  await setLook(request, LOOKS.light);
  await shoot(
    page,
    screens((s) => !s.drawn),
    "light",
    info.project.use.viewport?.width ?? 0,
  );
});
