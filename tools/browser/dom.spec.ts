import { test } from "@playwright/test";
import { LOOKS, closeWindows, openDesktop, openFile, setLook, settle } from "./desktop.ts";

test("dom", async ({ page, request }) => {
  await setLook(request, LOOKS.dark);
  await openDesktop(page);
  await closeWindows(page);
  const docs = await openFile(page, "test.docx");
  await settle(page, 2500);
  const out = await docs.evaluate((w) => {
    const sd = w.querySelector(".superdoc");
    const chain: string[] = [];
    const el = w.querySelector<HTMLElement>("[class*=page]");
    for (let n = el; n && n !== w; n = n.parentElement) {
      const r = n.getBoundingClientRect();
      chain.push(`${n.tagName}.${String(n.className).slice(0, 60)} x=${Math.round(r.left)} w=${Math.round(r.width)}`);
    }
    return { sd: sd ? `${sd.className} w=${Math.round(sd.getBoundingClientRect().width)}` : null, chain };
  });
  console.log(JSON.stringify(out, null, 1));
  await closeWindows(page);
  await openFile(page, "calc-30k.xlsx");
  await settle(page, 2500);
  console.log(
    "html:",
    await page.evaluate(() => document.documentElement.className),
    "body:",
    await page.evaluate(() => document.body.className),
  );
  console.log(
    "dark nodes:",
    await page.evaluate(() =>
      [...document.querySelectorAll("[class*=univer-dark]")].map(
        (n) => n.tagName + "." + String(n.className).slice(0, 50),
      ),
    ),
  );
});
