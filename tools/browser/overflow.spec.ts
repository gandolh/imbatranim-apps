import { expect, test } from "@playwright/test";
import { clippedControls, closeWindows, openDesktop, phoneFit, settle } from "./desktop.ts";
import { report } from "./report.ts";
import { screens } from "./screens.ts";

/**
 * At 390 and 360: no sideways scroll with each app open, the window maximized
 * above the taskbar, none of the app's controls left outside it, and none cut
 * off by a box inside it (`clippedControls`).
 */
test.beforeEach(() => {
  test.skip(!test.info().project.name.startsWith("phone"), "the phone checks run at 390 and 360");
});

/**
 * Cuts the clip check lets through, by screen: a drawn screen's cut is
 * listed here with its reason rather than redesigned. `match` is tested
 * against the finding, `<control> | <box>`.
 */
const CLIP_ALLOWED: Record<string, { match: RegExp; reason: string }[]> = {
  sheets: [
    {
      match: /\| section\.univer-/,
      reason: "Univer's own sidebar and ribbon buttons, cut by Univer's own boxes; this repo doesn't draw them",
    },
  ],
  "pdf-annotate": [
    {
      match: /^Custom colour \| label\./,
      reason: "the native colour input is cropped to a swatch by its label on purpose; the label is the whole target",
    },
  ],
};

for (const screen of screens((s) => s.only !== "desktop")) {
  test(`fits the phone: ${screen.name}`, async ({ page }, info) => {
    await openDesktop(page);
    await closeWindows(page);
    const win = await screen.open(page, true);
    await settle(page, 800);
    const fit = await phoneFit(win);
    const clipped = await clippedControls(win);
    const allowed = CLIP_ALLOWED[screen.name] ?? [];
    const cut = clipped.filter((c) => !allowed.some((a) => a.match.test(c)));
    report("overflow", { screen: screen.name, width: info.project.name, ...fit, clipped });
    expect(fit.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(fit.innerWidth);
    const [left, top, right, bottom] = fit.window;
    expect([left, top, right], "the window spans the screen").toEqual([0, 0, fit.innerWidth]);
    expect(Math.abs(bottom - (fit.taskbarTop ?? -99)), "the window ends at the taskbar").toBeLessThanOrEqual(1);
    expect(fit.outside, "controls outside the window").toEqual([]);
    expect(cut, "controls a box cuts off").toEqual([]);
    await page.keyboard.press("Escape");
    await closeWindows(page);
  });
}
