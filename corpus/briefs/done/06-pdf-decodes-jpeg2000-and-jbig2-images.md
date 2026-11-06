# Brief 06 — PDF decodes JPEG2000 and JBIG2 images

## Context

PDF uses pdf.js (`pdfjs-dist` 6.4.299) as its only renderer.
[wiki/pdf.md](../../wiki/pdf.md) lists JPEG2000 and JBIG2 images as not
supported. pdf.js decodes them with WebAssembly, which the desktop's CSP
refused, so no `wasmUrl` is set and no wasm is shipped. Scanned PDFs often
use JBIG2, and some use JPEG2000, so those pages render with holes.

`pdfjs-dist/wasm/` holds:
- `openjpeg.wasm` and `jbig2.wasm`, for the two image types;
- `qcms_bg.wasm`, for colour management;
- `quickjs-eval.wasm`, for running a PDF's own JavaScript;
- `*_nowasm_fallback.js` files for the first two;
- each with its licence file.

imbatranimOS's brief 67 allows WebAssembly, with threads, in the desktop's
page. The owner settled it on 2026-11-06 in imbatranimOS's grill on
imbatranim-apps, and this is its first user. CAD's DWG stays on the server.
Promoted from the todo `pdf-decodes-jpeg2000-and-jbig2-images`.

## Depends on

imbatranimOS brief 67, built and running in the OS the walk uses. It changes
headers, not the kit, so no kit sync is needed.

## Owner decisions (settled 2026-11-06)

1. Ship `openjpeg.wasm`, `jbig2.wasm` and `qcms_bg.wasm` with their licences.
   Never ship `quickjs-eval.wasm`: a PDF's own scripts stay off.
2. Ship no JavaScript fallbacks: the OS allows WASM.
3. This repo's "No WebAssembly in the apps" invariant becomes "WASM only from
   an npm package, pinned by the lockfile, never compiled here or committed".
   The change goes in CLAUDE.md and `wiki/decisions.md`, dated, with the
   reason.

## What to do

1. Copy the three wasm files and their licences into PDF's served output at
   build time, and pass pdf.js a `wasmUrl` pointing there. Check how 6.4.299
   takes it: on `getDocument` or on the worker. JavaScript in PDFs stays off,
   as today.
2. Tests:
   - a JBIG2 fixture and a JPEG2000 fixture render their image (a pixel
     check on a known region);
   - the build output holds the three files and no `quickjs-eval.wasm`.

   Add each fixture to `corpus/wiki/test-files.md` with its source and
   licence.
3. Walk in the OS dev container with the fixtures and one real scanned PDF:
   the images render, with no CSP or COEP error in the console.
4. Update:
   - CLAUDE.md and `wiki/decisions.md` per decision 3;
   - THIRD-PARTY-NOTICES.md for the shipped decoders;
   - `wiki/pdf.md`, moving the two types from "not supported" to
     supported;
   - status and log.

## Files you OWN

- `apps/pdf/` (its pdf.js setup), the build's copy step in
  `packages/shared/src/build/` if it needs one
- the two fixtures, `THIRD-PARTY-NOTICES.md`, `CLAUDE.md` (the invariant
  line), `corpus/`

## Files you must NOT touch

- The other apps; pdf.js's version (the pin stays at 6.4.299).

## Acceptance

- Tests and lint green; both fixtures render; the walk holds.
- PDF's served output grows only by the three wasm files and their licences.

## Outcome (2026-11-06)

Built in 5ead116; the walk (step 3) is still to do, in the OS once its brief 67
is in.

- A Vite plugin (`packages/shared/src/build/pdfjsWasm.ts`) emits the three
  decoders and their licences under `pdfjs-wasm/` with fixed names, because
  pdf.js asks for `<wasmUrl>openjpeg.wasm`. `virtual:pdfjs-wasm-dir` is the
  directory URL, relative to the importing chunk. Tests and the dev server get
  a path. It is registered in every group's build and emits only when imported.
- pdf.js 6.4.299 takes `wasmUrl` on `getDocument`. The reader passes it, and
  sets it in the engine (`setPdfjsWasmUrl`, `browser/pdf-worker.ts`) for the
  engine's own parses. This touched `packages/pdfcore-engine`, outside the
  brief's file list, because the engine opens documents too.
- pdf.js in Node reads a directory path, not a `file:` URL.
- Fixtures: `jpeg2000.pdf` and `jbig2.pdf`, generated here (JBIG2 is a
  hand-written MMR generic region), sources in `wiki/test-files.md`. The tests
  are `packages/pdfcore-engine/src/__tests__/wasm-images.node.test.ts` (the
  engine's Node entry is lint-restricted in the app) and two checks in
  `osBuild.test.ts`: the nine files, byte-equal to the package's, and no
  `quickjs` or `nowasm` file.
- Without `wasmUrl` the JBIG2 image fails to decode, so the tests prove the
  wasm path is used.
- Size: +468,362 bytes in `dist/os`, all under `pdfjs-wasm/` (wasm 451,391,
  licences 16,971), plus one line of JavaScript.
- Left for the walk: the CSP and COEP console check, and one real scanned PDF.
