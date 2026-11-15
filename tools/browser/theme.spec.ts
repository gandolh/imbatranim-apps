import { expect, test, type Locator, type Page } from "@playwright/test";
import { LOOKS, closeWindows, openDesktop, openFile, openFromStart, setLook, settle } from "./desktop.ts";
import { report } from "./report.ts";

/**
 * The desktop's Light / Dark / System switch reaches the apps: Slides' app
 * bar (the kit's tokens) and Univer's own ribbon and grid (its dark mode,
 * driven from the desktop's mode) change with it, in both themes. A first
 * visit, with nothing saved, is light. It sets the dev account's look, so run
 * it with --workers=1; the teardown puts the look back.
 */
test.beforeEach(() => {
  test.skip(test.info().project.name !== "desktop-1280", "the switch is checked once, at 1280");
});

test("a first visit is light", async ({ browser }, info) => {
  const fresh = await browser.newContext({ ...info.project.use, storageState: { cookies: [], origins: [] } });
  const page = await fresh.newPage();
  await page.goto("/");
  await expect(page.getByLabel("Password")).toBeVisible();
  const mode = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute("data-theme"),
    scheme: getComputedStyle(document.documentElement).colorScheme,
  }));
  expect(mode.theme ?? "light").toBe("light");
  expect(mode.scheme).toBe("light");
  await fresh.close();
});

/** The background a part paints: its own, or the first ancestor's that isn't transparent. */
function paint(part: Locator): Promise<string> {
  return part.evaluate((el) => {
    for (let n: Element | null = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
    }
    return "none";
  });
}

async function colours(page: Page) {
  const slides = page.locator("[data-window-id][data-app-id='office-slides']");
  const sheets = page.locator("[data-window-id][data-app-id='office-sheets']");
  return {
    slidesBar: await paint(slides.getByRole("toolbar").first()),
    univer: await paint(
      sheets.locator("[class*='univer-toolbar'], [class*='univer-ribbon'], [class*='univer']").last(),
    ),
  };
}

for (const theme of ["apricot", "classic"] as const) {
  test(`Light, Dark and System reach the apps in ${theme}`, async ({ page, request }) => {
    await setLook(request, theme === "apricot" ? LOOKS.light : LOOKS["classic-light"]);
    await openDesktop(page);
    await closeWindows(page);
    await openFile(page, "anim.pptx");
    await openFile(page, "calc-30k.xlsx");
    await settle(page, 1500);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-os-theme", theme);
    const light = await colours(page);

    const settings = await openFromStart(page, "Settings");
    await settings.getByRole("radio", { name: "Dark" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await settle(page, 800);
    const dark = await colours(page);
    expect(dark.slidesBar, "Slides' app bar").not.toBe(light.slidesBar);
    expect(dark.univer, "Univer's own parts").not.toBe(light.univer);

    await page.emulateMedia({ colorScheme: "dark" });
    await settings.getByRole("radio", { name: "System" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(html).toHaveAttribute("data-theme", "light");
    await settle(page, 800);
    const system = await colours(page);
    expect(system, "System on a light device paints light").toEqual(light);

    await settings.getByRole("radio", { name: "Light" }).click();
    report("theme", { theme, light, dark, system });
    await closeWindows(page);
  });
}
