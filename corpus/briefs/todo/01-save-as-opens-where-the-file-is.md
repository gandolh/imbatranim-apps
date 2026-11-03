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
