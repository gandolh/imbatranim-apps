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

## Outcome (2026-11-19)

Built in `2468b20`, `d1e4c9b` and `2abdeac`, local on `main`, not pushed.

- **Kit** at imbatranimOS `a2e7636` (OS 97's closeout; it follows `1a4a6f2`, which brought 94 and 96). `kit:sync -- … --check` exit 0, `SHARED_KIT_VERSION` stays 1, the snapshot test names the commit.
- **CAD:** the two More rows that open another list take `closeOnClick: false`; the 300 ms `navigatedAt` guard is gone and the More test passes.
- **Slides' font size list** fits and scrolls inside itself at 390x640 and 360x800 in Apricot light and Classic dark (`tools/browser/slides-size-menu.spec.ts`, 4 passed; the popup stays open while it scrolls).
- **Step 4, invalid forms:** none exist. No app here sets `aria-invalid` or `data-invalid` on a kit field; the forms show errors as text lines. Nothing to change, no shots. That is a result, not a gap.
- **The REST sidebar spec** (`tools/browser/sidebar.spec.ts`): saves a long entry, Tabs onto it, asserts the viewport's `scrollLeft` is 0 and `scrollWidth` at most `clientWidth`, and deletes the entry. Red run: wrapper removed and the kit's old ScrollArea (`1a4a6f2`) put into the container, the spec failed at 1280 on scrollWidth 1817 against clientWidth 181 (the phone rows carry their own `w-0`, so 390 and 360 pass either way). Green with the wrapper on 97's ScrollArea. Then brief 18's `w-0 min-w-full` wrapper was removed (the desktop lends its own kit at runtime, so the fix comes from the OS), and the spec stays green without it. `Sidebar.test.tsx` lost its wrapper assertion and now checks the sections render.
- **Walk** (dev desktop, three groups installed from the scratch clone at `d1e4c9b`): focus spec, `focus.spec.ts --workers=1`, 100 passed, 200 skipped, exit 0, in the four looks; overflow spec, `overflow.spec.ts --workers=2`, 52 passed, 26 skipped, exit 0. Appearance set back to Apricot light.
- **Run:** `npm run check` exit 0 (92 files, 958 passed, 3 skipped), `bash corpus/lint.sh` OK.
- **Owner step:** push this repo, re-pin imbatranimOS's `imbatranim-office.json`, `accessories.json`, `developer.json` and `games.json` to this repo's last commit (all four still pin `e479048`, and games changed since in `75d037b`), then `node cli.ts imbatranim-os server` from the vps-deploy checkout.
- **After the audit (controller):** CAD's test also opens the Units list from More and sees More close (it fails with `closeOnClick` taken off that row). The sidebar spec deletes its own entry (a save is appended after any the account already has) and Tabs through every sidebar stop instead of eight. The controller reran the spec: green, red at 1280 with the old ScrollArea in the container (scrollWidth 1817 against clientWidth 181, the builder's figures), green again after the restore.
