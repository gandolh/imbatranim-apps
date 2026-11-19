# Task 19: The kit's error mark and menu fixes arrive, and CAD's guard goes

**Depends on:** imbatranimOS briefs 94 (an invalid field's error mark, built) and 96 (both kit menus fit a phone; a row can keep its menu open), built and committed in the OS repo. Don't start before both are.

**Runs after:** 18.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

Filed 2026-11-19 by the controller: brief 17's open items.

## Context

Brief 17 held CAD's split More menu open against the kit's close with a 300 ms guard (`apps/cad/src/ui/StatusBar.tsx`, `navigatedAt`), because the kit closed a menu on every row. OS 96 gives the kit's menu rows Base UI's `closeOnClick` and every kit menu popup a max-height that scrolls. Slides' font size list (24 rows at 44 px) is taller than any phone today. OS 94 marks an invalid kit field with an error icon, not colour alone.

## What to do

1. `npm run kit:sync -- <imbatranimOS checkout> <the last kit commit: 97's if it has landed, else 215c91b>`, then `--check`; the snapshot test names the new commit; `SHARED_KIT_VERSION` stays 1 (an added optional prop is compatible; the OS reverted 96's bump in 215c91b).
2. CAD: the rows that open another list use `closeOnClick={false}`; the 300 ms guard goes; its test still passes (the snaps and units lists open from More and stay open).
3. Slides: the font size list fits and scrolls at 390x640 and 360x800 in Apricot light and Classic dark.
4. Forms with an invalid state (find them: an app that sets `data-invalid` or `aria-invalid` on a kit field) show the mark; one shot each.
5. **A durable check for brief 18** (its audit: `Sidebar.test.tsx` pins class names only): a browser spec for the REST client (in `tools/browser/`, e.g. beside `focus.spec.ts`'s `rest` screen) that saves a long entry, Tabs onto it, and asserts the sidebar viewport's `scrollLeft` is 0 and its `scrollWidth` at most its `clientWidth`. Show it fail with brief 18's wrapper removed. If imbatranimOS has fixed the kit's `ScrollArea` content width by then (its todo "the kit's scroll area grows to its widest row"), drop the wrapper and keep the spec.
6. The focus and overflow specs in the four looks, as brief 17 ran them.

## Files you OWN

- `vendor/imbatranim-ui/` through `npm run kit:sync` only; `packages/shared/src/build/kitSnapshot.test.ts`; `apps/cad/src/ui/StatusBar.tsx` and its test; Slides' font size menu if it needs a class; `tools/browser/` specs.
- Corpus: `wiki/status.md`, `log.md`.

## Acceptance

- [ ] `kit:sync --check` exits 0; the guard is gone; the specs pass; `npm run check` exit 0; `bash corpus/lint.sh` OK.
- [ ] End move `ready_for_deploy`, owner step: push, re-pin every changed group's descriptor to this repo's last commit, then `node cli.ts imbatranim-os server`.
