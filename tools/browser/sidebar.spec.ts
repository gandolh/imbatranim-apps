import { expect, test, type Locator } from "@playwright/test";
import { LOOKS, closeWindows, openDesktop, openFromStart, setLook, settle } from "./desktop.ts";

/**
 * The REST client's sidebar never scrolls sideways. The kit's ScrollArea
 * sizes its content to the widest row, so without the sidebar's own guard a
 * long saved entry grows the content and Tab onto it scrolls the viewport
 * left. The spec saves a long entry, Tabs onto it, and reads the sidebar
 * viewport's scroll position and width; it deletes the entry afterwards.
 * Run it with --workers=1 (it sets the dev account's look).
 */
const LONG_URL = `https://example.invalid/${"a-very-long-path-segment-".repeat(10)}end`;

/** The nearest scrolling ancestor of an element: the ScrollArea's viewport. */
async function viewportOf(row: Locator) {
  const handle = await row.evaluateHandle((el) => {
    for (let n = el.parentElement; n; n = n.parentElement) {
      const o = getComputedStyle(n).overflowY;
      if (o === "auto" || o === "scroll") return n;
    }
    return null;
  });
  const viewport = handle.asElement();
  expect(viewport, "the row sits in a scrolling viewport").not.toBeNull();
  return viewport as NonNullable<typeof viewport>;
}

test("a long saved entry does not scroll the REST sidebar sideways", async ({ page, request }, info) => {
  test.skip(info.project.name.startsWith("desktop-1024") || info.project.name.startsWith("tablet"), "no measure here");
  await setLook(request, LOOKS.light);
  await openDesktop(page);
  await closeWindows(page);
  const win = await openFromStart(page, "REST Client", /REST/);
  const phone = (page.viewportSize()?.width ?? 1280) <= 600;
  // A phone opens on its list; the request is a view of its own.
  if (phone)
    await win
      .getByRole("button", { name: /^Request/ })
      .locator("visible=true")
      .first()
      .click();
  await win.getByPlaceholder(/^https:\/\/api\.example\.com/).fill(LONG_URL);
  await win.locator("button[title='Save to collection']").locator("visible=true").first().click();
  if (phone) await win.getByRole("button", { name: "Back" }).locator("visible=true").first().click();
  await settle(page);

  const sidebar = win.locator("aside").locator("visible=true").first();
  const row = sidebar.getByRole("button", { name: new RegExp(LONG_URL.slice(0, 40)) }).first();
  try {
    await expect(row).toBeVisible();
    const viewport = await viewportOf(row);
    // Tab from the sidebar's first stop until focus reaches the long entry.
    await sidebar.getByRole("button").first().focus();
    for (let i = 0; i < 8 && !(await row.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(row).toBeFocused();
    const m = await viewport.evaluate((el) => ({
      scrollLeft: el.scrollLeft,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(m.scrollLeft, `the viewport stays at the left (${JSON.stringify(m)})`).toBe(0);
    expect(m.scrollWidth, `the content fits the column (${JSON.stringify(m)})`).toBeLessThanOrEqual(m.clientWidth);
  } finally {
    // Leave the container's saved requests as they were.
    await sidebar.locator("button[title='Delete']").first().dispatchEvent("click");
    await closeWindows(page);
  }
});
