import { expect, test } from "@playwright/test";
import { closeWindows, openDesktop, phoneFit, settle } from "./desktop.ts";
import { report } from "./report.ts";
import { screens } from "./screens.ts";

/**
 * At 390 and 360: no sideways scroll with each app open, the window maximized
 * above the taskbar, and none of the app's controls left outside it.
 */
test.beforeEach(() => {
  test.skip(!test.info().project.name.startsWith("phone"), "the phone checks run at 390 and 360");
});

for (const screen of screens((s) => s.only !== "desktop")) {
  test(`fits the phone: ${screen.name}`, async ({ page }, info) => {
    await openDesktop(page);
    await closeWindows(page);
    const win = await screen.open(page, true);
    await settle(page, 800);
    const fit = await phoneFit(win);
    report("overflow", { screen: screen.name, width: info.project.name, ...fit });
    expect(fit.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(fit.innerWidth);
    const [left, top, right, bottom] = fit.window;
    expect([left, top, right], "the window spans the screen").toEqual([0, 0, fit.innerWidth]);
    expect(Math.abs(bottom - (fit.taskbarTop ?? -99)), "the window ends at the taskbar").toBeLessThanOrEqual(1);
    expect(fit.outside, "controls outside the window").toEqual([]);
    await page.keyboard.press("Escape");
    await closeWindows(page);
  });
}
