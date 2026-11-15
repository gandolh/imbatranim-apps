import { expect, type Locator, type Page } from "@playwright/test";
import { openFile, openFromStart, settle } from "./desktop.ts";

/**
 * Every screen the redesign touched, as the specs reach it: the file or app
 * that opens it and the steps from there. The files are the container's own
 * (corpus/wiki/test-files.md); nothing is made up for a screen. `drawn`
 * screens are on the board and are shot in all four looks; the rest once
 * per width. Games stay out: their UI is the game. Bookmarks' move dialog
 * isn't here: the container's bookmarks have one folder, so the app offers
 * nowhere to move to, and a second folder would be a made-up name.
 */
export type Screen = {
  name: string;
  drawn: boolean;
  /** Opens the screen and returns the app's window. */
  open: (page: Page, phone: boolean) => Promise<Locator>;
  /** Where focus lands in a part the app doesn't draw (SuperDoc, Univer), listed and not asserted. */
  vendor?: string;
  /** A desktop-only or phone-only screen. */
  only?: "desktop" | "phone";
  /** Why the app has no focus stop of its own on this screen, when it has none. */
  noAppStops?: string;
};

const docs = (page: Page) => openFile(page, "test.docx");
const sheets = (page: Page) => openFile(page, "calc-30k.xlsx");
const slides = (page: Page) => openFile(page, "anim.pptx");
const pdf = async (page: Page) => {
  const win = await openFile(page, "fontconfig-user.pdf");
  await expect(win.getByRole("region", { name: "Document pages" })).toBeVisible();
  return win;
};
const cad = async (page: Page) => {
  const win = await openFile(page, "apartment.dxf");
  await expect(win.getByTestId("cad-viewport")).toBeVisible();
  return win;
};

/** Clicks a control of the window by its accessible name or its title, the first visible one. */
async function press(win: Locator, name: string | RegExp): Promise<void> {
  const byName = win.getByRole("button", { name, exact: typeof name === "string" });
  const control = typeof name === "string" ? byName.or(win.locator(`button[title="${name}"]`)) : byName;
  await control.locator("visible=true").first().click();
}

/** PDF's side panel tab: on a desktop the side panel, on a phone the Pages sheet. */
async function pdfTab(page: Page, phone: boolean, tab: string): Promise<Locator> {
  const win = await pdf(page);
  if (phone) await press(win, "Pages");
  await page.getByRole("tab", { name: tab }).locator("visible=true").first().click();
  await settle(page);
  return win;
}

/** The SuperDoc and Univer parts: focus inside them is theirs. */
const DOCS_VENDOR = ".superdoc, [id^='docs-toolbar-'], .ProseMirror";
const SHEETS_VENDOR = "[class*='univer']";

export const SCREENS: Screen[] = [
  { name: "docs", drawn: true, open: docs, vendor: DOCS_VENDOR },
  {
    name: "sheets",
    drawn: true,
    open: sheets,
    vendor: SHEETS_VENDOR,
    noAppStops: "the app bar holds only Save, disabled on an untouched workbook; Univer draws the rest",
  },
  { name: "slides", drawn: true, open: slides },
  {
    name: "slides-open",
    drawn: true,
    open: async (page, phone) => {
      const win = await slides(page);
      await press(win, phone ? "Insert" : "Show format panel");
      await settle(page);
      return win;
    },
  },
  { name: "pdf", drawn: true, open: pdf },
  {
    // The docked inspector: a maximized window passes 1100 px.
    name: "slides-maximized",
    drawn: true,
    only: "desktop",
    open: async (page) => {
      const win = await slides(page);
      await win.locator("button[title='Maximize']").first().click();
      await settle(page);
      await press(win, "Show format panel");
      await settle(page);
      return win;
    },
  },

  {
    name: "slides-notes",
    drawn: false,
    open: async (page) => {
      const win = await slides(page);
      await press(win, "Speaker notes");
      await settle(page);
      return win;
    },
  },
  {
    name: "slides-presenter",
    drawn: false,
    open: async (page) => {
      const win = await slides(page);
      await press(win, /^Present/);
      await settle(page, 1000);
      return win;
    },
  },
  { name: "pdf-empty", drawn: false, open: (page) => openFromStart(page, "PDF", "PDF") },
  {
    name: "pdf-annotate",
    drawn: false,
    open: async (page) => {
      const win = await pdf(page);
      await press(win, "Annotate");
      await settle(page);
      return win;
    },
  },
  { name: "pdf-outline", drawn: false, open: (page, phone) => pdfTab(page, phone, "Outline") },
  { name: "pdf-forms", drawn: false, open: (page, phone) => pdfTab(page, phone, "Forms") },
  {
    name: "pdf-signature",
    drawn: false,
    open: async (page) => {
      const win = await pdf(page);
      await press(win, "Sign");
      await expect(page.getByRole("dialog")).toBeVisible();
      await settle(page);
      return win;
    },
  },
  {
    name: "pdf-organize",
    drawn: false,
    open: async (page) => {
      const win = await pdf(page);
      await press(win, "Organize");
      await expect(win.locator("[data-slot='organize-view']")).toBeVisible();
      await settle(page, 1200);
      return win;
    },
  },
  {
    name: "docs-find",
    drawn: false,
    vendor: DOCS_VENDOR,
    open: async (page) => {
      const win = await docs(page);
      await settle(page, 1500);
      await page.keyboard.press("Control+f");
      await expect(
        win.getByRole("searchbox", { name: "Find in document" }).or(win.getByLabel("Find in document").first()),
      ).toBeVisible();
      return win;
    },
  },
  { name: "cad", drawn: false, open: cad },
  {
    name: "cad-layers",
    drawn: false,
    open: async (page) => {
      const win = await cad(page);
      await press(win, "Layers (LA)");
      await expect(page.getByRole("dialog")).toBeVisible();
      return win;
    },
  },
  { name: "todo", drawn: false, open: (page) => openFromStart(page, "Todo", "Todo") },
  { name: "bookmarks", drawn: false, open: (page) => openFromStart(page, "Bookmarks", "Bookmarks") },
  {
    name: "git",
    drawn: false,
    open: async (page) => {
      const win = await openFromStart(page, "Git", /Git/);
      await press(win, /^walk\/repo/);
      await settle(page, 1200);
      return win;
    },
  },
  {
    // The diff of the one changed file the container's walk repository holds.
    name: "git-diff",
    drawn: false,
    open: async (page) => {
      const win = await openFromStart(page, "Git", /Git/);
      await press(win, /^walk\/repo/);
      await settle(page, 1200);
      await win.getByText("f.txt", { exact: true }).first().click();
      await settle(page, 800);
      return win;
    },
  },
  { name: "rest", drawn: false, open: (page) => openFromStart(page, "REST Client", /REST/) },
  ...(
    [
      ["rest-auth", "Add an Authorization header"],
      ["rest-environments", "Edit environments"],
      ["rest-curl", "Import a curl command"],
    ] as const
  ).map(([name, button]): Screen => ({
    name,
    drawn: false,
    open: async (page) => {
      const win = await openFromStart(page, "REST Client", /REST/);
      await press(win, button);
      await expect(page.getByRole("dialog")).toBeVisible();
      return win;
    },
  })),
];

/** The screens a spec should run, narrowed by SCREENS=name,name when set. */
export function screens(filter: (s: Screen) => boolean = () => true): Screen[] {
  const only = process.env.SCREENS?.split(",");
  return SCREENS.filter((s) => (!only || only.includes(s.name)) && filter(s));
}
