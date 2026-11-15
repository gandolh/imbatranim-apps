# Task 11: A redesign with Hallmark, on the estate board

**Depends on:**

- In this repo: brief 09 (Base UI by the conventions: the kit's controls in the apps, the pixel sizes pinned) and brief 08 (the gate).
- In imbatranimOS: its brief 88, *A redesign with Hallmark, on the estate board*, built and its look synced here through `kit:sync`. The apps run inside the desktop and follow its tokens (its rules 5-11), so this repo's redesign is the apps' own layouts on top of the desktop's new token set. It goes on the **same board page group** as the desktop's.
- In the owner's skills library:
  - brief 24, now "vendor Hallmark as the design skill, and adopt taste-skill 2.5's ideas" (palettes and type dealt by trade, and its copy layer);
  - the estate redesign board: one artifact with a page per app, owned by the skills library.
- The owner's call of 2026-11-10 (Q39): no bake-off; Hallmark redesigns every web UI, and the owner approves each app on the board before any code changes.

**Runs before:** nothing. **Runs after:** 07 to 09, the redesign last. Brief 10 is server-only and does not block it.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

imbatranim-apps is the set of apps that install into imbatranimOS's desktop: Office (Docs, Sheets, Slides, PDF, CAD), Games, Accessories (Todo, Bookmarks) and Developer (Git GUI, REST API Client). Each app is one React component the desktop renders in a window, with the desktop's React and kit.

### The screens (read 2026-11-10)

The apps have no routes: each is a window. The Games group (Minesweeper, `games/apps/minesweeper/src/Minesweeper.tsx`, and Solitaire, `games/apps/solitaire/src/Solitaire.tsx`) is **left out**: their UI is the game.

| Screen | Rendered by |
|---|---|
| Docs: the editor, find bar, toolbar | `apps/docs/src/Docs.tsx` |
| Sheets: the grid, formula bar | `apps/sheets/src/Sheets.tsx` |
| Slides: toolbar, slide rail, stage, notes pane, presenter | `apps/slides/src/editor/Toolbar.tsx`, `Rail.tsx`, `Stage.tsx`, `NotesPane.tsx`, `Presenter.tsx`, `Editor.tsx` |
| PDF: empty state, top bar, reader, side panel (outline, thumbnails), annotate toolbar, signature dialog, forms panel, organize view | `apps/pdf/src/app/EmptyState.tsx`, `shell/TopBar.tsx`, `shell/SidePanel.tsx`, `reader/Reader.tsx`, `editor/AnnotateToolbar.tsx`, `editor/SignatureDialog.tsx`, `forms/FormsPanel.tsx`, `organize/OrganizeView.tsx` |
| CAD: toolbar, viewport, command line, status bar, layer dialog | `apps/cad/src/ui/Toolbar.tsx`, `Viewport.tsx`, `CommandLine.tsx`, `StatusBar.tsx`, `LayerDialog.tsx` |
| Todo | `accessories/apps/todo/src/Todo.tsx`, `TodoRow.tsx` |
| Bookmarks and its move dialog | `accessories/apps/bookmarks/src/Bookmarks.tsx` |
| Git GUI: repo bar, status, diff | `developer/apps/git-gui/src/GitGui.tsx`, `components/RepoBar.tsx`, `components/DiffView.tsx` |
| REST API Client: sidebar, request builder, response viewer, auth, environment and curl dialogs | `developer/apps/rest-api-client/src/RestApiClient.tsx`, `components/Sidebar.tsx`, `RequestBuilder.tsx`, `ResponseViewer.tsx`, `AuthDialog.tsx`, `EnvironmentDialog.tsx`, `CurlDialog.tsx` |

### What the design docs fix today

- **This repo has no look decision of its own.** [wiki/decisions.md](../../wiki/decisions.md) records "Kit apps, on the desktop's shared kit" (2026-10-21): the apps use the desktop's kit and tokens so they stay OS apps. [wiki/stylesheets.md](../../wiki/stylesheets.md) records how: utilities only, compiled against the kit's token file, no `--color-*` values, no app stylesheet.
- **The desktop's look is imbatranimOS's.** Its locked calls, restated in its brief 88: two themes (Apricot and Classic) in light and dark, light by default; no glass; the taskbar skeleton stays; "best UX, not Win7" (owner, 2026-11-06). Token **names** are the contract with every app and never change; only values do.
- **[corpus/CLAUDE.md](../../CLAUDE.md)'s invariant** still reads "Win7-classic in two themes". That is stale against the owner's 2026-11-06 call. Brief 08 rewords it; this brief checks it did.
- **Things that stay data or content, not theme:** a PDF page, a signature canvas, a thumbnail and Slides' presenter stage (`bg-white`, `bg-black`, listed in brief 09's exceptions); CAD's drawing colours; the colours of a slide's own content.
- **Three libraries paint their own UI,** with vendor stylesheets declared in `package.json`: SuperDoc (Docs), Univer (Sheets) and pdf.js's text layer (PDF). The redesign reaches them only through the tokens they read, or not at all.

The redesign stays inside these decisions unless the owner reopens one on the board. The likeliest to reopen is the layout of the toolbars, which copy desktop office suites.

## Owner decisions

Answered 2026-11-10: Q39 (Hallmark, with taste-skill 2.5's useful parts; approval on the board first), and Q18 (a Light / Dark / System switch, the desktop's). Default: the proposal keeps each app's feature set, its window chrome and the kit's controls. A change to the tab order, a toolbar's position or a dialog's wording is flagged on the board as a reopened decision.

## Files you OWN

- The screen files listed above, one screen per commit.
- The apps' own token usage (class names), and nothing in `vendor/`.
- A `DESIGN.md` recorded from the shipped result, at the repo root.
- Corpus: [wiki/decisions.md](../../wiki/decisions.md) (a new look decision, if any), [wiki/stylesheets.md](../../wiki/stylesheets.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `vendor/imbatranim-ui/`. A token value, a radius or a kit control changes in imbatranimOS and arrives through `kit:sync`. If a proposal needs one, it is a request to imbatranimOS's brief 88, flagged on the board.
- Token names, the system handle and the app protocol.
- The behaviour of any app: shortcuts, save and undo flows, file handling, the DWG path.
- The copy's meaning. No invented facts or numbers, and no invented files, slides or names in screenshots beyond the real test files.

## What to do

1. **Today.** Install the suite into a local imbatranimOS (the apps render only in an OS window; [docs/getting-started.md](../../../docs/getting-started.md)). Take screenshots of every screen above at 1280 px and at 390 px (the desktop at a phone viewport), in the desktop's themes (Apricot light, Apricot dark, Classic light, Classic dark), kept out of git. Use the real sample files the walks use ([wiki/test-files.md](../../wiki/test-files.md)), and include the open dialogs, menus and empty states. CAD and PDF canvases need a settled frame before the capture.
2. **Propose.** With Hallmark (and taste-skill 2.5's trade palettes and copy layer where they help), make a proposal per screen, inside the recorded decisions. An app's layout inside its window is the subject; the palette arrives from imbatranimOS's brief 88. Check each against the Floor: contrast, a visible focus ring, a `prefers-reduced-motion` path, no invented facts, no broken phone layout.
3. **Board.** Put the proposals on this repo's page of the estate board, in the same page group as imbatranimOS, beside today's screenshots at both widths.
4. **Approval.** The owner approves on the board. Nothing below starts before that, and the approval is recorded in [log.md](../../log.md) with its date.
5. **Build.** First as a token change: the apps' own custom values and any app-level colour (a PDF annotation colour, `--norpdf-accent-strong`, CAD's UI colours) in one commit. Then one screen per commit, in the order of the table. Keep the kit's controls and the theme switch working.

## Acceptance

- [ ] The owner's approval is on the board and recorded in [log.md](../../log.md) with the date.
- [ ] Contrast: a script reads each app's built `app.css` and the kit's token file and checks every text and icon colour pair a screen uses, in all four theme and mode combinations, at 4.5:1 (3:1 for large text and UI parts). The result is listed in the outcome note. Colours that come from a document (a slide's text on its own fill) are checked against their own background.
- [ ] A browser test in the desktop tabs through each screen and asserts a visible focus ring of at least 2 px, at 3:1 against its surface, on every stop.
- [ ] A browser test with `reducedMotion: "reduce"` asserts no running animation or transition (`document.getAnimations()` is empty) on each screen.
- [ ] A browser test at 390 px asserts `document.documentElement.scrollWidth <= window.innerWidth` with each app open.
- [ ] Every figure and name shown comes from the data or the copy; the outcome note lists none invented.
- [ ] The Light / Dark / System switch still works through the desktop, light on a first visit, and the screenshots in all four combinations look right in both modes.
- [ ] `npm run check` passes, and `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 09 fixes structure and pixel sizes; this brief changes values and layout on top of it. The named sizes the kit provides are used, not replaced.
- imbatranimOS's brief 88 owns the token values. Until its look is synced, today's screenshots are the baseline; after it, the proposal is made on the synced look.
- The browser tests need a running desktop, so they are scripts that take its address as an argument, kept beside the repo's other tools, and run by hand with `npm run check` as the always-on gate.
- Brief 08's formatter and lint run on every redesign commit.

## Outcome (2026-11-15)

Built over three sessions (2026-11-13, the night of 2026-11-14 and
2026-11-15), local on `main`, not pushed. The owner approved direction B,
"Tools beside the page", on the estate board on 2026-11-13 (`f8084f3`,
[log.md](../../log.md)); the call is [wiki/apps-layout.md](../../wiki/apps-layout.md)
and what shipped is [DESIGN.md](../../../DESIGN.md).

- **Built, one screen per commit:** the kit sync to imbatranimOS `5e075a0`
  (`df970a6`), the token commit (`9627921`, Slides' fixed `#a04b23` frame),
  Docs (`bb242c1`), Sheets (`bfde28e`), Slides (`d0e87b3`), PDF (`c0ece1f`,
  its sub-views `3a5e8d4`), CAD (`a28c9d5`), Todo (`5f9f82d`), Bookmarks
  (`6b36983`), Git GUI (`93f9f66`), the REST API Client (`63c3943`) and the
  Presenter (`e305b5a`). Then what the browser checks found: the copy sweep
  (`15441e5`), the rings and motion on the undrawn screens (`14b0192`), the
  kit Inputs' ring (`53f9122`), the last ringless stops (`e390620`,
  `cb6b051`, `f8e0e8a`) and the soft-fill ring for Classic (`098849f`).
- **Asks (sheet item 3):** Univer 0.25.1's own dark mode repaints its
  ribbon, bars and grid, and Sheets drives it from the desktop's resolved
  mode; SuperDoc 1.46.3 reads `--sd-ui-*` for its toolbar, set from the
  desktop's tokens. No vendor CSS was edited.
- **Contrast** (`npm run contrast -- <imbatranimOS checkout>`, exit 0):
  every pair each app's compiled `app.css` can form, in the four looks,
  values from imbatranimOS at the snapshot's commit. Pairs per app: CAD 21,
  Docs 23, PDF 32, Sheets 14, Slides 23, Bookmarks 15, Todo 19, Git GUI 24,
  REST client 23; the lowest of all at 1.05 times its threshold. On white:
  Slides' frame 5.96:1 in every look; PDF's selection outline 9.25, 3.66,
  9.25 and 9.25:1; the typed signature 21:1. The Presenter's counter 10.0:1
  and Exit edge 5.3:1 on black. The desk under the panels: 1.15, 1.09, 1.08
  and 1.03:1 with a hairline, the ring on it 4.86, 8.80, 5.09 and 3.14:1.
  Listed, not failed: imbatranimOS's known gap, Classic dark's crimson as
  text or ring at 2.90 to 3.31:1 on the dark surfaces (the REST client's
  2xx status included).
- **Browser checks** (`tools/browser`, Playwright 1.63.0, headless against
  the dev container's desktop, one worker since the specs set the account's
  look; the record is at `5ab969a`, and the two screens a later fix
  touched, PDF's annotate panel and organize view, were walked again at
  `eff7cca`, the last app commit):
  - Focus: 25 screens in all four looks, 1,680 stops. The app's own 1,636
    all carry a ring of 2 px or more at 3:1 or better (the lowest 3.05:1),
    except 32 in Classic dark that sit in imbatranimOS's crimson gap (2.85
    to 3:1, listed) and two on Git GUI's selected file in Classic dark
    (the row and its checkbox, 2.67:1 on `surface-container-high`, the same
    gap; under Concerns). SuperDoc's and Univer's 12 stops and the 32
    title-band and dialog Close stops are listed, not asserted.
  - Reduced motion: nothing of the apps' own ran on any of the 25 screens,
    sampled frame by frame from the window opening, and nothing of theirs
    was running at rest. Listed, not asserted: SuperDoc's toolbar fades,
    Univer's 40 transitions (38 still running at rest), the kit's Select
    transition and the File Manager's spinner. Without reduced motion the
    sampler does see motion (Start opening).
  - Phones: 24 screens at 390 and at 360, each with its window maximized
    above the taskbar, no sideways scroll (`scrollWidth` never above the
    width) and no control left outside the window.
  - Light / Dark / System: in Apricot and in Classic, Slides' app bar and
    Univer's own parts change with Dark and back with System on a light
    device; a first visit with nothing saved is light.
- **Ruling 8's measurements** (Apricot light; window, then the part):
  - 1280: Slides 960 x 560, the slide 750 x 422 idle and with the format
    popover open (it docks only from 1100 px), thumbnails 99 x 56; PDF
    1040 x 560, the page 750 px at 92%; Docs 860 x 680, a true 816 px sheet
    (no readout on a desktop, 100%).
  - 1024 (windows 1008 x 708): the slide 759 px, thumbnails 142 x 80; the
    PDF page 718 px at 88%; Docs 816 px.
  - 768 (752 x 964): the slide 458 px, thumbnails 187 x 105; the PDF page
    462 px at 57%; Docs 816 px, which scrolls sideways on the desk.
  - 390 (390 x 788): the slide 364 px, thumbnails 150 x 84; the PDF page
    356 px at 44%; Docs 392 px at 48%.
  - 360 (360 x 744): the slide 334 px, thumbnails 135 x 76; the PDF page
    326 px at 40%; Docs 359 px at 44%.
- **Shots** (outside git): the six drawn screens (Docs, Sheets, Slides idle,
  open and maximized, PDF) in all four looks at 1280 and 390, the 19 others
  in Apricot light at both widths, and side-by-side diffs against the
  board's rendered twins. The layouts match; what differs by design is the
  window's position, Univer's real dark mode against the twins' light
  vendor parts, and at 1280 the format group as a popover where the twin,
  drawn before the 1100 px ruling, docked it.
- **Nothing invented.** Every figure and name on screen comes from the
  container's own files and data: `anim.pptx` (six slides),
  `test.docx` ("Hello walk edited", 3 words), `calc-30k.xlsx`, the
  fontconfig user guide (17 pages, copied in from the host's fontconfig
  docs), `apartment.dxf`, the Bookmarks folder "Walk" with "Example", the
  Git repository `walk/repo` with one changed file, and the REST client's
  saved requests and history.
- **Not reached:** Bookmarks' move dialog (one folder, so the app offers
  nowhere to move to; a second folder would be a made-up name); Forms with
  fields and a signature field (no such PDF in the container, the empty
  state is shot); Todo's task rows (no tasks); the REST response viewer
  (it needs a send); the `.ppt` refusal (`WithLinks.ppt` isn't in the
  container).
- **The flaky PDF test** timed out on the first full run with the machine
  quiet. Two causes: the engine chunk's first import and pdf.js's first
  parse fell inside the wait, and the text layer could still be missing at
  the assertion. A warm-up in `beforeAll` and a condition wait fix both
  (`0274d13`), with no timeout raised; then three full `npm run check` runs
  and eight full Vitest runs passed.
- **Deviations:** CAD's tools stay 28 px (controller, accepted); PDF's Fit
  width and Fit page sit in More on a phone (accepted); the PDF empty state
  keeps its feature list (accepted); Docs on a phone fits at 48%
  (44% at 360) where the ruling says 44% (40% at 360), SuperDoc's own
  fit-width; the contrast script reads the token values from
  an imbatranimOS checkout at the kit snapshot's commit (the kit's token
  file holds names only); the focus walk and the motion spec list, and
  don't assert, what SuperDoc, Univer, the kit's controls and other
  windows do, and the focus walk treats Classic dark rings at 2.85 to 3:1
  as imbatranimOS's known gap. Em dashes left in user-visible text: a lone
  dash meaning "no value" (`apps/slides/src/editor/Editor.tsx:807`,
  `developer/apps/rest-api-client/src/components/Sidebar.tsx:72`),
  Solitaire's win line (`games/apps/solitaire/src/Solitaire.tsx:333`, games
  are out of this brief) and the PDF engine's error messages, which can
  reach a toast through `msgOf` (`packages/pdfcore-engine/src/api/errors.ts:27,41,56,84`,
  `src/adapters/pdf-lib/forms.ts:141,277`).
- **Concerns for imbatranimOS** (no OS file was touched): the kit's ghost
  Button draws no focus ring; its Input rings only inside a Field and at
  40%; its ScrollArea viewport takes Tab without a ring; its Select,
  Checkbox and Input transitions aren't gated on motion; the File
  Manager's spinner spins under reduced motion; `reportFileRefusal`'s body
  holds an em dash; Classic dark's crimson gap.
- **For the owner:** Slides takes Tab window-wide to cycle the slide's
  shapes (PowerPoint's way), so Tab never moves focus inside a Slides
  window; left as it is (a shortcut), and a question on the board.
- **Owner step:** move imbatranimOS's three catalog descriptors
  (`marketplace/imbatranim-office.json`, `marketplace/accessories.json`,
  `marketplace/developer.json`) to this repo's last commit (the brief-11
  closeout), then `node cli.ts imbatranim-os server` from the vps-deploy
  checkout.
