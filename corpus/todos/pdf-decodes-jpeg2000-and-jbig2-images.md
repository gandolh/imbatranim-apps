---
title: PDF decodes JPEG2000 and JBIG2 images
created: 2026-11-06
status: open
tags: [imbatranim-apps]
---

# PDF decodes JPEG2000 and JBIG2 images

PDF ships pdf.js's own JPEG2000 and JBIG2 decoders, so scanned PDFs render their images instead of holes. Needs the desktop to allow WebAssembly first.

Drafted as a brief on 2026-11-06 and kept in the backlog: grill the open
questions below when the work starts, then promote this to a numbered brief.

## Open questions (grill before starting)

Settled: the owner approved the imbatranim-apps plan on 2026-11-06 ("looks good, write the briefs"); WASM engines from npm packages may run in the apps (imbatranimOS's research on imbatranim-apps).

1. **What ships: `openjpeg.wasm`, `jbig2.wasm` and `qcms_bg.wasm` with their licences, and never `quickjs-eval.wasm`, so a PDF's own scripts stay off?** Answered 2026-11-06: yes.
2. **Do the `*_nowasm_fallback.js` files ship too, in case WASM fails to start?** Answered 2026-11-06: no fallbacks.

## Draft brief

### Context

PDF uses pdf.js (`pdfjs-dist` 6.4.299) as its only renderer.
[wiki/pdf.md](../wiki/pdf.md) lists JPEG2000 and JBIG2 images as not
supported: pdf.js decodes them with WebAssembly, which the desktop's CSP
refused, so no `wasmUrl` is set and no wasm is shipped. Scanned PDFs often
use JBIG2, and some use JPEG2000, so those pages render with holes.

`pdfjs-dist/wasm/` holds:
- `openjpeg.wasm` and `jbig2.wasm`, for the two image types;
- `qcms_bg.wasm`, for colour management;
- `quickjs-eval.wasm`, for running a PDF's own JavaScript;
- `*_nowasm_fallback.js` files for the first two;
- each with its licence file.

imbatranimOS's todo `kit-apps-may-run-webassembly` allows WASM in the desktop's page (approved by the
owner on 2026-11-06).

### Depends on

imbatranimOS's todo `corpus/todos/kit-apps-may-run-webassembly.md`, built and running in the OS the walk uses (a header
change, no kit sync needed). This todo also changes the repo's "No WebAssembly in the apps" invariant to
"WASM only from an npm package, pinned by the lockfile, never compiled here or
committed" (CLAUDE.md and `wiki/decisions.md`), since the DWG todo that was to
do it was dropped.

### What to do

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

### Files you OWN

- `apps/pdf/` (its pdf.js setup), the build's copy step in
  `packages/shared/src/build/` if it needs one
- the two fixtures, `THIRD-PARTY-NOTICES.md`, `corpus/`

### Files you must NOT touch

- The other apps.
- pdf.js's version: the pin stays at 6.4.299.

### Acceptance

- Tests and lint green; both fixtures render their images; the walk holds.
- PDF's served output grows only by the three wasm files and their licences.
