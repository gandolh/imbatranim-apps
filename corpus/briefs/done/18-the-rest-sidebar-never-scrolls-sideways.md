# Task 18: The REST client's sidebar never scrolls sideways

**Depends on:** brief 17 (the kit at imbatranimOS `c9f2735`). **Runs after:** 17.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

Filed 2026-11-19 by the controller from imbatranimOS brief 91's walk: in the REST client, Tab onto a long entry scrolls the sidebar sideways by 56 px, which cuts "Collections" off at the left.

## Context

`developer/apps/rest-api-client/src/components/Sidebar.tsx` puts the Collections and History sections in the kit's `ScrollArea`; each row's name already truncates (`truncate`, `min-w-0`). So a row is wider than the viewport anyway: the likely cause is the scroll area's content sizing to its widest child (Base UI's `ScrollArea.Content` defaults to `min-width: fit-content`), which defeats the rows' truncation and lets focus scroll the viewport sideways.

## Decisions

- **Find the cause first**, with a failing check: a long entry, Tab onto it, the viewport's `scrollLeft` stays 0 and "Collections" stays in view.
- **If the cause is in the app** (a row or a section wider than its column), fix it in the sidebar.
- **If the cause is the kit's `ScrollArea`** (its content's min-width), don't edit `vendor/imbatranim-ui/`: fix this sidebar's use (a class on the content the kit already passes through), say so, and file an imbatranimOS todo for the kit's default, naming the other `ScrollArea` uses here that a vertical-only list would want.
- Names keep truncating (they are a list's labels, the full name is in the editor); nothing else changes look.

## Files you OWN

- `developer/apps/rest-api-client/src/` and its tests; `tools/browser/` specs if a check belongs there.
- Corpus: `wiki/status.md`, `log.md`.

## What to do

1. The failing check (a unit test if jsdom can see it, else the focus spec on the dev desktop), then the fix.
2. The focus spec and the overflow spec for the developer group in the four looks at 1280 and 390, as brief 17 ran them.

## Acceptance

- [ ] The check fails on today's code and passes now; the specs pass; `npm run check` exit 0; `bash corpus/lint.sh` OK.
- [ ] End move `ready_for_deploy`, owner step: push, re-pin imbatranimOS's `developer.json` descriptor to this repo's last commit, then `node cli.ts imbatranim-os server`.

## Outcome (2026-11-19)

The cause was the kit's `ScrollArea`: Base UI's `ScrollArea.Content` carries an inline `min-width: fit-content`, so the content grew to the widest row (the rows' `shrink-0` method and status chips plus the long name) and focus scrolled the viewport sideways. Fixed in the sidebar only: both sections sit in a `w-0 min-w-full` box, which adds nothing to the content's intrinsic width and then fills the column, so names truncate. `Sidebar.test.tsx` checks the wrapper (jsdom has no layout) and fails on the old code. In the dev desktop, with a 250-character entry saved, the viewport's `scrollWidth` equals its `clientWidth` (181) and Tab moves scroll nothing. The focus spec passes in the four looks for the developer screens (24 of 24), the overflow spec 14 passed, 7 skipped at 390 and 360. The kit's default is for imbatranimOS to decide: a vertical-only `ScrollArea` could give its content `min-width: 0` (the kit passes no class to the content); the other uses here that would want it are the lists in Todo, Bookmarks and Git GUI that put truncating rows in a `ScrollArea`.
