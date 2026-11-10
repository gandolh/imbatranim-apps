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
