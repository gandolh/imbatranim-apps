# Task 08: The house style and the quality harness

**Depends on:**

- In this repo: brief 07 (the bump), so the gate starts on the final pin.
- In imbatranimOS: its brief 86, *The house style and the quality harness*, for the shared method. Nothing is needed from it to build this one.
- In the owner's skills library:
  - brief 27, *A house style, and a quality harness that enforces it*: the vendored `house-style` copy at `v1.0.0`, the `house-style` skill, and the plugin's `Stop` and `PostToolUse` hooks;
  - brief 15, *Enforce the base-ui and code-structure skills in every repo*: how the convention checkers are wired and when they run `--warn-only`.
- The owner's grilling of 2026-11-10: Q1, Q5-Q14, Q45-Q51 of the skills library's open questions.

**Runs before:** 09, 10 and 11. The reformat touches 352 of 376 TypeScript and JavaScript files, and those briefs rewrite or move many of them. Formatting first gives one clean reformat commit.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

The owner's call of 2026-11-09: the researched conventions are enforced in every repo, best practice and the house style kept. The skills library's brief 27 sets a two-layer harness: the repo's own gate (`npm run check` and the fast `npm run check:fast`), and the Claude Code layer (the plugin's `Stop` hook runs `check:fast`, its `PostToolUse` hook formats a saved file, `.claude/rules/` scoped by `paths:`, a short root `CLAUDE.md`).

This repo is a style outlier: single quotes, no semicolons, `trailingComma: "es5"`, width 100. It already has Prettier, with `prettier-plugin-tailwindcss`. The owner's calls (Q8, Q9, Q51) move it to the house format: width 120, double quotes, semicolons, `trailingComma: "all"`.

### What the repo has today (read 2026-11-10)

- **`.prettierrc`:** `semi: false`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`, the Tailwind plugin. **`.prettierignore`:** `vendor`, `dist`, `corpus`, `package-lock.json`, `LICENSE`. So `vendor/` is already ignored, and so is the whole corpus.
- **`npm run format:check` fails today** (`npx prettier --check .`, Prettier 3.8.3): three files differ, `apps/cad/src/App.test.tsx`, `apps/sheets/src/engine/firstCalculation.ts` and `apps/sheets/src/engine/univer.test.ts`. The reformat fixes them.
- **Scripts** (`package.json:20-28`): `build:os`, `typecheck` (`tsc -b`), `lint` (`eslint .`), `test` (`vitest run`), `format`, `format:check`, `kit:sync`. No `check`, no `check:fast`, no `pretest`.
- **`tsconfig.base.json`:** `strict`, `verbatimModuleSyntax` (line 9), `erasableSyntaxOnly` (line 15), `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `moduleResolution: "bundler"` (line 6) and `allowImportingTsExtensions` (line 8). Six tsconfigs extend it: `tsconfig.app.json`, `tsconfig.node.json`, and one each in `games/`, `accessories/`, `developer/` and `packages/pdfcore-engine/`, which already sets `noUncheckedIndexedAccess`, `noImplicitOverride` and `isolatedModules` on its own. Keep `bundler` and the `.ts` import suffixes: the suite's server runs under Node's type stripping, with no build (`server/package.json:2`'s description), and a `.js` suffix would not resolve there.
- **`eslint.config.js`** (160 lines): `@eslint/js` recommended, `typescript-eslint` recommended (untyped, 8.64.0), `react-hooks` recommended, `react-refresh`, `eslint-config-prettier`, `_`-prefixed unused names, a `no-restricted-imports` for `@imbatranim/core` and `@imbatranim/ui/*`, and PDF's first-page import rules. `vendor` is in `globalIgnores`. The block at `eslint.config.js:57-63` allows `@ts-ignore` with a description in `packages/pdfcore-engine`, but no `@ts-ignore` exists there any more (`git ls-files | grep -E "\.(ts|tsx)$" | xargs grep -n "@ts-ignore"` finds only that comment), so the block is dead.
- **`.npmrc`:** `save-exact=true`. **`.gitignore`:** `node_modules`, `dist`, `*.tsbuildinfo`, `coverage`. No `.claude` line, so `.claude/rules/` will be tracked.
- **No root `CLAUDE.md`, no `.claude/`.** The only `CLAUDE.md` is [corpus/CLAUDE.md](../../CLAUDE.md), loaded only when an agent reads a file under `corpus/`. Its project invariants (AGPL, TypeScript only, no hosted CI, exact pins, the shared kit) apply to the whole repo.
- **No build output is committed,** and the OS runs `npm ci` then `npm run build:os` from source. Devdependencies the harness adds therefore install in the OS's build too, and `npm ci` time grows.

### Measured on 2026-11-10

On a scratch copy (`rsync` without `node_modules`, `.env` and `dist`, the real `node_modules` linked, so nothing was installed). Prettier 3.8.3, TypeScript 6.0.3, typescript-eslint 8.64.0. The TypeScript and JavaScript files outside `vendor/`: 376 files, 62,370 lines (`git ls-files | grep -E "\.(ts|tsx|js|mjs|cjs)$" | grep -v "^vendor/" | xargs cat | wc -l`).

**Prettier churn.** The new format (double quotes, semicolons, `trailingComma: "all"`, the Tailwind plugin, Markdown, `vendor`, `dist`, `corpus` and the lockfile ignored) at each width, against the tree today. Command: `npx prettier --config <new config> --ignore-path <ignore> --print-width <w> --write .`, then `git diff --numstat`.

| `printWidth` | Files changed | Lines added | Lines removed |
|---|---|---|---|
| 100 | 350 | 27,214 | 27,372 |
| **120** | **355** | **26,764** | **29,603** |
| 130 | 355 | 26,650 | 30,197 |
| 150 | 358 | 26,559 | 31,090 |

Two costs sit in that number. The first is the quote, semicolon and trailing-comma move, which touches almost every line that has a string or ends a statement: 27,372 lines in 350 files at the current width 100. The second is the width move on top of it, measured against the width-100 result:

| Width | Files | Added | Removed |
|---|---|---|---|
| 120 | 221 | 982 | 3,617 |
| 130 | 234 | 1,156 | 4,499 |
| 150 | 244 | 1,368 | 5,695 |

The estate width is 120 (Q8, Q51). Width 120 changes 47% of the lines. Other file types: `os/descriptor.template.json` changes by 1 line added and 10 removed (Prettier joins its arrays at 120); the other JSON, CSS and HTML do not change. The reformat is a one-off cost, and its hash goes into `.git-blame-ignore-revs`.

**The reformat does not break the tests.** After the width-120 reformat on the scratch copy, `npx vitest run packages/shared tools server` passed: 13 files, 123 passed, 1 skipped. Those are the tests that read files and build output. `packages/shared/test/fixtures/` (31 files) is frozen input for them; the run passed with it formatted, but step 3 re-runs it, and any fixture whose bytes matter goes in `.prettierignore`.

**TypeScript flags,** `tsc -p <config> --noEmit <flag>` over the six configs, errors summed:

| Flag | Errors | Where |
|---|---|---|
| none (baseline) | 0 | |
| `isolatedModules` | 0 | |
| `noImplicitOverride` | 1 | `apps/cad/src/engine/dxf/write.ts:169` |
| `exactOptionalPropertyTypes` | 72 | app 35, node 3, games 5, accessories 6, developer 19, pdfcore-engine 4 |
| `noUncheckedIndexedAccess` | 740 | app 482, node 37, games 71, accessories 44, developer 106, pdfcore-engine 0 (already on) |

**Typed lint,** a scratch config with the six rules and the shape rules, `projectService`, 373 files (`apps/cad/harness/` left out, see below):

| Rule | Findings | Where |
|---|---|---|
| `no-floating-promises` | 3 | `apps/docs/src/Docs.tsx:108`, `apps/pdf/src/organize/OrganizeView.tsx:350`, `apps/sheets/src/Sheets.tsx:87` |
| `no-misused-promises` | 1 | `apps/cad/src/shell/dwg.ts:123` |
| `await-thenable` | 1 | `apps/slides/src/App.test.tsx:131` |
| `switch-exhaustiveness-check` (`considerDefaultExhaustiveForUnions: true`) | 0 | |
| `no-unnecessary-type-assertion` | 62 | 37 in source, 25 in tests; 19 are `!` and 43 are `as` |
| `consistent-type-imports` | 10 | 6 in source, 4 in tests (`apps/pdf/src/app/engine.ts:7`, `apps/pdf/src/reader/pdfjs.ts:39`, `packages/pdfcore-engine/src/**` and others) |
| `no-non-null-assertion` | 309 | **58 in source, 251 in tests** |
| `no-explicit-any`, `ban-ts-comment` | 0, 0 | |

`!` by workspace, source and tests together: `packages/pdfcore-engine` 101, `apps/slides` 85, `apps/cad` 31, `apps/pdf` 19, `developer/apps` 17, `accessories/apps` 15, `games` 11, `apps/sheets` 10, `server/src` 9, `apps/docs` 7, `packages/shared` 4. The 19 `!` that `no-unnecessary-type-assertion` flags are fine to remove now; with `noUncheckedIndexedAccess` on (Q50, deferred) most of the rest would become needed.

**Lint time** (warm, WSL): `projectService` 24-31 s, `project` 27 s (two runs of the first), against 17 s for today's untyped `eslint .`. They are the same within noise, so `projectService`. **`tsc -b` alone takes 16 s warm** (18.6 s cold, 15.9 and 16.4 s on two repeats), so it does not get faster on a second run: the configs have `noEmit`. `check:fast` will land in the 20-30 s band the owner accepted (Q10), not the 15 s target.

**The house shapes,** counted over the 376 files:

| Shape | Count | Where |
|---|---|---|
| `enum`, namespace | 0 | |
| `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` | 0 | |
| `TODO` / `FIXME` / `XXX` / `HACK` | 0 | |
| default exports | 7 | all configs: `vite.config.ts:6`, `vitest.config.ts:9`, `eslint.config.js:9`, `games/vite.config.ts:10`, `accessories/vite.config.ts:10`, `developer/vite.config.ts:10`, `apps/cad/harness/vite.config.ts:85` |
| parameter properties | 0 | (`erasableSyntaxOnly` is already on) |
| `process.env` reads | 9 outside the CAD harness | `server/src/index.ts:9, 10` (the server, brief 10); the rest are build or test code: `packages/shared/src/build/exportNames.ts:34`, `kitSnapshot.ts:185`, `kitSnapshot.test.ts:23`, `server/src/convert.test.ts:54`, `apps/cad/src/engine/dxf/roundtrip.test.ts:12`, and two in a fixture, `packages/shared/test/fixtures/os/vendor-styles/apps/v/src/App.tsx:5, 10` |
| `console` | 17 | `tools/kit-sync.ts` 10 (a CLI), `server/src/index.ts:14` and `convert.ts:73` (brief 10), and **5 in app code that need a verdict**: `apps/docs/src/Docs.tsx:131`, `apps/docs/src/engine/superdoc.ts:188`, `apps/pdf/src/reader/PageView.tsx:121, 157`, `apps/slides/src/editor/Editor.tsx:151` |

**Not measured here:** `knip`'s findings and `@vitest/eslint-plugin` recommended's count (neither is installed, and the scratch copy shares the real `node_modules`), and `better-tailwindcss` (the apps have no stylesheet to point it at; see brief 09). Nine tests call `expect(value, message)` (`grep -rnE "expect\([a-zA-Z.]+, [a-zA-Z'\"]+\)\." --include=*.test.ts --include=*.test.tsx .`), so `vitest/valid-expect` needs `maxArgs: 2`.

**Two files the typed lint cannot see.** `apps/cad/harness/` (3 TypeScript files: `main.tsx`, `perf.ts`, `vite.config.ts`) is in no tsconfig, so typed rules fail to parse it. It needs a tsconfig of its own or `allowDefaultProject`. The same holds for `eslint.config.js`.

## Owner decisions

Decided 2026-11-10 (the numbers are the skills library's open questions):

1. **Vendored `house-style`** (Q6, technical call). A copy with a version header, refreshed by a `house-style:sync` script that finds the checkout by name. Here the copy goes in `vendor/house-style/`, which `.prettierignore` and ESLint already skip, and the script goes in `tools/` beside `kit-sync.ts`. No git or tarball dependency.
2. **Prettier at width 120** (Q8, Q51), and the outlier moves to double quotes, semicolons and `trailingComma: "all"` (Q9), in one reformat commit. The Tailwind plugin stays, as in imbatranimOS.
3. **Markdown stays out of Prettier** (Q45): add `*.md` to `.prettierignore`.
4. **tsconfig** (Q11, Q50). Add `isolatedModules` (0 errors) and `noImplicitOverride` (1 fix) to `tsconfig.base.json`. `verbatimModuleSyntax` and `erasableSyntaxOnly` are on already. `noUncheckedIndexedAccess` is **deferred** (740 errors, with the count above), and `exactOptionalPropertyTypes` (72) waits for a later brief.
5. **The six typed rules, the house shapes as errors** (Q12, Q13, Q47, Q48): through `projectService`; `considerDefaultExhaustiveForUnions: true`; `!` an error in source and a warning in tests; `console` allowed in `tools/` and the CLIs; a default export allowed in config files; `no-warning-comments` with `location: "start"`.
6. **`check:fast`** (Q10): a typecheck plus ESLint on the changed files. Up to about 30 s is accepted.
7. **The Claude Code layer lives in the plugin** (Q7); a root `CLAUDE.md` (Q46) and `.claude/rules/`.
8. **The checkers read this repo's roots from `conventions.json`** and config read at import time is allowed (technical call). The roots are the workspaces' source folders, which are not `web/` and `server/`: `apps/*/src`, `accessories/apps/*/src`, `developer/apps/*/src`, `games/apps/*/src`, the three `shared/src` folders, `packages/pdfcore-engine/src`, and `server/src`.
9. **Deploy** (Q1, fact). Nothing here runs in a deploy: the OS builds the suite with `npm ci` and `npm run build:os`, no tests or lint. `npm run check` and the `Stop` hook are the gate.

## Owner decisions (defaults)

- **The 58 `!` in source** are over the threshold of about 20 that brief 27 sets for turning a rule on. Default: `no-non-null-assertion` starts as an **error in source** and a warning in tests, and step 1 fixes the 19 that `no-unnecessary-type-assertion` already flags; the rest get a narrowing or a one-line `eslint-disable` with a reason, counted in the outcome note. *Question for the owner:* turn it on as a warning for source first, and make it an error after a later brief clears `packages/pdfcore-engine` (101) and `apps/slides` (85)?
- **The 5 `console` calls in app code.** Default: each gets a verdict in step 1. A `console.warn` or `console.error` that reports a real failure stays behind an allowance; a stray `console.log` is removed.

## Files you OWN

- `tsconfig.base.json` and the six tsconfigs (to add `incremental` where `check:fast` needs it), `eslint.config.js`, `.prettierrc`, `.prettierignore`, new `.git-blame-ignore-revs`.
- `vendor/house-style/` (new, a copy; never edited by hand) and `tools/house-style-sync.ts`, `tools/conventions.json` (new).
- Root `package.json` (scripts, devDependencies) and `package-lock.json`.
- The reformat: formatting-only changes to every file Prettier covers.
- The fixes the rules ask for: `apps/cad/src/engine/dxf/write.ts:169` (`override`), the three floating promises, the misused promise, the awaited non-thenable, the 10 type imports, the 19 unneeded `!`, and the dead block at `eslint.config.js:57-63`.
- New: `.claude/rules/apps.md`, `.claude/rules/server.md`, `CLAUDE.md`.
- Corpus: [corpus/CLAUDE.md](../../CLAUDE.md) (the hard rules and brief-board move to the root file), [wiki/decisions.md](../../wiki/decisions.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `vendor/imbatranim-ui/`, by hand or by the formatter. `npm run kit:sync -- <os-checkout> <commit> --check` must still exit 0 after the reformat.
- Behaviour. Apart from the fixes above, every change is formatting or configuration.
- `server/` structure (brief 10) and the kit usage (brief 09).
- `os/descriptor.template.json` content. Its formatting may change (see the churn table); its values may not.
- The skills library and the `house-style` repo. A rule that seems wrong here is reported back, not patched locally.

## What to do

One commit per step. After each: `npm run typecheck`, `npm test`, `npm run lint` and `npm run build:os` green.

1. **Vendor `house-style`.** Copy it to `vendor/house-style/` with its version header and add `tools/house-style-sync.ts` and `"house-style:sync"`, modelled on `tools/kit-sync.ts`. Then **measure** and write into the `log.md` entry: `knip` from the preset, `@vitest/eslint-plugin`'s count (set `assertFunctionNames` for any helper a test file uses), the six typed rules again on the real tree, `projectService` against `project`, and the verdict on each of the 5 app `console` calls. Bring any rule over about 20 real findings, or mostly false ones, to the owner before turning it on.
2. **tsconfig.** Add `isolatedModules` and `noImplicitOverride` to `tsconfig.base.json`; put `override` on `apps/cad/src/engine/dxf/write.ts:169`. Cover `apps/cad/harness/` with a tsconfig so typed lint can parse it. The server must still run under type stripping: keep `allowImportingTsExtensions` and the `.ts` suffixes.
3. **Prettier, and the reformat.**
   1. Set `.prettierrc` to `printWidth: 120`, `trailingComma: "all"`, defaults for quotes and semicolons, the plugin kept. Add `*.md` to `.prettierignore`. Commit this alone.
   2. Run `npm run format` when no other work is uncommitted. Commit only that, as `style: format with Prettier`.
   3. Add the commit's full hash to `.git-blame-ignore-revs`, in its own commit. Hand the owner `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
   4. Check `vendor/` is unchanged and `kit:sync --check` exits 0.
4. **ESLint.** Extend the vendored house config, passing the roots from `tools/conventions.json`. The diff in effect:

   | Rule | Today | After | Findings today |
   |---|---|---|---|
   | the six typed rules (`considerDefaultExhaustiveForUnions: true`) | off | error, `projectService` | 3 + 1 + 1 + 0 + 62 + 10 |
   | `no-non-null-assertion` | off | error in source, warn in tests | 58 and 251 |
   | `no-restricted-syntax` on `TSEnumDeclaration` | off | error | 0 |
   | `no-warning-comments` (`todo`, `fixme`, `location: "start"`) | off | error | 0 |
   | `no-console` outside `tools/` and the CLIs | off | error | 5 in app code, 2 in `server/src` |
   | no default export outside `*.config.*` | off | error | 0 (all 7 are configs) |
   | `no-process-env` (`eslint-plugin-n`), scoped to `server/src` outside `config.ts` and tests | off | **warn**; brief 10 makes it an error | 2 (`index.ts:9, 10`) |
   | `@vitest/eslint-plugin` recommended on tests, `maxArgs: 2` on `valid-expect` | off | error | step 1 |
   | `no-explicit-any`, `ban-ts-comment` | error | unchanged | 0 |
   | `react-hooks` recommended | on | unchanged | 0 |
   | `no-restricted-imports` for Base UI (`@base-ui/react`, `@base-ui/react/*`) in every app folder | off | error | 0 |

   The last row is the base-ui skill's rule 3 in this repo's stricter form: apps import only `@imbatranim/ui`. Today's PDF-only rule on `apps/**` covers the Office group but not `accessories/apps`, `developer/apps` or `games/apps`; the new one covers all of them. `no-process-env` is not applied to build code, which passes the environment to child processes on purpose. Fix what the typed rules find, or list each finding left, with its reason, in the outcome note.
5. **The gate.** In the root `package.json`:
   - `check` runs `typecheck`, `lint`, `format:check`, `check:conventions`, `test`.
   - `check:conventions` is `knip` plus the two convention checkers from `vendor/house-style/`. `check-base-ui` runs `--warn-only` until brief 09, and `check-structure` `--warn-only` until brief 10.
   - `check:fast` runs `typecheck`, then ESLint on the files changed against `HEAD` plus untracked ones. No shell-only syntax: the owner works on Windows under WSL.
   - `lint` stays `eslint .`.
   - A `pretest` only if a clean clone needs one. Prove it: clone to a scratch directory, `npm ci`, `npm test`. The packages' `exports` point at `src/*.ts` (`packages/shared/package.json:8`), so none is expected.

   Time `check:fast` warm with one changed file, and `check` in full. Record both.
6. **`.claude/rules/`**, each file under about 40 lines with `paths:` frontmatter, pointing at the skills for the rest:
   - `apps.md` (`paths` the app source folders): import only `@imbatranim/ui`, never `@base-ui/react` or `@imbatranim/core`; React and the kit are the desktop's; an app reaches the OS through `useSystem()`; utilities compile against the kit's tokens, no app stylesheet, vendor styles declared in `package.json` ([wiki/stylesheets.md](../../wiki/stylesheets.md)); no root font size.
   - `server.md` (`paths: ["server/src/**"]`): the code-structure rules once brief 10 lands; until then: the entry runs under type stripping, so `.ts` suffixes and erasable syntax only, and `config.ts` is the only reader of the environment.
7. **Root `CLAUDE.md`,** under about 60 lines: what the repo is, "read [corpus/index.md](../../index.md) first", the commands (`npm run check`, `npm run check:fast`, one test with `npx vitest run <file>`, `npm run build:os` and its three group variants, `npm run kit:sync -- <os-checkout> <commit>`), the places that mislead (no dev server, the apps render only in an OS window; `vendor/` is never edited; a bump or a reformat in imbatranimOS arrives through `kit:sync`), and the hard rules moved from [corpus/CLAUDE.md](../../CLAUDE.md) (no hosted CI, exact pins, never push) with the brief-board section.
8. **Corpus.** A [wiki/decisions.md](../../wiki/decisions.md) entry "The house style, formatted and checked" (width, the vendored copy, the rejected alternatives and why), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md); `bash corpus/lint.sh` clean. The invariant "Win7-classic" in [corpus/CLAUDE.md](../../CLAUDE.md) is stale against the owner's 2026-11-06 call (best UX, not Win7): reword it in this step and say so in the log.

## Acceptance

- [ ] `npm run check` passes. Its time and `check:fast`'s (warm, one changed file) are in the outcome note, and `check:fast` is under about 30 s.
- [ ] `npx prettier --check .` passes, and the reformat is one commit whose hash is in `.git-blame-ignore-revs`. `git diff --stat <hash>^ <hash> -- vendor` prints nothing.
- [ ] The reformat changes no emitted code: `npm run build:os` output (`dist/os`) before and after the reformat commit has the same file list, and `diff -r` of the two shows no difference outside source maps, if any.
- [ ] `npm run kit:sync -- <os-checkout> <commit> --check` exits 0.
- [ ] `grep -nE "isolatedModules|noImplicitOverride|verbatimModuleSyntax|erasableSyntaxOnly" tsconfig.base.json` prints all four, and `npm run typecheck` passes.
- [ ] ESLint reports zero errors with every rule in step 4's table. The counts before and after are in the outcome note, and so is every finding left, with its reason.
- [ ] A deliberate `enum`, `!` in `server/src/app.ts`, `console.log` in `server/src/app.ts`, `// TODO:`, `export default` in a non-config file and `import { Dialog } from '@base-ui/react/dialog'` in `apps/docs/src/Docs.tsx` each fail `npm run lint`. Revert them after.
- [ ] `.claude/rules/apps.md` and `server.md` exist with `paths:` frontmatter, and `.gitignore` has no `.claude` line. The root `CLAUDE.md` is under about 60 lines and lists `npm run check`.
- [ ] With the plugin's hooks on, an edit is formatted on save, and a type error stops the agent at `Stop`.
- [ ] A fresh clone runs `npm ci && npm test` green.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 09 drops `check-base-ui`'s `--warn-only`; brief 10 drops `check-structure`'s and turns `no-process-env` into an error and adds dependency-cruiser; brief 11 runs under this gate.
- imbatranimOS's brief 86 reformats the kit. When the owner syncs at or after that commit, `vendor/imbatranim-ui/src` shows whole-file diffs, and this repo's `.prettierignore` and ESLint ignore keep them out of the gate.
- The owner's plugin hooks format every saved file, so the reformat commit should be made when no other brief has uncommitted work.
