# Task 09: Base UI by the conventions

**Depends on:**

- In this repo: brief 07 (the pin) and brief 08 (the gate, `check-base-ui`, `.claude/rules/apps.md`).
- In imbatranimOS: its brief 87, *Base UI by the conventions*, built and committed, and its brief 85 before it. That brief adds the wrappers this one uses (`Tabs`, `RadioGroup`, `ToggleGroup`, `Toggle`, `Popover`, `Slider`, an `AlertDialog`-based confirm), a `disablePointerDismissal` prop on `Dialog`, the `--z-*` scale, the named type scale, the `--spacing` value and the System theme mode. They reach this repo only through `kit:sync`. **No kit change is planned here**: `vendor/` is never edited, and a kit change is an imbatranimOS brief.
- In the owner's skills library: brief 02, *A base-ui skill, styled with Tailwind* (rules 1-13, `check-base-ui.mjs`), and brief 15, *Enforce the base-ui and code-structure skills in every repo*.
- The owner's grilling of 2026-11-10: Q15, Q16, Q18, Q19, Q40, Q41, Q44, Q57, Q58, Q62.

**Runs before:** 11. Brief 11 changes the look; this one changes structure and behaviour, so its before screenshots show the final structure.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

The owner's call of 2026-11-09 is Base UI everywhere at 1.9.0, styled with Tailwind v4, with the base-ui skill's conventions enforced in each repo. This repo has no Base UI code of its own: the apps import `@imbatranim/ui`, the desktop's kit, which holds the nine Base UI wrappers (`vendor/imbatranim-ui/src/components/`). The wrappers, their Tailwind styling and their theme are imbatranimOS's, and imbatranimOS's brief 87 audits them. What is left here is how the apps **use** the kit.

So this brief has no Tailwind migration (skipped: see the end of Context) and no wrapper set of its own. It audits the apps against rules 1-13, swaps hand-built widgets for the kit's new components once `kit:sync` brings them, and wires `check-base-ui` in this repo's stricter form.

### The two rule sets

The OS's rule 4 in `corpus/wiki/ui-conventions.md` (imbatranimOS) says a missing control goes into the kit, never a private copy, and its rule 1 limits an add-on to `@imbatranim/ui`, `lucide-react`, `react` and `@tanstack/react-query`. The skill's rule 3 ("Base UI only under a `ui/` folder") is therefore stricter here: **an app imports no Base UI at all** (Q15; imbatranimOS's brief 87 reaches the same result for its add-ons). Where the OS's rule is stricter than the skill's, it wins.

### The audit (read 2026-11-10)

Source files only, tests and `fixtures/` excluded: `grep -rn --include=*.tsx --include=*.ts --exclude=*.test.* --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=fixtures <pattern> apps accessories developer games packages/shared/src`. The apps are the folders `apps/`, `accessories/apps/`, `developer/apps/` and `games/apps/`.

| Rule | Result | Where |
|---|---|---|
| 1. Exact pin | 1 pin, `1.6.0` | `package.json:30`; brief 07 moves it to 1.9.0 |
| 2. Subpath imports | 0 imports | no app imports Base UI |
| 3. Base UI only through the kit | 0 violations | `packages/shared/src/build/kitSnapshot.ts` and its test name the package as a string only |
| 4-6. Tailwind on parts, one stylesheet, tokens | n/a for parts; see below | there is no stylesheet file in any app |
| 7. Motion through state attributes | not measured | step 1 counts `transition`, `animate-` and `data-starting-style` uses |
| 8. Floating parts portalled, z-index from tokens | **5** literal `z-[N]` | `apps/pdf/src/reader/PageView.tsx:199` (3), `apps/pdf/src/editor/PageAnnotateLayer.tsx:254` (4), `:292` (6), `:305`, `apps/slides/src/editor/Presenter.tsx:129` (100). Four of the five are stacking inside a page canvas, not floating parts: the audit records each, and only the Presenter's full-screen layer (`z-[100]`) moves to the kit's scale |
| 9. `render` on triggers | 0 | the apps hold no Base UI trigger |
| 10. Select `items` | 0 | the kit's `Select` owns it; 10 files import `Select` |
| 11. No native dialogs | 0 | `window.confirm`, `alert` and `prompt` find nothing; the `confirm(` and `prompt(` calls are the kit's `useConfirm` and `usePrompt` (callers: `apps/cad/src/ui/LayerDialog.tsx`, `accessories/apps/todo/src/Todo.tsx`, and others) |
| 12. Dialogs | **6** `<Dialog` sites that hold forms | `apps/pdf/src/editor/SignatureDialog.tsx:30`, `apps/cad/src/ui/LayerDialog.tsx:83`, `developer/apps/rest-api-client/src/components/AuthDialog.tsx:54`, `EnvironmentDialog.tsx:73`, `CurlDialog.tsx:94`, `accessories/apps/bookmarks/src/Bookmarks.tsx:662` |
| 13. Hand-built widgets | see below | |

**Rule 13, what Base UI 1.9.0 covers** (each is hand-built or native today):

1. **`aria-pressed` buttons: 13 sites in 10 files.** `accessories/apps/todo/src/Todo.tsx:371, 494`, `TodoRow.tsx:194, 336`, `apps/cad/src/ui/StatusBar.tsx:28`, `Toolbar.tsx:99`, `apps/docs/src/Docs.tsx:347`, `apps/pdf/src/editor/AnnotateToolbar.tsx:117, 153`, `apps/pdf/src/shell/ToolButton.tsx:35`, `apps/slides/src/editor/Toolbar.tsx:134`, `developer/apps/git-gui/src/components/DiffView.tsx:67`, `developer/apps/rest-api-client/src/components/RequestBuilder.tsx:410`. Per Q41 and Q57, a **choice of one** becomes `RadioGroup` and an **on/off** becomes the kit's `Toggle`. Provisionally the choices are `AnnotateToolbar.tsx:117` (a colour swatch), `ToolButton.tsx:35` (the active tool) and `TodoRow.tsx:336` (an option in a row of buttons); the rest are on/off. Step 3 reads each before it decides. A picker that saves on each choice uses the guarded `ToggleGroup` (Q41); none of the 13 does today.
2. **Tabs: 2 sets.** `apps/pdf/src/shell/SidePanel.tsx:65, 73` (`role="tablist"`, `role="tab"`) and `apps/pdf/src/editor/SignatureDialog.tsx:140, 143, 152`. They become the kit's `Tabs`.
3. **Native `<select>`: 2.** `apps/pdf/src/forms/FormsPanel.tsx:220` and `accessories/apps/todo/src/Todo.tsx:348`. They become the kit's `Select`. (Todo's sort control is a short list; check it on a phone-width window.)
4. **Native checkboxes: 6.** `apps/pdf/src/organize/OrganizeView.tsx:401`, `accessories/apps/todo/src/TodoRow.tsx:98`, `developer/apps/rest-api-client/src/components/EnvironmentDialog.tsx:195`, `RequestBuilder.tsx:263, 357`, `developer/apps/git-gui/src/GitGui.tsx:700`. The kit's `Checkbox` replaces them. 2 apps already use it.
5. **Native radios: 2.** `apps/pdf/src/forms/FormsPanel.tsx:191` renders a PDF form's radio field and stays native by default (a document's control, not the app's); `apps/cad/src/ui/LayerDialog.tsx:118` picks the current layer and becomes a `RadioGroup` row control if the table layout allows it.
6. **A listbox: 1.** `apps/slides/src/editor/Rail.tsx:61` (`role="listbox"`, the slide rail). Base UI has no listbox that fits a draggable slide rail; it stays, with a recorded exception.
7. **Range inputs: 0.** The apps have none (the kit's volume sliders are imbatranimOS's).

**Considered and left,** each a `tools/conventions.json` entry with its reason: the Slides rail (above); the PDF form radio (above); the `bg-white`, `bg-black` and `text-white` surfaces that are not themed UI: a PDF page, a signature canvas, a thumbnail, and the Presenter's black stage (`apps/pdf/src/editor/SignatureDialog.tsx:165, 190`, `apps/pdf/src/panels/ThumbnailsPanel.tsx:93`, `apps/pdf/src/organize/OrganizeView.tsx:388`, `apps/pdf/src/reader/PageView.tsx:191`, `apps/slides/src/editor/Presenter.tsx:129, 149, 159`); native text, date and time inputs (Q16).

**Rule 5, and the Tailwind brief that is not here.** The apps are already on Tailwind v4: each app's `app.css` is compiled at build time from the classes in its source, as utilities only, against the kit's token file (`packages/shared/src/build/appCss.ts`; [wiki/stylesheets.md](../../wiki/stylesheets.md)). There is no `.css` file in any app, no `*.module.css`, 0 `dark:` variants, and 58 inline `style={{` sites (apps/pdf 8 files, apps/slides 7 files, and one each in CAD, Todo, Bookmarks, Minesweeper; the audit's job is to confirm each is computed geometry). Vendor stylesheets (SuperDoc's, Univer's) are declared in `package.json`. So the skill's rule 5, "one stylesheet, `src/styles/index.css`", cannot hold: the check script's rule 5 gets a `tools/conventions.json` exemption for this repo (a repo with no stylesheet has none to count), and the migration brief for plain CSS is skipped. The only stylesheet that is not generated is `apps/cad/harness/desktop.css`, a dev page for CAD.

### The root font size (Q44)

The apps set **no** root size. The desktop sets 13 px on `html, body, #root`, and the apps inherit it. A build rule keeps it that way: `vendorCss.ts` refuses a vendor stylesheet that sets `html{font-size:...}` (`packages/shared/src/build/vendorCss.test.ts:107`). The spacing utilities read the desktop's variable: a built stylesheet has `var(--spacing,.25rem)` (20 uses in `accessories/dist/os/todo/app.css`, read 2026-11-10), so after imbatranimOS's brief 87 sets `--spacing: 0.203125rem` in the kit's `theme.css`, a `kit:sync` makes the fallback `.203125rem` and the desktop's own value wins at run time. No class changes for spacing.

What does change is rem-sized utilities that do not read `--spacing`. Named sizes compile to a literal `rem` value (`var(--text` has 0 uses in the same file), and a rem is 13 px today and 16 px after the move:

- `apps/pdf/src/app/EmptyState.tsx:19` `text-lg`, `:15` and `developer/apps/git-gui/src/components/RepoBar.tsx:144` `max-w-md`, and `apps/pdf/src/app/EmptyState.tsx:38` `max-w-sm`: **4 sites**.
- `apps/cad/harness/desktop.css:55-66` copies the desktop's 13 px onto `html, body, #root` for the dev page. It moves onto `body` the same way imbatranimOS does.
- The 216 `text-[Npx]` classes (41 files: 87 of 11 px, 86 of 12 px, 24 of 10 px, 13 of 13 px, 2 each of 8 and 14 px, and one each of 18 px and `2.2rem`) are pixels and do not move. Q62 asks for named scale entries instead; they come from the kit.

### The theme switch (Q18) and the phone menu (Q40)

The Light / Dark / System switch is the desktop's (imbatranimOS's brief 87), not each app's: an app reads the resolved appearance through `useSystem()` and its tokens follow. This repo adds no switch, no `data-theme` code, and no `@custom-variant dark` (it has 0 `dark:` uses, and the OS's rule 7 forbids the variant). Q40's drawer does not apply: no app has a phone navigation panel; a window's width is the desktop's.

## Owner decisions

Settled 2026-11-10 (the numbers are the skills library's open questions):

1. **Q15:** apps import no Base UI. The kit is the one `ui/` folder an app may reach.
2. **Q16:** native text, date and time inputs stay native.
3. **Q18:** the switch is the desktop's, light by default; apps add none.
4. **Q19:** done when before and after screenshots at 1280 and 390 px show no visible change to layout or colour. A few pixels of spacing needn't be fixed or listed.
5. **Q41, Q57:** a filter or a choice of one is `RadioGroup` (`Tabs` where it switches panels); a picker that saves on each choice is a guarded `ToggleGroup`.
6. **Q44:** the root size sits on `body`. Here that is the dev page's CSS only; the 4 rem-sized sites are pinned to their pixel values.
7. **Q58:** a dialog that holds a form sets `disablePointerDismissal` (a prop the kit gains in imbatranimOS's brief 87). It closes with Cancel, the X or Esc.
8. **Q59:** wrappers live in the kit. This repo adds none.
9. **Q62:** a named type scale; tests select by role, and `data-testid` only where no role fits (the apps have 18 `data-testid` in source and 1 class selector in tests, `grep -rn "querySelector(['\"]\.[a-z]" --include=*.test.tsx --include=*.test.ts .`).

## Owner decisions (defaults)

- **The 5 kit `Dialog` sites that are read-only or pick-only.** Default: `CurlDialog.tsx:94` (shows a command to copy) and `Bookmarks.tsx:662` (picks a folder) are **not** forms, so they keep outside-tap dismissal; the other four set `disablePointerDismissal`. Step 2 reads each. *Question for the owner:* is a dialog that only picks a folder a form for Q58?
- **PDF's radio form field stays native** (above). *Question for the owner:* should a PDF's own form controls be left native, as the document's content, always?

## Files you OWN

- The app source files named in the audit, for the widget swaps, the `disablePointerDismissal` prop, the 4 rem-sized sites and the `z-[100]` token.
- `apps/cad/harness/desktop.css` (the `body` move).
- `vendor/imbatranim-ui/` **only through `kit:sync`** (`COMMIT` and the snapshot), never by hand.
- `eslint.config.js` (the Base UI restriction, if brief 08 did not cover a folder), `tools/conventions.json` (the exceptions), `.claude/rules/apps.md`.
- The tests for the swapped widgets, including any that select by class name.
- Corpus: [wiki/stylesheets.md](../../wiki/stylesheets.md) (rem-sized utilities), [wiki/decisions.md](../../wiki/decisions.md) (the stricter rule 3), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `vendor/imbatranim-ui/src` by hand. A control the kit lacks, or a prop it needs, is an imbatranimOS brief; stop and report it.
- `server/`, the build code in `packages/shared/src/build/` and the descriptors.
- The look: colours, radii, fonts and the layout of any screen (brief 11).
- The copy and the behaviour of a swapped widget: arrow keys, Esc, the save and undo flows.

## What to do

One commit per step, with `npm run check` green after each (`check-base-ui` runs `--warn-only` until step 6).

1. **Before.** Run `check-base-ui` strict and record the counts by rule. Install the suite into a local imbatranimOS and take screenshots at 1280 px and at a phone-width window (390 px: the desktop in a phone viewport, each window at its smallest size), in Apricot light and Classic dark, kept out of git, of Docs, Sheets, Slides, PDF (reader, signature dialog, side panel), CAD (layer dialog), Todo, Bookmarks (the move dialog), Git GUI and REST Client (the auth and environment dialogs). Count `transition`, `animate-` and `data-starting-style` uses for rule 7, and read the 58 inline `style` sites and list any that are not geometry.
2. **Sync the kit.** `npm run kit:sync -- <os-checkout> <last commit of imbatranimOS's brief 87>`, `npm install`, then `npm run typecheck`, `npm test` and `npm run build:os`. Record every pin and path the sync changed. `SHARED_KIT_VERSION` must still read 1; if it does not, stop.
3. **The widget swaps.** In order, one commit each: (a) `disablePointerDismissal` on the form dialogs; (b) the 13 `aria-pressed` buttons onto `Toggle` or `RadioGroup`; (c) the two tab sets onto `Tabs`; (d) the 2 selects onto `Select`; (e) the 6 checkboxes and `LayerDialog.tsx:118` onto the kit's controls. Keep each swap's keyboard behaviour: a `RadioGroup` chooses on arrow keys (Q41).
4. **Sizes.** Pin the 4 rem-sized sites to the pixel values they have in the desktop today (read them with `getComputedStyle` before the sync; at 13 px a `max-w-md` is 364 px and a `max-w-sm` 312 px, a `text-lg` 14.625 px, which Q19 lets round to the nearest scale entry). Put `apps/slides/src/editor/Presenter.tsx:129`'s `z-[100]` on the kit's z scale. Move the dev page's 13 px onto `body`. Move the 216 `text-[Npx]` classes onto the kit's named sizes. The kit's `cn()` already knows the new names.
5. **Conventions.** Add `tools/conventions.json` with the exceptions above (the Slides rail, the PDF form radio, the white and black surfaces, the 4 stacking `z-[N]`, the no-stylesheet rule 5), each with its reason. Update [wiki/stylesheets.md](../../wiki/stylesheets.md) and [wiki/decisions.md](../../wiki/decisions.md).
6. **Drop `--warn-only`** from `check-base-ui` in `check:conventions`.
7. **After.** The same screenshots, compared with step 1's. Write the [log.md](../../log.md) entry, run `bash corpus/lint.sh` clean.

## Acceptance

- [ ] `grep -rn "@base-ui/react" apps accessories developer games server packages/shared/src --include=*.ts --include=*.tsx | grep -v "build/kitSnapshot"` prints nothing.
- [ ] `check-base-ui` strict reports 0 for rules 1, 2, 3, 8, 9, 10 and 11, and its counts for rules 5 and 7 are in the outcome note.
- [ ] `grep -rn --include=*.tsx --exclude=*.test.tsx -E "aria-pressed=|role=\"tab" apps accessories developer games` lists only the sites `tools/conventions.json` excepts (none are expected).
- [ ] `grep -rnE --include=*.tsx --exclude=*.test.tsx "<select|type=\"(checkbox|radio)\"" apps accessories developer games` lists only `apps/pdf/src/forms/FormsPanel.tsx` (the excepted PDF radio).
- [ ] `grep -rnE --include=*.tsx --exclude=*.test.tsx "text-\[[0-9]+px\]" apps accessories developer games` prints nothing, and `grep -rnE --include=*.tsx "\b(text-lg|max-w-md|max-w-sm)\b" apps accessories developer games` prints nothing.
- [ ] `grep -o "var(--spacing,[^)]*)" accessories/dist/os/todo/app.css | sort -u` (after `npm run build:os --workspace=accessories`) prints `var(--spacing,.203125rem)` once the OS value reached the kit snapshot.
- [ ] A test shows each swapped control with its keyboard behaviour (arrow keys on the radio sets, Space on a toggle, Esc on a dialog), and a form dialog staying open on an outside click.
- [ ] The before and after screenshots, at 1280 and 390 px, in Apricot light and Classic dark, show no visible change in layout or colour (Q19).
- [ ] `npm run check` passes, and `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 08's gate runs everything above; this brief turns `check-base-ui` strict.
- Brief 11 changes the token values on top of this structure. The sizes pinned in step 4 are pixels, so the redesign's scale does not move them.
- imbatranimOS's brief 87 changes `Dialog` and `ConfirmDialog` additively, so `SHARED_KIT_VERSION` stays 1. If it ships a smaller kit than this brief assumes (no `Tabs`, say), steps 3(c) and the matching swaps wait for it, and the rest go ahead.
