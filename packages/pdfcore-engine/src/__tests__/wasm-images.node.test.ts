import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadPdf } from "../index.node.js";
import { setPdfjsWasmUrl } from "../browser/pdf-worker.js";

// Scanned PDFs use JBIG2 and sometimes JPEG2000; pdf.js decodes both with
// WebAssembly. These fixtures hold one image each, drawn over the whole page,
// so a pixel of the canvas is a pixel of the decoded image.
const fixture = (name: string) =>
  new Uint8Array(
    readFileSync(
      join(import.meta.dirname, "../../../../apps/pdf/fixtures", name),
    ),
  );

// pdf.js in Node reads the decoders from a directory path, as the browser
// reads a URL: the installed package's own `wasm/`.
const wasmDir =
  join(
    dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json")),
    "wasm",
  ) + "/";

/** Page 1 at 1 pixel per point; `at(x, y)` reads one pixel as [r, g, b]. */
async function render(name: string) {
  const doc = await loadPdf(fixture(name));
  const canvas = createCanvas(1, 1);
  await doc.render.page(1, canvas, { scale: 1 });
  const ctx = canvas.getContext("2d");
  return (x: number, y: number) =>
    Array.from(ctx.getImageData(x, y, 1, 1).data.slice(0, 3));
}

describe("images only WebAssembly decodes", () => {
  beforeEach(() => setPdfjsWasmUrl(wasmDir));
  afterEach(() => setPdfjsWasmUrl(undefined));

  it("draws a JPEG2000 image: a red square on a blue field", async () => {
    const at = await render("jpeg2000.pdf");
    // The image is 100 px square on a 200 pt page; its square spans 20..59.
    // Lossless coding, so the colours are exact (a little slack for scaling).
    const near = (px: number[], want: number[]) =>
      px.forEach((v, i) =>
        expect(Math.abs(v - want[i]!)).toBeLessThanOrEqual(8),
      );
    near(at(80, 80), [255, 0, 0]);
    near(at(160, 160), [0, 0, 255]);
    near(at(10, 190), [0, 0, 255]);
  });

  it("draws a JBIG2 image: a black square on a white field", async () => {
    const at = await render("jbig2.pdf");
    // 128 px on a 200 pt page; the square spans 32..95 of 128, so 50..149 pt.
    expect(at(100, 100)).toEqual([0, 0, 0]);
    expect(at(20, 20)).toEqual([255, 255, 255]);
    expect(at(180, 180)).toEqual([255, 255, 255]);
  });
});
