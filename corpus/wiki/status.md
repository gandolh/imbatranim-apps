---
summary: Current snapshot (2026-11-05), per app. All five apps built on main and walked in the OS; imbatranimOS retired its built-in Docs, Slides, Sheets and PDF apps on 2026-10-28 and pins this repo in its catalog. Since 2026-11-05 Save as opens in the file's folder (Slides, CAD) and the suite is a service whose server only CAD starts, on its first DWG; imbatranimOS's catalog pins `1b4394f` (moved 2026-11-05). Briefs 01-03 are done. Three more groups beside Office: Games (2026-11-06), Accessories, Todo and Bookmarks with their data in system.data files, and Developer, Git GUI and the REST API Client (both 2026-11-09). Owner steps. Since 2026-11-11 the repo is formatted at width 120 and gated by `npm run check` (the house-style harness).
updated: 2026-11-11
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

## The other groups

- **Games** (2026-11-06, `647580f`): Minesweeper and Solitaire, from the OS's
  built-ins (imbatranimOS brief 64); one root workspace folder, `games/`.
- **Accessories** (2026-11-09, `1a04603`, `ebc2be6`): Todo and Bookmarks,
  from the OS's built-ins (imbatranimOS brief 75). Their data is JSON files in
  each app's own folder through `system.data`, which the OS moved once from
  its database; `packages/shared/src/dataStore.ts` (moved there 2026-11-09
  for Developer) is the store the window and the hooks share. Todo exports
  `Background`, Bookmarks `commandSources`. Not pushed; the walk in the OS
  is owed.
- **Developer** (2026-11-09, `4ef5f5a`): Git GUI and the REST API Client,
  from the OS's built-ins (imbatranimOS brief 76). Git and the request proxy
  stay the OS's services. Git GUI's recent repositories are `recents.json`
  in its state folder, and each is also one of its OS recents (a folder),
  which is what reopens it in a new window; the REST client's collections
  were already in its data folder. Not pushed; the walk in the OS is owed.

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
- [Brief 06](../briefs/done/06-pdf-decodes-jpeg2000-and-jbig2-images.md),
  built 2026-11-06: PDF ships pdf.js's JPEG2000, JBIG2 and colour decoders
  (a PDF's scripts still off) and the invariant now reads "WebAssembly only
  from an npm package". Tests pass in Node; the walk in the OS needs
  imbatranimOS brief 67 running.
- `cad-reads-dwg-in-the-tab` was dropped: DWG conversion stays on the
  suite's server.

This repo was renamed imbatranim-apps on 2026-11-06 (imbatranimOS brief 63),
with Office as its first group; words only. Left to the owner: rename the
GitHub repository, then point `origin` at it.

Brief 07 (2026-11-10, `40450da`): the kit snapshot at imbatranimOS `dcdb648`, Base UI 1.9.0 pinned; no kit source change; the desktop walk is not done.

Brief 08 (2026-11-11): the house-style harness. Formatted at width 120 (`8fbe7dd`), `vendor/house-style/` 1.0.0, typed lint, `npm run check` and `check:fast`, `.claude/rules/` and a root `CLAUDE.md`. `check-structure` runs `--warn-only` until brief 10; `check-base-ui` is already strict (no finding).

No todo is open.

Test files for the walks: [test-files.md](test-files.md).
