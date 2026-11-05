# Brief 01 — Save as opens where the file is

## Context

Found while building DWG opening (2026-10-28). The OS's save dialog always
opened at the home root, so CAD couldn't offer "save this DWG as a `.dxf`
next to it" through the dialog. It confirms a fixed name beside the DWG
instead (`saveBesideDwg` in `apps/cad/src/shell/useCadFile.tsx`), and every
editor's Save as starts at home.

**Depends on imbatranimOS's brief 28, "The file dialogs can start in a
folder"**, which adds `startIn: { root, path }` to `system.fs.pickOpen` and
`pickSave`. Don't start this one until it is done there. Settled with the
owner on 2026-11-03 as those two briefs. Promoted from the todo
`2026-10-28-os-save-dialog-start-folder`.

## Spec

1. Sync the kit (`npm run kit:sync`) to the imbatranimOS commit with
   brief 28.
2. Every editor's Save as (Docs, Sheets, Slides, PDF and CAD) passes
   `startIn` with the open file's folder. A new, never-saved document keeps
   today's start.
3. CAD's DWG save offers the dialog in the DWG's folder with the `.dxf`
   name suggested, instead of confirming a fixed name beside it; drop
   `saveBesideDwg`'s confirmation if nothing else uses it.
4. Update the CAD harness and `packages/shared/src/testing/fakeSystem.ts`
   so tests can see `startIn`.

## Acceptance

- Tests in each app: Save as on a file in a subfolder asks the dialog to
  start in that subfolder; a new document asks for no `startIn`.
- CAD: saving a DWG's drawing opens the dialog in the DWG's folder with
  `<name>.dxf` suggested.
- A short walk in the OS with one editor (Sheets) and CAD.
- Typecheck, lint and the tests of the apps changed pass.

## Files you OWN

- `vendor/imbatranim-ui/` (through `kit:sync` only)
- each app's Save as code: `apps/*/src/shell/` and where Docs, Sheets and
  PDF call the save dialog
- `apps/cad/src/shell/useCadFile.tsx`, `apps/cad/harness/main.tsx`
- `packages/shared/src/testing/fakeSystem.ts`

## Outcome (2026-11-05)

Done in `70d04f1`, after the kit sync `5a55a10` (imbatranimOS `3dd0a8d`,
which has the OS's briefs 28 and 29; no shared-module pin moved).

1. **Only Slides and CAD have a Save as.** Docs, Sheets and PDF save over the
   file they opened and have no Save as dialog (PDF's page says so), so the
   spec's "every editor" came down to two. Adding a Save as to the other three
   is new work, not done here.
2. `folderOf(file)` in `@imbatranim-office/shared` gives the folder a file is
   in (the root itself for a top-level file). Slides' and CAD's Save as pass
   it as `startIn`; a never-saved document passes none.
3. **CAD's DWG save is the dialog now:** "Save drawing as DXF", in the DWG's
   folder, with `<name>.dxf` suggested. `saveBesideDwg` and its confirmation
   are gone: the OS dialog already asks "Replace file?" over an existing file.
   The note a DWG opens with says Save offers the `.dxf` in the same folder.
4. The fake system records every Open and Save dialog's options
   (`dialogs`) and answers through `answerOpen`/`answerSave`; the CAD harness
   keeps `saveDialogs`.

**Checked:**
- Tests: Slides and CAD ask the dialog to start in the subfolder of the open
  file and ask for no `startIn` for a new document; CAD's DWG save asks in
  the DWG's folder with `plan.dxf` suggested, writes it and edits it from
  then on, and a cancelled dialog writes nothing. `folderOf` has its own.
- Typecheck, lint (one old warning in `useCadFile.tsx`, an unused disable
  comment, predates this) and the tests of every app (the fake system is
  shared): 116 in CAD, Slides and shared, 154 in Docs, Sheets and PDF.
- **Walked in the OS** on 2026-11-05: the dev container (its image from
  2026-11-03, the current OS source copied in; the npm dependencies matched)
  with Office installed from a local descriptor at `76181e2`. CAD's Save as on
  `Drawings/2026/apartment.dxf` opened at `/Drawings/2026` with the name
  suggested; Save on `Drawings/example_2018.dwg` opened "Save drawing as DXF"
  at `/Drawings` with `example_2018.dxf`, wrote it, left the DWG byte for byte
  as it was, and the window then edited the DXF. Slides' Save as on
  `Decks/anim.pptx` opened at `/Decks`. Sheets has no Save as, so the walk
  used Slides instead of it.
