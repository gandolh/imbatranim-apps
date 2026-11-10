# Task 07: Base UI 1.9.0, through kit:sync

**Depends on:**

- In imbatranimOS: its brief 85, *Base UI to 1.9.0, pinned exactly*, built and committed. This brief needs **that commit's hash**, and no later one (see Context). The owner gives it.
- In the owner's skills library: nothing is needed to build it. It is this repo's row of the brief *Every repo on Base UI 1.9.0*, and replaces it here.

**Runs before:** 08, 09, 10 and 11. A visual or behavioural change in the later briefs is never blamed on the bump.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

On 2026-11-09 the owner decided that every web app they own runs `@base-ui/react` at the latest stable release, **1.9.0**, pinned exactly. This repo has no Base UI of its own to bump: the apps import none of it. The Base UI code is the nine wrappers in the kit snapshot, and the pin follows the kit.

### The pin today (read 2026-11-10)

- **The pin.** One `package.json` names Base UI: the root, `package.json:30`, `"@base-ui/react": "1.6.0"` in `devDependencies`, already exact. Command: `grep -rn "base-ui" --include=package.json . | grep -v node_modules`. No workspace lists it.
- **The lockfile.** One copy: `node_modules/@base-ui/react` at 1.6.0 and `node_modules/@base-ui/utils` at 0.3.1, hoisted, no nested copy. Command: read `packages` of `package-lock.json`.
- **Who writes the pin.** `kit:sync` does. `packages/shared/src/build/kitSnapshot.ts:47` lists `@base-ui/react` in `TRACKED_PINS`, resolved from the OS lockfile through `packages/ui`. `kit:sync` moves the pin in `package.json` to whatever the OS's lockfile resolves at the commit it syncs. It moves all 13 tracked pins (`react`, `react-dom`, the two `@types`, `tailwindcss` and its two helpers, `@base-ui/react`, the two TanStack packages, `clsx`, `tailwind-merge`, `lucide-react`), so the outcome note lists every pin it moved.
- **Who imports it.** Nine files, all in the vendored kit: `vendor/imbatranim-ui/src/components/` `Button`, `Checkbox`, `ContextMenu`, `Dialog`, `Input`, `ScrollArea`, `Select`, `Separator`, `Tooltip`. The apps import none (`grep -rn "@base-ui/react" apps accessories developer games packages server --include=*.ts --include=*.tsx`, outside `vendor/` and `node_modules`, finds only `packages/shared/src/build/kitSnapshot.ts` and its test, which name the package as a string). Rule 3 of the owner's base-ui skill holds already, in its stricter form.
- **The renamed names.** 1.9.0 renamed `OTPFieldPreview` to `OTPField` and `sanitizeValue()` to `normalizeValue()`. Command: `grep -rnE "OTPFieldPreview|otp-field|sanitizeValue" --include=*.ts --include=*.tsx --include=*.json --include=*.md . | grep -v node_modules | grep -v package-lock` printed nothing on 2026-11-10.
- **The kit has not moved.** The snapshot is imbatranimOS `95b331d` (kit 1.8.0, `vendor/imbatranim-ui/COMMIT`). On 2026-11-10 the OS had no commit touching `packages/ui` after it (`git log --oneline 95b331d..HEAD -- packages/ui` in the OS checkout printed nothing). So the sync at brief 85's commit should change the pin, `COMMIT` and nothing under `vendor/imbatranim-ui/src`.

### Why the exact commit

`kit:sync` at a later OS commit pulls in that commit's kit. The OS's briefs 86 (the reformat rewrites every kit file) and 87 (the wrapper set and the token changes) land after 85, and each belongs in its own step here: brief 08 takes the reformat, brief 09 takes the wrappers. Syncing at 85's commit keeps this brief to the pin.

### Not measured here

- The lockfile diff. The scratch copy used for this brief's measurements links the real `node_modules`, so no `npm install` was run. Newspapper's bump (a repo with the same hoisted shape) replaced eight lockfile entries and nested the new copy under its workspace, because another package held older `@floating-ui` and `use-sync-external-store` versions. Step 3 checks for the same here.
- The 1.6.0 to 1.9.0 changelog, and behaviour in a browser.

## Owner decisions (defaults this brief builds)

1. **Pin 1.9.0 exactly** (the owner, 2026-11-09). No range. `.npmrc` already has `save-exact=true`.
2. **The pin comes from `kit:sync`, then is checked against 1.9.0** (technical call, 2026-11-10). If the OS lockfile at the commit does not resolve exactly 1.9.0, stop and report: do not write the pin by hand, because `kit:sync --check` would then fail.
3. **Nothing else moves.** No `npm update`, no other dependency by hand. The pins `kit:sync` moves are the OS's own, and are listed, not reviewed here.
4. **A visual change the bump causes** is logged in the outcome note and left. Briefs 09 and 11 own the markup and the look.

## Files you OWN

- `package.json` (the pin lines `kit:sync` moves) and `package-lock.json`.
- `vendor/imbatranim-ui/COMMIT`, written by `kit:sync` (and `vendor/imbatranim-ui/src` only if the sync changes it; it is never edited by hand).
- Corpus: [wiki/status.md](../../wiki/status.md) (one dated line) and [log.md](../../log.md).

## Files you must NOT touch

- Any file under `vendor/` by hand. The kit changes in imbatranimOS and arrives through `kit:sync`.
- Source, tests and styles. Expect none to change: no app imports Base UI.
- `server/`, `os/`, the groups' `os/descriptor.template.json`.

## What to do

One commit for the bump: `The kit snapshot moves to imbatranimOS <short hash> (Base UI 1.9.0)`, as the earlier sync commits are named.

1. **Baseline.** On the untouched tree run `npm run typecheck`, `npm test`, `npm run lint` and `npm run build:os`, and record the results and the test count. Note that `npx prettier --check .` already fails on three files today (see brief 08); that is not this brief's.
2. **Check the range.** In the OS checkout, run `git diff --stat 95b331d <brief 85's commit> -- packages/ui` and `git show <commit>:package-lock.json`'s resolved `@base-ui/react` (read `packages["node_modules/@base-ui/react"].version`). The diff should be empty and the version 1.9.0. Anything else goes in the outcome note before you continue.
3. **Sync.** `npm run kit:sync -- <os-checkout> <brief 85's commit>`, then `npm install`. Write down every line `kit:sync` prints under `pin`. Check:
   - `package.json` reads `"@base-ui/react": "1.9.0"`;
   - the lockfile has one copy of `@base-ui/react`, at 1.9.0. If npm nested a copy, find who asks for the older range with `npm explain @base-ui/react`, and never use an `overrides` entry.
4. **Verify.** `npm run kit:sync -- <os-checkout> <commit> --check`, `npm run typecheck`, `npm test`, `npm run lint`, then `npm run build:os`, `npm run build:os --workspace=games`, `--workspace=accessories` and `--workspace=developer`. Fix only what 1.9.0's types or behaviour break, and put each fix in the outcome note. The tests that mount the kit (`packages/shared/src/testing`, the apps' jsdom tests) run the real components, so a behaviour change in a dialog, select or tooltip shows there first.
5. **Behaviour in the desktop.** Install the suite into a local imbatranimOS built on brief 85's commit ([docs/getting-started.md](../../../docs/getting-started.md), "See the apps in the OS"). In one window each of Docs, PDF, CAD and Todo, check the kit parts the apps use: a dialog opens, closes on Esc, returns focus to its opener and traps Tab; a Select opens at its trigger and shows the label, not the value; a tooltip appears after its delay; a `ScrollArea` list scrolls. Compare with the same walk on the old pin (the baseline commit in a second install) and list every difference.
6. **Corpus.** One line in [wiki/status.md](../../wiki/status.md), a [log.md](../../log.md) entry with the pin list, and `bash corpus/lint.sh` clean.

## Acceptance

- [ ] `grep -rn '"@base-ui/react"' --include=package.json . | grep -v node_modules` prints exactly one line, `"@base-ui/react": "1.9.0"`, with no `^` or `~`.
- [ ] `node -e "const p=require('./package-lock.json').packages;console.log(Object.entries(p).filter(([k])=>k.endsWith('/@base-ui/react')).map(([k,v])=>k+' '+v.version).join('\n'))"` prints one line, ending `1.9.0`.
- [ ] `npm run kit:sync -- <os-checkout> <commit> --check` exits 0.
- [ ] `git diff 6538699..HEAD --name-only` lists only `package.json`, `package-lock.json`, `vendor/imbatranim-ui/COMMIT` and corpus files. If the sync also changed `vendor/imbatranim-ui/src`, every changed path is in the outcome note with the OS commit that made it.
- [ ] `grep -rnE "OTPFieldPreview|sanitizeValue" --include=*.ts --include=*.tsx . | grep -v node_modules` prints nothing.
- [ ] `npm run typecheck`, `npm test`, `npm run lint` and the four `build:os` runs pass, and the test count equals the baseline's.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 08 runs `kit:sync --check` again after its reformat, and it must stay green: `vendor` is in `.prettierignore` and `eslint.config.js` already.
- Brief 09 syncs again at the last commit of imbatranimOS's brief 87, which adds kit components and the type and z-index scales.
- imbatranimOS's brief 86 reformats the whole kit. When the owner later syncs at or after that commit, the diff of `vendor/imbatranim-ui/src` shows every file changed. That is expected and is not reviewed line by line.

## Outcome (2026-11-10)

Built in `40450da`. `kit:sync` at imbatranimOS `dcdb648` (brief 85) moved one
pin, `@base-ui/react` 1.6.0 to 1.9.0, and `vendor/imbatranim-ui/COMMIT`; the
other 12 tracked pins did not move and `vendor/imbatranim-ui/src` is
unchanged (`git diff --stat -- vendor/`: `COMMIT`, 1 line). The lockfile holds
one `@base-ui/react` at 1.9.0, `@base-ui/utils` 0.3.1 to 0.5.0, no nested copy.
One forced test edit: the commit named in
`packages/shared/src/build/kitSnapshot.test.ts:246`.
Checks: `kit:sync --check` 0; typecheck, lint and the four `build:os` runs
pass; tests 911 of 914 pass with 3 skipped, as many as the baseline. The PDF
app test ("draws the first page with pdf.js alone") timed out in the full run
both before and after the bump and passes alone. Skipped: the walk in a local
imbatranimOS (step 5), so 1.6.0 to 1.9.0 behaviour in the desktop is unwalked.
