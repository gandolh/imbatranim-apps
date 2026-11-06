---
summary: Current snapshot (2026-11-05), per app. All five apps built on main and walked in the OS; imbatranimOS retired its built-in Docs, Slides, Sheets and PDF apps on 2026-10-28 and pins this repo in its catalog. Since 2026-11-05 Save as opens in the file's folder (Slides, CAD) and the suite is a service whose server only CAD starts, on its first DWG; imbatranimOS's catalog pins `1b4394f` (moved 2026-11-05). Briefs 01-03 are done. Owner steps.
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
Viewer/norPDF (versions 1.57.0 to 1.59.0, pushed) and pinned this repo at
`909c321`. The pin moved to `aa626c2` on 2026-11-03 (the static suite, the
row-1000 fix, the kit on the two themes) and to `1b4394f` on 2026-11-05 (OS
commit `eb12677`: the service template, Save as in the file's folder, Sheets'
save waiting for the first calculation); neither is pushed yet. The OS also
starts a kit app's import when its window opens, its answer to PDF's 40 ms
first-page gap; the measurements are in its own corpus.

## Owed by the owner


- Push this repo's `main` before imbatranimOS's: the OS's Office catalog entry
  pins `1b4394f` of this repo (moved 2026-11-05, the service template) and
  clones it from GitHub at install.
- File the Univer report whose text is in brief 03's outcome, if wanted.
- After the OS is deployed, install Office from Settings → Marketplace on the
  live machine; the built-ins are gone, so until then it has no office editor.

## Open briefs

Written 2026-11-03 from the open todos, in a grill with the owner; all three
done 2026-11-05.

In the backlog since 2026-11-06, from imbatranimOS's research on
imbatranim-apps, grilled with the owner the same day:
- [Brief 06](../briefs/todo/06-pdf-decodes-jpeg2000-and-jbig2-images.md),
  promoted from the todo the same day: pdf.js's own decoders shipped, a
  PDF's scripts still off. It waits for imbatranimOS brief 67, and it
  carries the change to the "No WebAssembly" invariant.
- `cad-reads-dwg-in-the-tab` was dropped: DWG conversion stays on the
  suite's server.

This repo is also to be renamed imbatranim-apps (imbatranimOS's todo
`imbatranim-office-becomes-imbatranim-apps`), with Office as its first group.

No todo is open.

Test files for the walks: [test-files.md](test-files.md).
