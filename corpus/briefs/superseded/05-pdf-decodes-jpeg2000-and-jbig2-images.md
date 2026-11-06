> SUPERSEDED 2026-11-06, before any work: the owner keeps this in the backlog until its open questions are grilled, so it became the todo [pdf-decodes-jpeg2000-and-jbig2-images](../../todos/pdf-decodes-jpeg2000-and-jbig2-images.md), which holds the draft. Promoting that todo makes a new brief with a new number. Spec kept for the record.

# Brief 05 — PDF decodes JPEG2000 and JBIG2 images

## Context

PDF uses pdf.js (`pdfjs-dist` 6.4.299) as its only renderer.
[wiki/pdf.md](../../wiki/pdf.md) lists JPEG2000 and JBIG2 images as not
supported: pdf.js decodes them with WebAssembly, which the desktop's CSP
refused, so no `wasmUrl` is set and no wasm is shipped. Scanned PDFs often
use JBIG2, and some use JPEG2000, so those pages render with holes.

`pdfjs-dist/wasm/` holds:
- `openjpeg.wasm` and `jbig2.wasm`, for the two image types;
- `qcms_bg.wasm`, for colour management;
- `quickjs-eval.wasm`, for running a PDF's own JavaScript;
- `*_nowasm_fallback.js` files for the first two;
- each with its licence file.

imbatranimOS's brief 53 allows WASM in the desktop's page (approved by the
owner on 2026-11-06).

## Depends on

imbatranimOS brief 53, built and running in the OS the walk uses (a header
change, no kit sync needed). Brief 04 changes this
repo's invariant on WebAssembly. If 04 hasn't run, make that change here
instead.

## Owner decisions

Approved 2026-11-06: WASM engines from npm packages may run in the apps. The
smaller calls, with the default this brief builds:

1. **What ships.** Ship `openjpeg.wasm`, `jbig2.wasm` and `qcms_bg.wasm`
   with their licences. Never ship `quickjs-eval.wasm`: a PDF's own scripts
   stay off. Default: yes.
2. **The fallbacks.** Ship the `*_nowasm_fallback.js` files too, in case WASM
   fails to start. Default: no; the CSP allows WASM now, and the fallbacks
   only add weight.

## What to do

1. Copy the three wasm files and their licences into PDF's served output at
   build time, and pass pdf.js a `wasmUrl` pointing there. Check how this
   pdf.js version takes it, on `getDocument` or the worker. Keep JavaScript
   in PDFs disabled as it is today.
2. Tests: a JBIG2 and a JPEG2000 fixture render their image (pixel check on
   a known region). Add each to `corpus/wiki/test-files.md` with its source
   and licence.
3. Walk in the OS dev container with the fixtures and one real scanned PDF:
   the images render, and the console shows no CSP violation.
4. THIRD-PARTY-NOTICES.md lists the shipped decoders; `wiki/pdf.md` moves the
   two types from "not supported" to supported; status and log.

## Files you OWN

- `apps/pdf/` (its pdf.js setup), the build's copy step in
  `packages/shared/src/build/` if it needs one
- the two fixtures, `THIRD-PARTY-NOTICES.md`, `corpus/`

## Files you must NOT touch

- The other apps.
- pdf.js's version: the pin stays at 6.4.299.

## Acceptance

- Tests and lint green; both fixtures render their images; the walk holds.
- PDF's served output grows only by the three wasm files and their licences.
