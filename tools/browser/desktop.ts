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
 * and no blur; an outline counts too. A ring with alpha (`ring-primary/40`)
 * is blended over that surface first, as the eye sees it.
 */
export async function focusRing(page: Page): Promise<{ width: number; contrast: number; label: string }> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { width: 0, contrast: 0, label: "(nothing)" };
    const label = (el.getAttribute("aria-label") ?? el.textContent ?? el.tagName).trim().slice(0, 40);
    // Any CSS colour (rgb, oklab, color(srgb …)) to [r, g, b, a], through a canvas.
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgba = (c: string): [number, number, number, number] => {
      if (!ctx || !c || c === "transparent") return [0, 0, 0, 0];
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const COLOR = /(?:rgba?|oklab|oklch|lab|lch|hsla?|color)\([^)]*\)|#[0-9a-f]{3,8}/i;
    const shadowRing = (boxShadow: string) => {
      let best: { width: number; color: string; inset: boolean } | null = null;
      for (const shadow of boxShadow.split(/,(?![^(]*\))/)) {
        const color = COLOR.exec(shadow)?.[0];
        const px = [...shadow.replace(COLOR, "").matchAll(/(-?[\d.]+)px/g)].map((m) => Number(m[1]));
        if (color && px.length >= 4 && px[2] === 0 && px[3] > 0 && rgba(color)[3] > 0) {
          if (!best || px[3] > best.width) best = { width: px[3], color, inset: shadow.includes("inset") };
        }
      }
      return best;
    };
    const cs = getComputedStyle(el);
    let ring = shadowRing(cs.boxShadow);
    if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > (ring?.width ?? 0)) {
      ring = { width: parseFloat(cs.outlineWidth), color: cs.outlineColor, inset: parseFloat(cs.outlineOffset) < 0 };
    }
    // A field's ring can sit on its wrapper (focus-within): look a few levels up.
    let host: HTMLElement = el;
    for (let n = el.parentElement, i = 0; n && i < 3 && !ring; n = n.parentElement, i++) {
      ring = shadowRing(getComputedStyle(n).boxShadow);
      if (ring) host = n;
    }
    if (!ring) return { width: 0, contrast: 0, label };
    const layers: [number, number, number, number][] = [];
    for (let n: HTMLElement | null = ring.inset ? host : host.parentElement; n; n = n.parentElement) {
      const bg = rgba(getComputedStyle(n).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 1) break;
    }
    const over = (top: [number, number, number, number], under: [number, number, number]): [number, number, number] => [
      top[0] * top[3] + under[0] * (1 - top[3]),
      top[1] * top[3] + under[1] * (1 - top[3]),
      top[2] * top[3] + under[2] * (1 - top[3]),
    ];
    let surface: [number, number, number] = [255, 255, 255];
    for (const layer of layers.reverse()) surface = over(layer, surface);
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const [hi, lo] = [lum(over(rgba(ring.color), surface)), lum(surface)].sort((x, y) => y - x);
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

/** The desktop paints the look the account was given: checked before every shot and measurement. */
export async function expectLook(page: Page, look: Look): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("data-os-theme", look.theme);
  await expect(page.locator("html")).toHaveAttribute("data-theme", look.mode);
}

export type FocusStop = { label: string; width: number; contrast: number; part: "app" | "vendor" | "os" };

/**
 * Tabs through a window from its title band and reads the ring on every stop.
 * A stop inside `vendor` (SuperDoc's or Univer's own parts), or one that keeps
 * Tab for itself (an editor, a grid), is listed and then stepped past to the
 * next focusable thing in the window, so Tab never types into a document. The
 * window's title buttons are the desktop's and are listed as `os`. Ends when
 * focus leaves the window, comes back round, or after `max` stops.
 */
export async function walkFocus(page: Page, win: Locator, vendor?: string, max = 80): Promise<FocusStop[]> {
  const stops: FocusStop[] = [];
  const seen = new Set<string>();
  let jumped = false;
  const close = win.locator("button[title='Close']").first();
  // Focus set by script counts as a keyboard focus (focusVisible), as a Tab's would.
  if (await close.count()) await close.evaluate((el) => (el as HTMLElement).focus({ focusVisible: true }));
  else {
    // A popover or a dialog without a title band: start on its first stop.
    await win.evaluate((r) =>
      r
        .querySelector<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']):not([data-base-ui-focus-guard])",
        )
        ?.focus({ focusVisible: true }),
    );
    jumped = true;
  }
  for (let i = 0; i < max; i++) {
    // After a step past a stop, the stop it landed on is read before the next Tab.
    const before = jumped
      ? null
      : await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.walk);
    if (!jumped) await page.keyboard.press("Tab");
    jumped = false;
    const where = await win.evaluate((w, sel) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || !w.contains(el)) return { inside: false, key: "", vendor: false, os: false, editor: false };
      return {
        inside: true,
        // A number of its own, so two stops that look alike are still told apart.
        key: (el.dataset.walk ??= String(document.querySelectorAll("[data-walk]").length + 1)),
        vendor: !!(sel && el.closest(sel)),
        os:
          !!el.closest("[data-window-titlebar], [data-window-chrome]") ||
          el.matches(
            // The window's title buttons, and the kit dialog's own Close.
            "button[title='Close'], button[title='Minimize'], button[title='Maximize'], button[title='Restore'], [role='dialog'] button[aria-label='Close']",
          ),
        editor: el.isContentEditable || el.getAttribute("role") === "application",
      };
    }, vendor ?? null);
    if (!where.inside) break;
    // Tab kept on the same stop (an editor, a grid): step past it below rather than end.
    const stuck = where.key === before;
    if (!stuck && seen.has(where.key)) break;
    seen.add(where.key);
    if (!stuck) stops.push({ ...(await focusRing(page)), part: where.vendor ? "vendor" : where.os ? "os" : "app" });
    if (where.vendor || where.editor || stuck) {
      // Step past it without a Tab: the next focusable thing after it, outside the vendor part.
      const moved = await win.evaluate((w, sel) => {
        const cur = document.activeElement as HTMLElement;
        const root = (sel && cur.closest(sel)) || cur;
        const all = [
          ...w.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']):not([data-base-ui-focus-guard])",
          ),
        ].filter(
          // Past a vendor part, nothing inside it; past a container (a popup), its own stops count.
          (e) =>
            e.getClientRects().length > 0 &&
            (root === cur || !root.contains(e)) &&
            e !== cur &&
            !(sel && e.closest(sel)),
        );
        // The first one after it that really takes focus.
        for (const next of all.filter((e) => root.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)) {
          next.focus({ focusVisible: true });
          if (document.activeElement === next) return true;
        }
        return false;
      }, vendor ?? null);
      if (!moved) break;
      jumped = true;
    }
  }
  return stops;
}

/**
 * Records every running animation and transition, frame by frame, from page
 * load: `document.getAnimations()` at rest is empty whatever the code does, so
 * the sampler watches the window open, load and each panel open. Read it with
 * `motionSeen`, clear it with `motionReset`.
 */
export async function recordMotion(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const seen = new Map<string, string>();
    (window as unknown as { __motion: Map<string, string> }).__motion = seen;
    const tick = () => {
      for (const a of document.getAnimations()) {
        if (a.playState !== "running") continue;
        const effect = a.effect as KeyframeEffect | null;
        const target = effect?.target as HTMLElement | null;
        const name = (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.constructor.name;
        const where = target
          ? `${target.closest("[data-window-id]")?.getAttribute("data-app-id") ?? "desktop"} ${target.tagName.toLowerCase()}.${String((target as Element).getAttribute("class") ?? "").slice(0, 300)}`
          : "?";
        seen.set(`${name} ${where}`, where);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export async function motionSeen(page: Page): Promise<string[]> {
  return page.evaluate(() => [...(window as unknown as { __motion: Map<string, string> }).__motion.keys()]);
}

export async function motionReset(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as { __motion: Map<string, string> }).__motion.clear());
}

/**
 * On a phone: no sideways scroll, the window filling the screen above the
 * taskbar, and no control of the app left outside its window (one inside a
 * scroller or a clipped vendor bar is reachable and doesn't count).
 */
export async function phoneFit(win: Locator) {
  return win.evaluate((w) => {
    const iw = window.innerWidth;
    const bar = document.querySelector("[data-testid='taskbar']")?.getBoundingClientRect();
    const r = w.getBoundingClientRect();
    const out: string[] = [];
    for (const el of w.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], [role='button']")) {
      if (el.getClientRects().length === 0) continue;
      const b = el.getBoundingClientRect();
      if (
        b.width === 0 ||
        (b.left >= r.left - 1 && b.right <= r.right + 1 && b.top >= r.top - 1 && b.bottom <= r.bottom + 1)
      )
        continue;
      let clipped = false;
      for (let n = el.parentElement; n && n !== w; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.overflowX !== "visible" || cs.overflowY !== "visible") clipped = true;
      }
      if (!clipped) out.push((el.getAttribute("aria-label") ?? el.textContent ?? el.tagName).trim().slice(0, 30));
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: iw,
      window: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
      taskbarTop: bar ? Math.round(bar.top) : null,
      outside: out.slice(0, 10),
    };
  });
}
