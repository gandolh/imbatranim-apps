---
summary: Current snapshot (2026-11-02), per app. All five apps built on main and walked in the OS; imbatranimOS retired its built-in Docs, Slides, Sheets and PDF apps on 2026-10-28; on 2026-11-03 its catalog moved its pin to this repo's head (the kit synced to the OS's two themes, the row-1000 fix) and the suite ships static, so CAD opens DXF only. The owner decides what to do about Sheets' big first calculation. Open todos and owner steps.
updated: 2026-11-03
---

# Status — 2026-11-02

**Phase: built, walked, and replacing the built-ins.** `main` holds all five
apps; `npm run build:os` builds them into `dist/os`, and
`os/descriptor.template.json` lists them. Pushed through `08ae15a`
(2026-11-01). No brief is open; brief numbering restarted at 01 on
2026-11-02 (see [log.md](../log.md)).

## By app

- **Scaffold and build** (2026-10-21). npm workspaces, one Vite library build
  per app, the shared kit external, run unchanged in the OS's install
  container ([architecture.md](architecture.md)).
- **Docs** (2026-10-22, find-as-you-type 2026-10-28). Several windows each
  type their own file; a caret shows in unfocused windows, lived with
  ([docs-app.md](docs-app.md)).
- **CAD** (2026-10-22, DWG 2026-10-28). DXF read and write, our own Canvas 2D
  renderer; TRIM and EXTEND take the short stub at a corner; `.dwg` opens
  through the suite's server and saves as `.dxf` beside it ([cad.md](cad.md)).
- **Slides** (2026-10-22, walked 2026-10-27). Edits patch the package in
  place; untouched parts stay byte identical ([slides.md](slides.md)).
- **Sheets** (2026-10-22, walked 2026-10-27). Formulas in a worker and sheets
  sized past row 1000 (both 2026-10-28) ([sheets-app.md](sheets-app.md)).
- **PDF** (2026-10-22, walked 2026-10-28). PDF Viewer and norPDF in one app;
  first page 574 ms against PDF Viewer's 534 in the OS ([pdf.md](pdf.md)).

## In imbatranimOS

On 2026-10-28 the OS retired its built-in Docs, Slides, Sheets and PDF
Viewer/norPDF (versions 1.57.0 to 1.59.0, pushed) and pins this
repo at `909c321`. That pin has the walk fixes, find-as-you-type, the trim fix
and the formula worker, but **not** the row-1000 fix (`028f5ca`) or DWG
(`4810095`); an OS todo moves the pin. The OS also starts a kit app's import
when its window opens now, its answer to PDF's 40 ms first-page gap; the
measurements are in its own corpus.

## Owed by the owner

- **Sheets' big first calculation**
  ([todo](../todos/2026-10-28-sheets-big-first-calculation.md)): the
  220,000-formula workbook computes for about five minutes in the worker, and
  the main thread freezes 1–4 s in bursts while results land. A save during it
  writes no cached values. Accept it, try Univer's knobs and make a save wait
  for the first calculation, or report it upstream.
- Push this repo's `main` before imbatranimOS's: the OS's Office catalog entry
  pins a commit of this repo and clones it from GitHub at install.
- After the OS is deployed, install Office from Settings → Marketplace on the
  live machine; the built-ins are gone, so until then it has no office editor.

## Open todos

- [Sheets' big first calculation](../todos/2026-10-28-sheets-big-first-calculation.md) (the owner decides)
- [Every Office window waits on the suite server](../todos/2026-10-28-os-suite-server-for-every-window.md) (an OS change, or the owner keeps the cost)
- [The OS save dialog cannot start in a folder](../todos/2026-10-28-os-save-dialog-start-folder.md) (an OS change)

Test files for the walks: [test-files.md](test-files.md).
