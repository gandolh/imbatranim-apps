import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

/** The desktop's appearance dotfile key (imbatranimOS's appearance store). */
export const APPEARANCE_KEY = "imbatranimos:appearance";

export type Look = { theme: "apricot" | "classic"; mode: "light" | "dark" };

export const LOOKS = {
  light: { theme: "apricot", mode: "light" },
  dark: { theme: "apricot", mode: "dark" },
  "classic-light": { theme: "classic", mode: "light" },
  "classic-dark": { theme: "classic", mode: "dark" },
} satisfies Record<string, Look>;

/** Saves a theme and mode for the dev account, with the default accents. Load the page after it. */
export async function setLook(api: APIRequestContext, look: Look): Promise<void> {
  const state = {
    theme: look.theme,
    mode: look.mode,
    modePreference: look.mode,
    accents: { apricot: "apricot", classic: "crimson" },
  };
  const res = await api.put("/api/prefs", {
    data: { entries: [{ key: APPEARANCE_KEY, value: JSON.stringify({ state, version: 1 }) }] },
  });
  expect(res.ok(), "the appearance was saved").toBe(true);
}

/** The desktop, signed in, with the taskbar drawn and the fonts loaded. */
export async function openDesktop(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("taskbar")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** Every window's close button, pressed. A window with unsaved changes would ask; the specs change nothing. */
export async function closeWindows(page: Page): Promise<void> {
  for (const close of await page.locator("[data-window-id] button[title='Close']").all()) {
    if (await close.isVisible()) await close.dispatchEvent("click");
  }
}

/**
 * Opens a file or an app through Start's search, the way a person would, and
 * returns its window. `title` is the text the window's title band shows.
 */
export async function openFromStart(page: Page, query: string, title: string | RegExp = query): Promise<Locator> {
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const menu = page.getByRole("menu", { name: "Start menu" });
  await expect(menu).toBeVisible();
  await menu.getByRole("searchbox", { name: "Search apps and files" }).fill(query);
  await expect(menu.getByRole("menuitem").first()).toBeVisible();
  await page.keyboard.press("Enter");
  const win = page.locator("[data-window-id]").filter({ hasText: title }).last();
  await expect(win).toBeVisible({ timeout: 30_000 });
  await expect(win.getByText("Loading…")).toHaveCount(0, { timeout: 30_000 });
  return win;
}

/** Waits two frames and a short pause, so a canvas (CAD, a PDF page, a slide) has painted. */
export async function settle(page: Page, ms = 600): Promise<void> {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(ms);
}

/**
 * The focus ring of the focused element: its width, and its contrast against
 * the surface it is drawn on. A Tailwind ring is a box-shadow with a spread
 * and no blur; an outline counts too.
 */
export async function focusRing(page: Page): Promise<{ width: number; contrast: number; label: string }> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { width: 0, contrast: 0, label: "(nothing)" };
    const label = (el.getAttribute("aria-label") ?? el.textContent ?? el.tagName).trim().slice(0, 40);
    const cs = getComputedStyle(el);
    const parse = (c: string): [number, number, number, number] => {
      const m = /rgba?\(([^)]+)\)/.exec(c);
      if (!m) return [0, 0, 0, 0];
      const p = m[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    let ring: { width: number; color: string; inset: boolean } | null = null;
    for (const shadow of cs.boxShadow.split(/,(?![^(]*\))/)) {
      const color = /rgba?\([^)]+\)/.exec(shadow)?.[0];
      const px = [...shadow.replace(/rgba?\([^)]+\)/, "").matchAll(/(-?[\d.]+)px/g)].map((m) => Number(m[1]));
      if (color && px.length >= 4 && px[2] === 0 && px[3] > 0 && parse(color)[3] > 0) {
        if (!ring || px[3] > ring.width) ring = { width: px[3], color, inset: shadow.includes("inset") };
      }
    }
    if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > (ring?.width ?? 0)) {
      ring = { width: parseFloat(cs.outlineWidth), color: cs.outlineColor, inset: parseFloat(cs.outlineOffset) < 0 };
    }
    if (!ring) return { width: 0, contrast: 0, label };
    const layers: [number, number, number, number][] = [];
    for (let n: HTMLElement | null = ring.inset ? el : el.parentElement; n; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 1) break;
    }
    let surface: [number, number, number] = [255, 255, 255];
    for (const [r, g, b, a] of layers.reverse()) {
      surface = [r * a + surface[0] * (1 - a), g * a + surface[1] * (1 - a), b * a + surface[2] * (1 - a)];
    }
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const [hi, lo] = [lum(parse(ring.color)), lum(surface)].sort((x, y) => y - x);
    return { width: ring.width, contrast: (hi + 0.05) / (lo + 0.05), label };
  });
}

/**
 * Opens a file from the container's home in its default app: Start's search
 * finds it and shows its folder in the File Manager, and a double click opens
 * it. Returns the app's window, whose title band names the file.
 */
export async function openFile(page: Page, name: string): Promise<Locator> {
  const files = await openFromStart(page, name, "File Manager");
  await files.getByText(name, { exact: true }).first().dblclick();
  const win = page
    .locator("[data-window-id]")
    .filter({ has: page.getByText(name, { exact: true }) })
    .filter({ hasNotText: "File Manager" })
    .last();
  await expect(win).toBeVisible({ timeout: 30_000 });
  await expect(win.getByText("Loading…")).toHaveCount(0, { timeout: 30_000 });
  // The app's window opens over the File Manager's close button.
  await files.locator("button[title='Close']").first().dispatchEvent("click");
  return win;
}
