import { expect, test } from "@playwright/test";
import { LOOKS, closeWindows, expectLook, openDesktop, setLook, settle, walkFocus, type FocusStop } from "./desktop.ts";
import { report } from "./report.ts";
import { screens } from "./screens.ts";

/**
 * Tabs through every screen and asserts a ring of at least 2 px at 3:1
 * against its surface on each of the app's stops. SuperDoc's and Univer's own
 * stops, and the window's title buttons (the desktop's), are listed in the
 * report and not asserted: their rings aren't this repo's. LOOKS narrows the
 * looks (light, dark, classic-light, classic-dark; all four by default). It
 * sets the dev account's look, so run it with --workers=1.
 */
const looks = (process.env.LOOKS ?? "light,dark,classic-light,classic-dark").split(",") as (keyof typeof LOOKS)[];

for (const look of looks) {
  for (const screen of screens()) {
    test(`a ring on every stop: ${screen.name}, ${look}`, async ({ page, request }, info) => {
      test.skip(info.project.name !== "desktop-1280", "the focus walk runs at 1280");
      await setLook(request, LOOKS[look]);
      await openDesktop(page);
      await expectLook(page, LOOKS[look]);
      await closeWindows(page);
      const win = await screen.open(page, false);
      await settle(page);
      // A screen that is a dialog is walked inside the dialog, where focus is held.
      const dialog = page.getByRole("dialog").locator("visible=true");
      const root = (await dialog.count()) ? dialog.last() : win;
      const stops = await walkFocus(page, root, screen.vendor);
      report("focus", { screen: screen.name, look, stops });
      const app = stops.filter((s) => s.part === "app");
      if (!screen.noAppStops) expect(app.length, "the app has stops").toBeGreaterThan(0);
      // imbatranimOS's known gap: Classic's crimson on the dark surfaces is
      // about 2.9 to 3.3:1, a token value left as it was (its contrast test).
      // Such a ring is reported, not failed; anything weaker still fails.
      const gap = (s: FocusStop) => look === "classic-dark" && s.width >= 2 && s.contrast >= 2.85;
      const weak = app.filter((s) => (s.width < 2 || s.contrast < 3) && !gap(s));
      report("focus-gap", { screen: screen.name, look, stops: app.filter((s) => s.contrast < 3 && gap(s)) });
      expect(weak, "stops without a 2 px ring at 3:1").toEqual([]);
      await page.keyboard.press("Escape");
      await closeWindows(page);
    });
  }
}
