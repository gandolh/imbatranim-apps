import { test } from "@playwright/test";
import { LOOKS, closeWindows, openDesktop, openFile, setLook, settle } from "./desktop.ts";

test.use({ deviceScaleFactor: 1 });
for (const look of (process.env.LOOKS ?? "light").split(",") as (keyof typeof LOOKS)[]) {
  test(`probe ${look}`, async ({ page, request }, info) => {
    await setLook(request, LOOKS[look]);
    await openDesktop(page);
    await closeWindows(page);
    for (const file of (process.env.FILES ?? "anim.pptx").split(",")) {
      await openFile(page, file);
      await settle(page, 2500);
      await page.screenshot({ path: `${process.env.SHOTS_DIR}/probe-${file}-${look}-${info.project.name}.png` });
      await closeWindows(page);
    }
  });
}
