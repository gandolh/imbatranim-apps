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
