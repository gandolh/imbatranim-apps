---
summary: Current snapshot (2026-11-05), per app. All five apps built on main and walked in the OS; imbatranimOS retired its built-in Docs, Slides, Sheets and PDF apps on 2026-10-28 and pins this repo in its catalog. Since 2026-11-05 Save as opens in the file's folder (Slides, CAD) and the suite is a service whose server only CAD starts, on its first DWG; the catalog entry still pins the static suite until it moves. Briefs 01-03 are done. Owner steps.
updated: 2026-11-05
---

# Status — 2026-11-05

**Phase: built, walked, and replacing the built-ins.** `main` holds all five
apps; `npm run build:os` builds them into `dist/os`, and
`os/descriptor.template.json` lists them. Pushed through `08ae15a`
(2026-11-01). Briefs 01-03 (written 2026-11-03) were built on 2026-11-05 and
are not pushed; brief numbering restarted at 01 on 2026-11-02 (see
[log.md](../log.md)).

## By app

- **Scaffold and build** (2026-10-21). npm workspaces, one Vite library build
  per app, the shared kit external, run unchanged in the OS's install
  container ([architecture.md](architecture.md)).
- **Docs** (2026-10-22, find-as-you-type 2026-10-28). Several windows each
  type their own file; a caret shows in unfocused windows, lived with
  ([docs-app.md](docs-app.md)).
- **CAD** (2026-10-22, DWG 2026-10-28). DXF read and write, our own Canvas 2D
  renderer; TRIM and EXTEND take the short stub at a corner; `.dwg` opens
  through the suite's server; Save on it offers the `.dxf` in its folder, and
  Save as opens in the drawing's folder (2026-11-05) ([cad.md](cad.md)).
- **Slides** (2026-10-22, walked 2026-10-27). Edits patch the package in
  place; untouched parts stay byte identical ([slides.md](slides.md)).
- **Sheets** (2026-10-22, walked 2026-10-27). Formulas in a worker and sheets
  sized past row 1000 (both 2026-10-28); a save waits for the first
  calculation (2026-11-05) ([sheets-app.md](sheets-app.md)).
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

- imbatranimOS's `marketplace/imbatranim-office.json` must become this
  repo's `os/descriptor.template.json` (a `service` since 2026-11-05) with
  the pin moved to this repo's head, or the OS keeps installing the static
  suite with DWG off.

- Push this repo's `main` before imbatranimOS's: the OS's Office catalog entry
  pins a commit of this repo and clones it from GitHub at install.
- File the Univer report whose text is in brief 03's outcome, if wanted.
- After the OS is deployed, install Office from Settings → Marketplace on the
  live machine; the built-ins are gone, so until then it has no office editor.

## Open briefs

Written 2026-11-03 from the open todos, in a grill with the owner; all three
done 2026-11-05, and no brief is open.

- 01, Save as opens where the file is: **done 2026-11-05**. Slides' and
  CAD's Save as open in the file's folder; Docs, Sheets and PDF have no Save
  as ([outcome](../briefs/done/01-save-as-opens-where-the-file-is.md)).
- 02, CAD asks for its server on its first DWG: **done 2026-11-05**. The
  suite is a `service` again; only CAD starts the server, on a window's first
  DWG, and DWG opening is back
  ([outcome](../briefs/done/02-cad-asks-for-its-server-on-its-first-dwg.md)).
- 03, a save during Sheets' first calculation writes whole values: **done
  2026-11-05**. The save waits for the first calculation and says so, the
  formula bar's progress has words, and no Univer setting spaces the
  results; the upstream report's text is in the
  [outcome](../briefs/done/03-sheets-first-calculation-saves-whole.md) for
  the owner to file.

No todo is open.

Test files for the walks: [test-files.md](test-files.md).
