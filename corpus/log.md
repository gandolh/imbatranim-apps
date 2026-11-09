# Log

## [2026-10-21] decision | The repo starts: the office apps leave imbatranimOS

The owner created the repo after a grilling held in the imbatranimOS corpus (its `corpus/wiki/decisions-office-suite.md`). The ArtCraft crafts were not brought into the OS as sandboxed canvases (OS brief 161, superseded). Instead the OS's office apps move here: Docs, Sheets, Slides, PDF (PDF Viewer and norPDF merged) and a new CAD app, in TypeScript with editing in the browser, installed by one suite descriptor in the OS repo, and rendered with the desktop's own React and kit. The crafts stay as the behaviour reference. The calls, from this side, are in [decisions.md](wiki/decisions.md); the vocabulary in [glossary.md](wiki/glossary.md). The owner picked the name after openBureau turned out to be taken.

## [2026-10-21] todo | Corpus bootstrapped; briefs 01–06 filed

The corpus follows the imbatranimOS one (same lint, same rules) with this repo's invariants in [CLAUDE.md](CLAUDE.md): AGPL-3.0, TypeScript only, no WebAssembly in the apps, the shared kit, the crafts as reference, no hosted CI. [craft-reference.md](wiki/craft-reference.md) maps each app to its craft and names the parity documents to read. Six briefs: 01 the scaffold, the kit snapshot, the externals and a smoke app; 02 Docs moved with a parity checklist; 03 CAD, spike-gated, with a library shortlist (DXF read via dxf-parser or dxf-viewer's parser, write via @tarikjabiri/dxf, geometry via @flatten-js/core and clipper2-ts, rbush, our own Canvas 2D renderer) and DWG out of scope because every browser reader needs wasm; 04 Slides editing, spike-gated on saving by patching the package in place (pptxtojson as a reading aid, PptxGenJS for new decks, PPTist as a UX reference); 05 Sheets moved; 06 one PDF app whose first page must be as fast as PDF Viewer's. The OS side is imbatranimOS briefs 162, 163 and 164.

## [2026-10-21] build | Brief 01 done: the scaffold, the OS build and a smoke app

npm workspaces, exact pins, and `npm run build:os`: one Vite library build with an entry per app, shared chunks and workers as files, run as is in the OS's install container (`2c57c37`). React, React DOM and `@imbatranim/ui` become reads from the global the desktop lends; app CSS is Tailwind utilities only against the kit snapshot's tokens. The snapshot was provisional until imbatranimOS brief 163 landed, then pinned to OS `4e233b9` with `kit:sync` (`92fb703`), which also added the descriptor template and its in-step test. The smoke app opened in three windows in the OS dev container, followed the accent and read its file in a worker; in the production image, under the real CSP, the Marketplace pane installed the suite in 28 s with no violation. The stylesheet rules moved to their own page, [stylesheets.md](wiki/stylesheets.md), when architecture.md passed its line cap. Brief 01 carries the outcome.

## [2026-10-22] pause | Resume point for the office-suite run

Paused by the owner mid-run. The owner's calls for the run (2026-10-21): retire each built-in (OS brief 164) on the agent's own parity pass, one commit per app; the agent sources the test files; commit freely, never push. Push order owed by the owner: imbatranim-office, then imbatranimOS, deploy, then install Office from the Marketplace pane.

**Done.** OS briefs 162 (`9394ea6`) and 163 (`5f3f5aa`), each with a corpus commit, version 1.24.0. Office brief 01 (closed out), and on `main` (`141e5aa`) the code for 02 Docs, 03 CAD, 04 Slides, 05 Sheets and 06 PDF, with all five apps in `os/descriptor.template.json`. Docs' parity walk passed 12 lines, Save as is n/a, and "three windows" fails, in the built-in too: SuperDoc 1.45's window-level input bridge steals keystrokes between instances. CAD's in-OS walk passed every acceptance line under the production CSP.

**In flight when paused** (working copies, nothing committed): the SuperDoc multi-window fix (worktree `wt-docsfix`); the in-OS walks of Slides, Sheets and PDF, each in its own production-image container (`walk-slides` 8092, `walk-sheets` 8093, `walk-pdf` 8094, image `imbatranimos:walk-4e233b9`) with fixes in worktrees `wt-walk-<app>`. Worktrees and test files are under the session scratchpad (`/tmp/claude-1000/…/scratchpad/`: `wt/`, `fixtures/MANIFEST.md`, `progress/` walk plans and descriptor entries).

**Next, in order.** Merge the docs fix and any walk fixes into `main`. Close out briefs 02–06 (decision entries for CAD's engine and Slides' save strategy are drafted in `progress/cad-decision.md` and `progress/slides-decision.md`). Then OS brief 164 per app, one commit each: Docs first, which also commits `marketplace/imbatranim-office.json` (the template pinned to the tested office commit); then Slides, Sheets, and the PDF pair. Known for 164: the duplicate "Docs"/"Sheets" labels until each built-in goes; an OS todo to file: activating a window from the taskbar leaves focus on the taskbar button.

## [2026-10-22] build | Briefs 02–06 built; the rest split into four small briefs

All five apps are on `main` and in the descriptor template. **Docs** (02) walked its parity checklist in the OS; "three windows" failed in the built-in too, because SuperDoc's window-level input bridge takes keystrokes from every other instance, and `1ca83c0` fixes it in the suite by marking each instance's active editor surface. **CAD** (03) passed its spike (Canvas 2D at 60 fps on 10,053 lines, so no WebGL) and its in-OS walk: a 10×8 room drawn with typed coordinates, saved and read back by ezdxf and LibreCAD. **Slides** (04) passed its spike: a save patches the package in place, and on three real decks every untouched part came back byte identical. **Sheets** (05) needed two declared allowances for Univer's stylesheet. **PDF** (06) draws its first page in a median 237 ms against PDF Viewer's 492 ms, outside the OS. The calls for CAD's engine and Slides' save strategy are in [decisions.md](wiki/decisions.md).

The in-OS walks of Slides, Sheets and PDF were cut off by a session limit, and a restart wiped the session scratch (test files, walk notes). The owner paused the run to continue brief by brief. Those walks are now 07, 08 and 09; 10 is a bug the Docs walk found in the built-in too. [test-files.md](wiki/test-files.md) records where every test file came from, so they can be fetched again. The resume point above is superseded by this entry.

## [2026-10-23] todo | Briefs 11 and 12 from the two walk todos

11: TRIM and EXTEND rank every
candidate in the pick box and prefer the one whose nearer end is closer to the pick,
so a 0.2-unit stub at a corner wins over the wall; today `pick` keeps only the nearest
and the filter runs after. 12:
one blinking caret with several Docs windows; reading SuperDoc 1.46.3 for an option is
step one, and if there is none it stops and reports. It runs after 10, which owns
`apps/docs/**`.

## [2026-10-27] build | Brief 07 done: Slides walked in the OS

Brief 07 walked Slides in imbatranimOS
`74dfe27`'s production image, with the built-in beside it. Every line passes:
viewer parity, opening from Files, Open With, the Open button and Recent, the
`.ppt` refusal, the full edit round on the three test decks, LibreOffice
conversions with every untouched zip entry byte identical, the conflict
dialog's three answers, Save as, the close guard, New presentation, three
windows, and no CSP violation. The walk found one defect: the notes box dropped
the first key typed after a pause. It is fixed in `8f5b2f6` and was re-walked.
The image was a local build run in a container of its own (port 8092, a
throwaway volume), not the dev profile. The OS can run its brief 165.

## [2026-10-27] build | Brief 08 walked: seven lines pass, a formula-heavy workbook freezes the window; stays in todo

Brief 08 walked Sheets in imbatranimOS
`74dfe27`'s production image, with the built-in beside it. It found two
defects, both in the built-in too, and fixed them in the suite. `e57a4ea`: an
`.xls` opened as an empty grid that a save would write over (ExcelJS loads it
as a workbook with no sheets); the suite now refuses it by name, and refuses
an OLE2 or non-zip file named `.xlsx` from its first bytes. `a4b6134`: every
`.xlsx` save failed ("Value at index 0 does not have a transferable type"),
because the worker put ExcelJS's Buffer in its transfer list; it now hands
back an ArrayBuffer. The built-in Sheets in this image cannot save an
`.xlsx` at all.

After the fixes, seven lines pass. Opening from Files, Open With, the Open
button and Recent works, attributed to `office-sheets`. Fidelity holds:
openpyxl reads back values, formulas, number formats, bold, italic, colours,
fills and both sheets of `fidelity.xlsx` and `styles.xlsx`; the built-in's
round trip could not be compared, since it cannot save. The chart and merge
warnings name the same features as the built-in's. CSV keeps quoted fields,
CRLF, leading zeros and 20-digit numbers as text, drops the BOM, and warns
before a multi-sheet save (both answers walked). The conflict dialog's
three answers, the close guard's three answers and three windows saving
their own files all pass; Save as is n/a, since neither app has one, as in
Docs' brief 02. Univer's styles stay in the window: twelve desktop elements
kept every computed property apart from stacking. New Spreadsheet in Files
opened, saved and read back.

**Fails: the 10 MB line.** The parse runs in `workers/xlsxWorker-*.mjs` and a
values-only 10.2 MB workbook opens with one 323 ms task. A 10.6 MB workbook
with 220,000 row-local formulas blocks the main thread for 5.6 s after the
grid appears (the built-in 4.4 s), and 4.1 s with LibreOffice's cached values.
Univer's formula engine runs on the main thread. Moving it into a worker
(`UniverSheetsCorePreset({ workerURL })`) is a new brief, not a walk fix; the
owner decides whether the freeze, which the built-in shares, holds back OS
brief 166.

Also seen: a running-total formula on every row (`=SUM(C$2:Cn)`) hung the tab
for minutes in the suite. `[redi]` "loaded more than once" console errors
appeared in pages where the built-in Sheets had also loaded; a freshly loaded
page with two suite windows logged nothing. The lossy warning reads "lose
it" for "charts", in both apps. test-files.md names `47813-real-chart.xlsx`,
which POI does not have; the walk used `47813.xlsx` and `WithChart.xlsx`.

## [2026-10-28] build | Brief 09 walked: nine lines pass, the timing gate fails; stays in todo

Brief 09 walked PDF in imbatranimOS
`74dfe27`'s production image beside PDF Viewer and norPDF. **The timing gate
fails.** From the Open With click to ink on the 36-page NIST file, a fresh
browser per run, 7 runs each, alternating: PDF Viewer 513, 518, 521, 534, 534,
542, 720 ms (median 534); the suite 550, 567, 571, 574, 606, 607, 608 (median
574). Before `8880663` the medians were 518 and 571. That fix starts pdf.js and
its worker while the file downloads, as `warmUpPdfjs` intended; nothing called
it before. The rest of the gap comes before the download: the suite's `app.mjs`
and ten shared chunks load from the marketplace route after the window mounts
(about 70 ms, past Chrome's six connections), while PDF Viewer's chunk loads
when the window opens. Closing it is an OS change (start a kit app's import
when its window opens) or a build change (fewer first-path chunks), neither in
this brief's files. The numbers are in [pdf.md](wiki/pdf.md).

The other nine lines pass. Zoom steps by 25% as PDF Viewer's; paging and the
keyboard work (PDF Viewer has no keys). Outline, thumbnails and search (31
matches, previous and next wrap) work; Enter in the search box restarts at the
first match, as in norPDF. All nine annotate tools saved, showed after a
reopen, and a second save added only the new one. Organise reordered, rotated,
deleted, inserted a blank page and extracted two pages (pypdf agrees). A drawn
stamp and a typed signature in the field saved and render in poppler.
`Ctrl+S` on an untouched file left its checksum and mtime alone. Files, Open
With, recents (`office-pdf`), the dirty mark, the conflict dialog's three
answers, the close guard's three answers and three windows saving their own
files all pass. The Open button uses the OS's dialog. The worker loads as
`workers/pdf.worker-*.mjs`, and no CSP violation or console error came up.

**Fixed.** `184a761`: the W-9's one-letter field took "Walk LLC" and Save failed
("Attempted to set text with length=8 for TextField with maxLength=1"). Fields
now report their `/MaxLen`, `Forms.set` refuses longer values and the input
stops at the limit. The re-walk saved the W-9 with both prefilled fields intact.

Briefs 10 and 11 were not started: the owner paused the run on 2026-10-28.

## [2026-10-28] decision | Briefs 08 and 09's failures don't hold back OS 166 and 167

The owner answered both walks' questions. The formula freeze (a 10 MB workbook
with 220,000 formulas, which the built-in shares) and PDF's first page 40 ms
behind PDF Viewer do not hold back retiring the built-ins: OS 166 and 167 can
run. Each fix is its own brief: here, Univer's formula engine in a worker; in
imbatranimOS, the OS starting a kit app's import when its window opens, which
helps every kit app. Briefs 08 and 09 move to done at the next run.

## [2026-10-28] decision | CAD opens DWG through a suite server

The owner works with DWG files and wants CAD to open them. No browser reader
exists without WebAssembly, which the desktop's CSP forbids, so a suite server
converts DWG to DXF with LibreDWG. It is the suite's first server, which also
answers the "first server" question. The brief starts with how LibreDWG can run
under the TypeScript-only, no-compiler invariants; to be written.

## [2026-10-28] todo | Brief 14: CAD opens DWG through the suite's first server

Brief 14 starts with
a spike: LibreDWG compiled to WebAssembly from npm, run in Node on a new
`server/` workspace, which needs no compiler and keeps wasm out of the browser.
If that fails it stops for the owner rather than change the OS image. CAD then
opens a `.dwg` as DXF and never saves over it: Save becomes Save as `.dxf`.

## [2026-10-28] build | Briefs 08 and 09 closed: moved to done, the owner's answers recorded

Brief 08 and
brief 09 move to `done/` with an
outcome note each. Their walks stand as logged on 2026-10-27 and 2026-10-28.
The owner cleared both: Sheets' formula freeze became
brief 13, and PDF's 40 ms
first-page gap became imbatranimOS brief 182. The OS can run briefs 166 and
167. A brief run starts on 10, 11, 12, 13 and 14, one at a time.

## [2026-10-28] build | Brief 10 done: a word typed into Docs' find box stays there

Brief 10: SuperDoc's
`goToSearchResult` focuses the editor before selecting a match, so every key
after the first went into the document. `d5f0631` hands focus back in the
same task and marks the find bar `data-editor-ui-surface`, without which
SuperDoc's overlay stops painting the selected match once the box has focus.
Walked in imbatranimOS `31a248c`'s production image (Docker Desktop came back
mid-run): "hello" typed key by key stayed in the box, 31 matches, Enter and
Shift+Enter stepped and wrapped with focus kept, the document text unchanged
and not dirty, no CSP violation or console error. The marker extends brief
12's symptom: a focused find bar keeps every Docs window's caret painted.

## [2026-10-28] build | Brief 11 done: TRIM picks the short stub at a corner

Brief 11: `2c1d254`. The
`entity` prompt now weighs every object in the pick box. It passes over what
its filter refuses, so a pick beside a point takes the curve, and an optional
`prefer` breaks near-ties (1.5 px). TRIM and EXTEND prefer the nearer end, so
the eight stubs of the offset room trim from a pick 2 px from the corner with
the wall nearer, at 30, 50 and 65 px per unit. A pick in a wall's middle
still trims the wall. Limit: a pick on a stub's outer side at 30 px per unit
ties with the parallel wall's end, and the nearest wins. The first PDF test
timed out at 5 s twice in full runs on a loaded machine and passed alone.

## [2026-10-28] build | Brief 12 done by its step 3: SuperDoc has no caret option

Brief 12: in
SuperDoc 1.46.3, `PresentationEditor#updateSelection` keeps the body caret
whenever the page's focused element is inside any `[data-editor-ui-surface]`.
`#updateHeaderFooterSelection` paints the header and footer caret with no
focus test at all. No option, method or exported registry controls either;
`setDocumentMode('viewing')` clears the layer only as part of a read-only
mode switch. Nothing in `apps/docs` changed, and the choice (CSS rule,
upstream issue, or live with it) goes to the owner. Three windows walked in
imbatranimOS `31a248c`'s production image: body typing, header typing and
brief 10's find box all went to the focused window. Only the focused window
painted a body caret, but every window with a header session open painted
its caret.

## [2026-10-28] build | Brief 13 built: Sheets' formulas in a worker; one line fails narrowly, stays in todo

Brief 13: `f4b26e3`
starts `formulaWorker.ts` as a module worker and hands it to
`UniverSheetsCorePreset({ workerURL })`. The worker runs
`UniverSheetsCoreWorkerPreset`, and a save waits for
`onCalculationResultApplied`. In imbatranimOS `31a248c`'s production image,
the 220,000-formula workbook's 6.8 s freeze after the grid is gone. One
210–285 ms task is left (8 runs): Univer's main-thread scan for formulas
without a value. The values workbook stays under 130 ms. Formulas recompute
after an edit, a save 100 ms after an edit wrote the new values, opening
does not dirty, and no CSP violation or console error came up. A scratch
build with `CalculationMode.FORCED` had no task over 63 ms, at the price of
the file's cached values; the owner decides. Found on the way: formulas past
row 1000 compute `#NAME?` (no `rowCount` in the xlsx mapping), before this
brief too (todo).
The owner paused the run here; brief 14 was not started.

## [2026-10-28] decision | Brief 13 accepted and closed, Docs' caret lived with, the row-1000 bug becomes brief 15

The owner answered the two questions left by briefs 12 and 13. The 210–285 ms
main-thread task after the grid that Univer's formula scan leaves in
brief 13 is accepted; the
brief moves to done, with no switch to `CalculationMode.FORCED` and no upstream
report. Docs' caret in several windows (brief 12: SuperDoc has no option) is
lived with; the todo closes
as a known gap for header and footer editing. The row-1000 bug becomes
brief 15: the xlsx and CSV
mappings set `rowCount` from the data, and brief 13's 220,000-formula workbook
is re-measured in the OS once its formulas compute. Brief 13's numbers were
taken while about 95% of them errored; a freeze over 1 s at low load becomes a
todo for the owner, and brief 13 stays closed. The run goes on with 15, then 14.

## [2026-10-28] build | Brief 15 done: formulas past row 1000 compute; the big workbook's first real calculation is a todo

Brief 15: `028f5ca` sizes
each sheet to its data and to every cell a formula points at (Univer's 1,000
× 20 as the floor, Excel's grid as the ceiling), so `=A1001*2` computes
instead of `#NAME?`. A headless Univer in the tests shows it, with a control
that still errs without the sizes. In imbatranimOS `31a248c`'s production
image, `calc-small.xlsx` saved B1001 to B2000 right, and `big-formulas.xlsx`
saved all 220,000 values right once its first calculation ended, 4.6–5.3
minutes after the grid at load 20–40. In brief 13's 30 s window the task
after the grid is 287–1,305 ms over 8 runs at load 12–26 (no run found the
load under 6), the same scan over 22 times the rows. Watched to the end of
the calculation, the main thread froze 1–4 s in bursts while the results
landed (RPC deserialization, writing values, GC, a redraw), and a save during
it wrote no cached values: a
todo for the owner (brief 03 since 2026-11-03).
Brief 13 stays closed.

## [2026-10-28] build | Brief 14 done: CAD opens DWG through the suite's first server; service or static is the owner's

Brief 14: the spike
passed. `@mlightcad/libredwg-web` 0.8.2, LibreDWG as WebAssembly, runs in Node
with no compiler and writes DXF from R2000, R2007 and R2018 samples in
0.4–0.85 s, which CAD's reader opens whole. The new `server/` (Fastify, run
from source) takes the DWG over a `/dwg-to-dxf` WebSocket, because the
desktop proxies a service app's HTTP for GET and HEAD only, and converts in a
child process per file. In imbatranimOS `31a248c`'s production image the
three opened in CAD with their layers and geometry. Save wrote a `.dxf`
beside the `.dwg`, whose checksum never changed. With the server killed for
good, an open CAD window said so and still opened a DXF; no CSP violation,
and no wasm in `dist/os`. The cost: the OS leases a descriptor's server for
every Office window, so the first one took 2.7–5.0 s instead of 1.0–1.15 s,
and a server that cannot start crashes every Office window. Keep `service`
or ship `static` is the owner's call ([open-questions.md](wiki/open-questions.md));
the OS fixes are in two todos. The machine restarted mid-walk, and the walk
was redone. After it, the owner ruled out heavy tests for the rest of the run.

## [2026-10-31] maintenance | README rewritten with screenshots of all five apps, and a docs/ folder

The README still said nothing was built. It now follows the readme-docs standard: the five apps as
outcomes, a hero of Docs and four screenshots taken in a local imbatranimOS with the suite installed
from a `file://` checkout at `440c510`, how a window gets from the catalog to an app, the checks to
run, and the layout. `docs/` is new: `getting-started.md`, and `images/` with `shots.md` and
`demo-docs.py`, which writes the made-up documents the images show. Checked: `npm ci`, `npm test`
(52 files, 537 passed, 3 skipped), `npm run typecheck`, `npm run lint` (no errors) and
`npm run build:os` pass; every relative link resolves. Found on the way: the OS's Marketplace build
passes only `PATH`, `LANG`, `LC_ALL` and `TZ` to npm, so behind a TLS-inspecting proxy the install
needs `cafile=` in the Node prefix's global npmrc; that is in the getting-started page.

## [2026-11-02] maintenance | Briefs reset

Part of an estate-wide reset. The fifteen briefs in `briefs/done/` are folded
into the wiki and deleted, with the three todos whose work is done or settled
(the CAD trim pick, formulas past row 1000, Docs' caret); brief numbering
restarts at 01. The old briefs read like the grilling that fed the first
corpus. The last commit that held them is `3c6f2dd`: read one with
`git show 3c6f2dd:corpus/briefs/done/14-cad-opens-dwg-through-a-suite-server.md`.
Brief numbers in the entries above refer to that set, and "OS brief NN" to
imbatranimOS's own, which that repo is resetting too.

New pages: [docs-app.md](wiki/docs-app.md) (several windows, find as you type,
the caret SuperDoc paints) and [sheets-app.md](wiki/sheets-app.md) (the xlsx
worker, formulas in a worker, sheet sizing, the big first calculation). The
other pages cite dates instead of brief numbers, OS ones included;
[decisions.md](wiki/decisions.md) now holds the service descriptor's measured
cost. [status.md](wiki/status.md) is a per-app snapshot and records that
imbatranimOS retired its built-ins on 2026-10-28 and pins this repo at
`909c321`, before the row-1000 fix and DWG.


## [2026-11-03] kit | Synced to imbatranimOS 5a31e37, the two themes

The vendored kit is now imbatranimOS's `packages/ui/src` at `5a31e37`, which carries the desktop's
two themes (Apricot by default, Classic kept): the UI font follows the theme, `primary-container`
is the soft accent, six radius tokens, shadow variables, a `selected` Button variant and the accent
focus ring. `e608d49`. CAD's overlay tooltip read Space Grotesk literally and now draws with the
resolved `--font-ui` (`5b83c20`). The office's own hand-built controls were not given the OS's
Apricot pass (rounding, soft selection); they keep their square shapes inside Apricot until an
office brief does that. The OS's Marketplace pin moves to this repo's head; it installs only after
the owner pushes.

## [2026-11-03] decision | The suite ships static; the OS pin moves to this head

The owner chose static over `service` (the open question since 2026-10-28): the OS starts a
descriptor's server for every window, which slowed the first Office window to 2.7-5.0 s and could
break all of them. The descriptor template is static again with CAD on DXF only, and CAD's Open
dialog offers `.dwg` only with a server (`aad4025`); recorded in
[decisions.md](wiki/decisions.md). imbatranimOS's catalog moves its pin to this repo's head, which
also brings it the row-1000 fix and the kit synced to the OS's themes. The invariant in CLAUDE.md
now names the two themes instead of "black and white, no border radius".


## [2026-11-03] todo | Briefs 01-03 from the three open todos

In an estate-wide grill with the owner. The two OS-side todos each became a pair: imbatranimOS's
brief 28 adds `startIn` to the file dialogs and this repo's brief 01 makes every Save as open
where its file is; imbatranimOS's brief 29 lets a kit app ask for its server on demand (recorded
in that repo's `decisions-marketplace-suites.md`), and brief 02 has CAD ask on its first DWG and
turns DWG opening back on. Brief 03 makes a save wait for Sheets' first calculation, fixes the
formula bar's raw locale key, and takes a time-boxed look at Univer's settings for the freezes,
with an upstream report only if there are none. The three todos are deleted;
[status.md](wiki/status.md) lists the briefs.

## [2026-11-05] brief | 01 done: Save as opens where the file is

The kit is synced to imbatranimOS `3dd0a8d` (`5a55a10`): `startIn` on the file dialogs and
`system.server.request()`. Slides' and CAD's Save as pass the open file's folder as `startIn`
(`folderOf` in the shared package); a new document keeps the dialog's old start. Docs, Sheets and
PDF save in place and have no Save as. CAD's DWG save is now that dialog in the DWG's folder with
`<name>.dxf` suggested, and its own replace confirmation is gone (`70d04f1`). Walked in the OS dev
container: CAD's Save as in `Drawings/2026`, the DWG's save in `Drawings`, Slides' in `Decks`.

## [2026-11-05] brief | 02 done: CAD asks for its server on its first DWG

The descriptor template is a `service` with the DWG server again, and CAD `opens` `.dwg`
(`76181e2`). CAD asks through `system.server.request()` on a window's first DWG, shows "Starting the
DWG converter…", keeps the address, and says in its own sentence why when the server doesn't start;
a DXF never asks and `host.server` is no longer read. This replaces the 2026-11-03 "ships static"
decision ([decisions.md](wiki/decisions.md)). Walked in the OS: Sheets opened in about 0.3 s with the
server stopped, and the first DWG started it, converted and opened in 1.7 s. The OS's catalog entry
has to move to the service template and this head before the OS gets any of it.

## [2026-11-05] brief | 03 done: a save during Sheets' first calculation writes whole values

Univer's latest-result wait counts a stopped calculation as finished, and an edit during the first
calculation stops it and restarts it with the edit added, so a save resolved in the gap.
`engine/firstCalculation.ts` tracks the first calculation (first start after a load to the first end
that isn't a stop); a save waits for it, up to 15 minutes, and the toolbar says so. The formula
bar's progress keys had no strings in any 0.25.1 locale; en-US now has five (`7950024`). The look
found no Univer setting that spaces out results (each run's results are one message), so the
upstream report's text is in the outcome. Checked in the OS with a 30,000-formula workbook: an edit
and Ctrl+S two seconds into a 19 s calculation waited and saved every cached value.

## [2026-11-05] os | imbatranimOS pins `1b4394f`

The OS's catalog entry is now this repo's descriptor template at `1b4394f` (OS commit `eb12677`), the
service template with DWG back, after briefs 01-03. Push this repo before the OS.

## [2026-11-06] briefs | 04 and 05: WebAssembly in the apps

imbatranimOS researched turning this repo into imbatranim-apps, the home of
every app that can be installed on the OS. The owner approved the plan on
2026-11-06 (imbatranimOS `corpus/wiki/research-imbatranim-apps.md`; the
rename is its brief 50, with Office kept as the descriptor id
`imbatranim-office`). One of the plan's three kinds of app is a kit UI over a
WASM engine from an npm package, which the desktop's CSP refused until
imbatranimOS brief 53. Two briefs follow from it here:
- **04, CAD reads DWG in the tab.** The server only converts DWG, so if the
  phone can carry LibreDWG in a worker, the descriptor goes back to `static`
  and `server/` goes. It also rewrites the "No WebAssembly in the apps"
  invariant to "WASM only from an npm package, pinned, never compiled here or
  committed".
- **05, PDF decodes JPEG2000 and JBIG2.** It ships pdf.js's `openjpeg`,
  `jbig2` and `qcms` wasm, never `quickjs-eval`.

## [2026-11-06] backlog | 04 and 05 become todos

The owner asked for the imbatranim-apps work to be grilled when it starts
and kept in the backlog until then. Briefs 04 and 05 became the todos
`cad-reads-dwg-in-the-tab` and `pdf-decodes-jpeg2000-and-jbig2-images`, with
their open questions first and the draft brief after. The briefs moved to
`briefs/superseded/` with a note, so the numbers 04 and 05 stay unused; the
next brief is 06.

## [2026-11-06] grill | DWG stays on the server

In imbatranimOS's grill on the imbatranim-apps backlog, the owner chose to
keep DWG conversion on the suite's server, so the todo
`cad-reads-dwg-in-the-tab` is dropped. The change to the "No WebAssembly in
the apps" invariant moves to `pdf-decodes-jpeg2000-and-jbig2-images`. The
owner confirmed WebAssembly is still worth allowing for it.

## [2026-11-06] briefs | Brief 06: PDF decodes JPEG2000 and JBIG2

The PDF todo was grilled and promoted with imbatranimOS's briefs 63-76. It
waits for imbatranimOS brief 67 (WebAssembly with threads). Board ticket
imbatranim-office-06 is in To Do.


## [2026-11-06] rename | imbatranim-office becomes imbatranim-apps

Words only (imbatranimOS brief 63): README, docs, corpus and the root package
name (`@imbatranim-apps/root`). Kept: the descriptor id `imbatranim-office`,
the `office-` app ids, the `@imbatranim-office/*` workspace packages, history.
The local folder is now imbatranim-apps. The GitHub rename is the owner's.
brief-board picks up the project name at the next sync.


## [2026-11-06] build | Brief 06: PDF decodes JPEG2000 and JBIG2

Built in 5ead116. `pdfjs-wasm/` in the build holds `openjpeg.wasm`,
`jbig2.wasm`, `qcms_bg.wasm` and six licence files (468,362 bytes in all;
`dist/os` is 33.27 MB); a build plugin gives the app their directory as
`virtual:pdfjs-wasm-dir`, and the reader and the engine pass it as `wasmUrl`.
Two generated fixtures (`apps/pdf/fixtures/`) render in Node with pixel checks.
The "No WebAssembly" invariant became "WebAssembly only from an npm package"
([decisions](wiki/decisions.md)). Ticket imbatranim-office-06 is in Ready for
test: the walk in the OS waits on imbatranimOS brief 67.


## [2026-11-09] build | Accessories, the third group: Todo and Bookmarks

For imbatranimOS brief 75. `a8c87f7` moves the kit snapshot to the OS's
`98e41ff` (kit 1.6.0: `system.data`, the hook types, a command source's
`ctx.data`) and gives the fake system an in-memory `data`. `1a04603` adds
`accessories/`: the two apps with the OS's code, their modules' rules as pure
functions over files in their own folders, and a small store in place of
react-query, which the desktop doesn't lend. `ebc2be6` keeps both of two
tasks two tabs gave one id. The OS pins `ebc2be6`. Not pushed: push this
repo before the OS.

## [2026-11-09] fix | Accessories: the review's fixes

`59761f1` moves the kit snapshot to imbatranimOS `1b744e4` (kit 1.7.0, a
versioned `system.data.remove`). `a5f3d0e`: the store removes only the
version it read, a task renumbered on read is written back at once, a file
that isn't JSON is named, and Bookmarks' palette source reads its file once
per five seconds. The OS pins `a5f3d0e`.

## [2026-11-09] build | Developer, the fourth group: Git GUI and the REST API Client

For imbatranimOS brief 76. `8a1e811` moves the data store from
`accessories/shared/src` to `packages/shared/src`, for every group, with
`inFolder` to keep a store in another of the app's folders. `4ef5f5a` adds
`developer/`: the two apps with the OS's code. Git GUI's recent
repositories are `recents.json` in its state folder (the OS writes it once
from its old table), and each repository it opens is also one of its OS
recents, a folder, which is what gives a new window it again (owner,
2026-11-09); a repository the OS opens it with, from Start or the palette,
opens. Both ask for `fs`, `http`, `intents` and `notify`. The OS pins
`4ef5f5a`. Not pushed: push this repo before the OS.
