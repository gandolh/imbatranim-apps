import { expect, test } from "@playwright/test";
import { join } from "node:path";
import { LOOKS, closeWindows, expectLook, openDesktop, openFile, setLook, settle } from "./desktop.ts";

/**
 * Slides' font size list is taller than a phone at 44 px a row. At 390x640
 * and 360x800 it fits inside the screen and scrolls inside itself, and
 * scrolling it keeps it open. Phone projects only; SHOTS_DIR, when set, gets
 * a shot per look. Run it with --workers=1 (it sets the dev account's look).
 */
const SIZES = { "phone-390": { width: 390, height: 640 }, "phone-360": { width: 360, height: 800 } } as const;

for (const look of ["light", "classic-dark"] as const) {
  test(`the font size list fits and scrolls: ${look}`, async ({ page, request }, info) => {
    const size = SIZES[info.project.name as keyof typeof SIZES];
    test.skip(!size, "phone projects only");
    await setLook(request, LOOKS[look]);
    await page.setViewportSize(size);
    await openDesktop(page);
    await expectLook(page, LOOKS[look]);
    await closeWindows(page);
    const win = await openFile(page, "anim.pptx");
    await settle(page, 800);
    // Select the body text, then open the Text sheet and the size list.
    await win.getByText("Body that fades in on click 1").first().click();
    await win.getByRole("button", { name: "Text", exact: true }).locator("visible=true").first().click();
    await settle(page, 500);
    await page.getByRole("button", { name: "Font size" }).locator("visible=true").first().click();
    const popup = page.getByRole("menu").locator("visible=true").last();
    await expect(popup).toBeVisible();
    await settle(page, 400);
    const box = await popup.boundingBox();
    expect(box, "the list has a box").not.toBeNull();
    const { x, y, width, height } = box as NonNullable<typeof box>;
    expect(y, "the list starts on screen").toBeGreaterThanOrEqual(0);
    expect(y + height, "the list ends on screen").toBeLessThanOrEqual(size.height);
    expect(x, "the list starts inside").toBeGreaterThanOrEqual(0);
    expect(x + width, "the list ends inside").toBeLessThanOrEqual(size.width);
    const m = await popup.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
    expect(m.scrollHeight, `the list scrolls inside itself (${JSON.stringify(m)})`).toBeGreaterThan(m.clientHeight);
    if (process.env.SHOTS_DIR) {
      await page.screenshot({
        path: join(process.env.SHOTS_DIR, `slides-size-${look}-${size.width}x${size.height}.png`),
      });
    }
    await popup.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await settle(page, 300);
    await expect(popup, "scrolling inside keeps the list open").toBeVisible();
    const last = popup
      .getByRole("menuitem")
      .or(popup.getByRole("menuitemradio"))
      .or(popup.getByRole("menuitemcheckbox"))
      .last();
    await expect(last).toBeInViewport();
    await page.keyboard.press("Escape");
    await closeWindows(page);
  });
}
