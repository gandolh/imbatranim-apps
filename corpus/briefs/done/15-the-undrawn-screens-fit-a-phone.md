# Task 15: The undrawn screens fit a phone

**Depends on:** brief 11 (its 390 px shots found the cuts; `tools/browser` holds the overflow spec).

**Runs before:** nothing. **Runs after:** 11.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../../CLAUDE.md)).

## Context

Brief 11 gave the undrawn screens the app bar's and the status band's height and surface. It kept their layouts, as the direction sheet ruled. Its 390 px shots (Apricot light, in the dev container at `aca26c0`) show controls cut off by their own pane. The page doesn't scroll sideways, so the overflow spec's `scrollWidth` check passes them.

- **REST API Client:** the sidebar and the request builder stay side by side at 390. The URL field shrinks to a sliver, Send is cut to "Sen", and the sidebar's saved URLs are cut.
- **CAD:** the status bar's OSNAP toggle is cut at the right edge. In the Layers dialog, the CURRENT and NAME column heads run into each other.
- **Bookmarks:** the search field is cut to "Searc".
- **Git GUI:** the file list and the diff stay side by side. The diff's head wraps ("Compare with HEAD", "Stage hunk") and is cramped, though nothing is cut.

## Decisions (from the todo, 2026-11-15)

- Below the phone breakpoint (the kit apps' `max-[600px]:`), the REST client and Git GUI stack their two panes: the list first, and the request or the diff as its own view with a way back, the way Notepad shows one view at a time with a back arrow at the left of its bar. Desktop layouts stay exactly as they are.
- CAD's status toggles and Bookmarks' bar wrap or move into a More menu on a phone. The Layers dialog's column heads don't run into each other.
- A new check beside the `scrollWidth` one fails when a control is clipped by an ancestor (its rect outside the nearest box whose `overflow` isn't `visible`), at 390 and 360, on every screen the overflow spec covers. A drawn screen (Docs, Sheets, Slides, PDF) that fails it isn't redesigned: the outcome lists the failure and the spec allow-lists it with the reason, unless the fix is one line.
- Touch targets on a phone stay 44 px or more. Every new string follows the copy rules (no em dash in user-visible text).
- A call the todo doesn't make (what the back control is, which actions go into More) takes the one Notepad or the File Manager made, and the outcome lists it.

## Files you OWN

- `developer/apps/rest-api-client/src/`: `RestApiClient.tsx`, `components/Sidebar.tsx`, `components/RequestBuilder.tsx`, the dialogs, and tests beside them
- `developer/apps/git-gui/src/GitGui.tsx` and a test beside it
- `apps/cad/src/ui/StatusBar.tsx` and `LayerDialog.tsx`
- `accessories/apps/bookmarks/src/Bookmarks.tsx`
- `tools/browser/desktop.ts`, `overflow.spec.ts` and `screens.ts`
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md)

## What to do

1. The clip measure in `tools/browser/desktop.ts`, beside `phoneFit`, and its check in `overflow.spec.ts`. Run it once against today's install to see what it finds.
2. The REST client's and Git GUI's stacked phone views, and the steps in `screens.ts` that reach their screens on a phone.
3. CAD's status bar and Layers dialog, and Bookmarks' bar.
4. The overflow spec at 390 and 360 in the dev container's desktop, and shots of the four apps' screens at 390 (Apricot light and dark) and 360 (light), beside brief 11's.

## Acceptance

- [ ] At 390 and 360 the REST client and Git GUI show the list first, and the request or the diff as its own view with a way back. At 1280 they are as before.
- [ ] On a phone CAD's status toggles, snap settings and units are all reachable and none is cut; the Layers dialog's heads don't collide.
- [ ] Bookmarks' search field is whole on a phone.
- [ ] The overflow spec, with the clip check, passes at 390 and 360 on every screen it covers; an allow-listed drawn screen carries its reason.
- [ ] Every control added or moved on a phone is 44 px or more; no new string has an em dash.
- [ ] `npm run check` exits 0, and `bash corpus/lint.sh` ends clean.

## Outcome (2026-11-17)

Built in `f2df248`, `44a37d5`, `01409a3`, `8da6637` and `39a8fd9` (promoted in `ae3f239`), local on `main`, not pushed. The first builder's session ended on 2026-11-15 after `44a37d5`, with the CAD and Bookmarks work uncommitted; the resume read it, kept it, and finished it.

- **The clip check** (`tools/browser/desktop.ts`, `clippedControls`, beside `phoneFit`): a control fails when its rect reaches outside the nearest box whose `overflow` isn't `visible`, or outside the screen; inside a box that scrolls down only its sides count. It walks the window, any open dialog and, since `01409a3`, any open menu (menu items count as controls). A control inside the screen's vendor part is marked `vendor: ` (`8da6637`). `overflow.spec.ts` runs it on every phone screen. Its first run, before the fixes, failed 17 of 48: REST (every screen), CAD and its Layers dialog, Git's diff at 360, Sheets and PDF's annotate panel. Bookmarks passed it: its input shrank rather than overflowed, so the shots prove that one.
- **Allow-listed drawn screens**, each with its reason in the spec: Sheets, every `vendor:` finding (Univer's own controls cut by Univer's own boxes: "Close sidebar" in its closed sidebar, every run; its ribbon's last buttons and its "More", cut by its ribbon toolbar, and its font field, cut by its own wrapper, at 390 in one of the three runs after the fixes; a ribbon button at 360 in the first run); PDF's annotate panel, "Custom colour" (the native colour input is cropped to a swatch by its label on purpose).
- **REST client and Git GUI** (`44a37d5`): below 600 px the list shows first; the request or the diff is a view of its own with a Back arrow (Lucide `arrow-left`, 44 px) at the left of its bar, as Notepad does. The list's first row opens the other view when nothing is picked: REST's "Request" row (it shows the current method and URL), Git's "History" row. Picking a saved request, a history entry or a changed file opens its view. The REST dialogs' content is capped at the screen's width less 56 px. At 1280 both are as before.
- **CAD** (`01409a3`, `39a8fd9`): on a phone the status bar keeps the coordinates and a More button (Lucide `ellipsis-vertical`, 44 px, as Slides' More); More opens the kit's menu with Ortho, Polar tracking, Object snaps, the six snaps, the four polar steps and the three units, each checked as it stands. The Layers table takes two lines per layer on a phone: current, name, on, freeze, lock and delete, then colour and linetype at 44 px, each filling half the line. The heads fit their cells with no overlap at 390 and 360 (measured).
- **Bookmarks** (`01409a3`): on a phone the search takes a row of its own, 44 px tall; its input is 336 px wide at 390 (306 at 360) for a 135 px placeholder, and its Clear button is 44 px.
- **Measured on a phone** (390 and 360): More, both Back arrows and the Clear button 44 x 44; the Request and History rows and the Layers pickers 44 tall. Under 44: the kit's menu rows (26.5), which now hold CAD's status toggles, as they hold Slides' and PDF's More; this repo can't change them. Under 44 and not moved by this brief: the Layers dialog's radio (11), checkboxes (13), delete (16), New layer (24.5) and the kit's dialog Close (24), Bookmarks' New folder, Import and Export (28), REST's Send (32).
- **Walk:** the overflow spec, `npx playwright test -c tools/browser/playwright.config.ts tools/browser/overflow.spec.ts --workers=2` with `EXPECT_REF=39a8fd9`, headless on the host against the dev container's desktop with the three groups installed from `39a8fd9`: 52 passed (26 screens at 390 and 360), 26 skipped (the 1280 project), exit 0. `npm run check` exit 0 (91 files, 951 passed, 3 skipped).
- **Shots** (outside git), named `<screen>-<look>-<width>.png`, from `39a8fd9`: `rest`, `rest-request`, `rest-auth`, `rest-environments`, `rest-curl`, `git`, `git-diff`, `git-history`, `cad`, `cad-more`, `cad-layers` and `bookmarks` (plus `bookmarks-query`) at 390 in Apricot light and dark and at 360 in light, and the screens that exist at 1280 in light. The before shots are brief 11's: `rest-*-light-390`, `git-light-390`, `git-diff-light-390`, `cad-light-390`, `cad-layers-light-390`, `bookmarks-light-390`. The 1280 pairs differ only in the window's position and size.
- **Deviations:** the Request and History rows are this brief's call (the todo names the back arrow, not how the list reaches a view with nothing picked); More's items are all of the status bar's toggles, snaps, polar steps and units, as PDF's More holds what its bar drops; the check also walks menus and marks vendor parts, so Sheets' allow-list matches the mark, not Univer's class names.
- **Concerns, not fixed:** at 1280 the Layers dialog's CURRENT and NAME heads still touch (the desktop's 52 px column, as before; desktop layouts were out of scope). At 360 a long colour name ("7 White / black") wraps to two lines inside its picker. The REST request's URL field is about 103 px wide at 360 (133 at 390), sharing its row with the method, Send and Save. `focus.spec.ts` and `motion.spec.ts` gained a filter that skips the phone-only screens and haven't run since. `DESIGN.md`'s "The other screens" still says those screens keep their layouts. The menu rows, the 1280 heads and the URL field are board questions.
- **Owner step:** push this repo, re-pin imbatranimOS's catalog descriptors `imbatranim-office.json`, `accessories.json` and `developer.json` to this repo's last commit (it supersedes the pins in briefs 11-14), then `node cli.ts imbatranim-os server` from the vps-deploy checkout.
