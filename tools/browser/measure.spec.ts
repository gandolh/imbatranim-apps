import { expect, test, type Locator } from "@playwright/test";
import { LOOKS, closeWindows, expectLook, openDesktop, openFile, setLook, settle } from "./desktop.ts";
import { report } from "./report.ts";
import { SCREENS } from "./screens.ts";

/**
 * The controller's ruling 8 sizes at 1280 (the 958 px window), 1024, 768, 390
 * and 360: the slide idle and with the format panel open, the PDF page and
 * its readout, Docs' page and its readout, and the thumbnails. Read with
 * REPORT_DIR set; it asserts only that each part is on screen. One window is
 * open at a time, so the parts are found on the page.
 */
test.use({ deviceScaleFactor: 1 });

const size = (el: Locator) =>
  el.evaluate(
    (e) => {
      const r = e.getBoundingClientRect();
      return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10];
    },
    undefined,
    { timeout: 10_000 },
  );

/** The largest 16:9 box inside a thumbnail button: the slide's picture. */
const thumb = (el: Locator) =>
  el.evaluate(
    (b) => {
      let best = b.getBoundingClientRect();
      for (const c of b.querySelectorAll("*")) {
        const r = c.getBoundingClientRect();
        if (
          r.height > 0 &&
          Math.abs(r.width / r.height - 16 / 9) < 0.08 &&
          r.width * r.height <= best.width * best.height
        ) {
          best = r;
          break;
        }
      }
      return [Math.round(best.width * 10) / 10, Math.round(best.height * 10) / 10];
    },
    undefined,
    { timeout: 10_000 },
  );

test("ruling 8's sizes", async ({ page, request }, info) => {
  const width = info.project.use.viewport?.width ?? 0;
  const phone = width < 600;
  await setLook(request, LOOKS.light);
  await openDesktop(page);
  await expectLook(page, LOOKS.light);
  await closeWindows(page);
  const row: Record<string, unknown> = { width };

  const slides = await openFile(page, "anim.pptx");
  await settle(page, 1200);
  row.slidesWindow = await size(slides);
  row.slideIdle = await size(page.locator("[aria-label='Slide editor']"));
  row.slidesReadout = (
    await page.getByRole("toolbar", { name: "Slide and view" }).innerText({ timeout: 10_000 })
  ).replace(/\s+/g, " ");
  row.slideThumb = await thumb(page.getByRole("option", { name: "Slide 1", exact: true }).first());
  await closeWindows(page);
  const open = await SCREENS.find((s) => s.name === "slides-open")?.open(page, phone);
  if (open) {
    row.slideOpen = await size(page.locator("[aria-label='Slide editor']"));
    await page.keyboard.press("Escape");
  }
  await closeWindows(page);

  const pdf = await openFile(page, "fontconfig-user.pdf");
  await settle(page, 1500);
  row.pdfWindow = await size(pdf);
  row.pdfPage = await size(page.locator("[data-page='1']").first());
  row.pdfReadout = (await page.locator("[aria-live='polite']").first().innerText({ timeout: 10_000 })).trim();
  row.pdfThumb = phone ? null : await size(page.getByRole("button", { name: "Page 1", exact: true }).first());
  await closeWindows(page);

  const docs = await openFile(page, "test.docx");
  await settle(page, 2500);
  row.docsWindow = await size(docs);
  row.docsPage = await size(page.locator(".superdoc__layers").first());
  row.docsReadout = (await page.getByRole("status").last().innerText({ timeout: 10_000 })).replace(/\s+/g, " ");
  await closeWindows(page);

  report("measure", row);
  console.log(JSON.stringify(row));
  expect(row.slideIdle).toBeTruthy();
});
