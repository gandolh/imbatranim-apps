# Task 16: Slides' keys act where their job is, and three small phone and desktop fixes

**Depends on:** briefs 14 (Tab only on the slide) and 15 (the undrawn screens fit a phone).

**Runs before:** nothing. **Runs after:** 15.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

Filed 2026-11-19 from the owner's backlog grill: the keys outside the slide
(brief 14's outcome, "Other window-wide keys") and brief 15's two follow-up
questions (imbatranim-apps-15 #2 and #3), plus the em dash left in
Solitaire (imbatranim-apps-11 #3).

## Context

- **Slides' keys.** Brief 14 scoped Tab to the slide. The editor's key
  handler (`apps/slides/src/editor/Editor.tsx`, around line 720) still acts
  window-wide:
  - Delete and Backspace delete the selection whatever non-text control has
    focus (a focused button, the navigator);
  - the arrows nudge the selection unless a button has focus;
  - PageUp, PageDown, Home, End and Space step slides from anywhere.

  Text fields are skipped already.
- **CAD's Layers dialog at 1280.** The CURRENT and NAME column heads still
  touch (the 52 px CURRENT column). Brief 15 kept desktop layouts.
- **REST client's URL on a phone.** The URL field is about 103 px wide at
  360 (133 at 390), sharing its row with the method, Send and Save
  (`developer/apps/rest-api-client/src/components/RequestBuilder.tsx`).
- **Solitaire's win line** reads "You won in N moves — F2 deals again."
  (`games/apps/solitaire/src/Solitaire.tsx:333`). The copy rules allow no em
  dash in user-visible text.

## Owner decisions (2026-11-19)

1. **Slides' keys split by job**, the way Google Slides and PowerPoint work:
   - **Shape keys** (Delete, Backspace, the arrows) act only while the slide
     (the canvas) has focus.
   - **Slide keys** (PageUp, PageDown, Home, End) work anywhere in the
     window except inside a control that uses those keys itself (a text
     field, a list, a slider, the navigator if it takes them).
   - **Space** only presses the focused control. It steps slides only in the
     presenter view, as today.
2. The Layers dialog's heads must not touch at 1280; the REST URL gets a row
   of its own on a phone. Both are fixes, not redesigns: desktop layouts stay
   as they are apart from the Layers column, and the phone breakpoint is the
   kit apps' `max-[600px]:`.

Technical defaults: the thumbnails keep whatever keys they take today
(arrows between slides, Delete removing a slide if it does); say in the
outcome what they do.

## Files you OWN

- `apps/slides/src/editor/Editor.tsx` and its tests (`App.test.tsx` or a test
  beside the editor)
- `apps/cad/src/ui/LayerDialog.tsx`
- `developer/apps/rest-api-client/src/components/RequestBuilder.tsx` and its
  test
- `games/apps/solitaire/src/Solitaire.tsx`
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md)

## Files you must NOT touch

- `vendor/imbatranim-ui/` (only the OS's `kit:sync` writes it).
- Presenter's own keys (`apps/slides/src/editor/Presenter.tsx`).

## What to do

1. Slides' key handler as decision 1 says, with tests:
   - Delete on a focused button or the navigator deletes nothing;
   - arrows with focus outside the slide nudge nothing;
   - PageDown from a focused toolbar button steps a slide;
   - PageDown in a text field doesn't;
   - Space on a button presses it and steps no slide;
   - the slide itself keeps every key it has today.
2. CAD's Layers dialog: widen the CURRENT column (or shorten its head) so the
   heads have a gap at 1280; check 390 still fits (brief 15's clip check).
3. REST client: on a phone, the URL field takes its own row under the method,
   Send and Save. Desktop unchanged.
4. Solitaire's win line without the em dash ("You won in N moves. F2 deals
   again.").
5. The overflow spec (`tools/browser/overflow.spec.ts`) at 390 and 360, and
   the Slides focus spec (`tools/browser/focus.spec.ts --grep slides`), in the
   dev container's desktop. Shots: Layers at 1280 light, REST at 360 light and
   390 dark.

## Acceptance

- [ ] The key tests above pass; they fail on today's handler.
- [ ] Layers' heads have a visible gap at 1280; the clip check passes at 390
      and 360.
- [ ] The REST URL is at least 280 px wide at 360.
- [ ] No em dash in Solitaire's visible text.
- [ ] `npm run check` exit 0; `bash corpus/lint.sh` OK; the two specs pass.
- [ ] End move `ready_for_deploy`, owner step: push, re-pin imbatranimOS's
      marketplace descriptors to this repo's last commit, then
      `node cli.ts imbatranim-os server` from the vps-deploy checkout.

## Outcome (2026-11-19)

Built in `75d037b` and `5ba7f07`, local on `main`, not pushed.

- **Slides' keys.** `Editor.tsx`'s window key handler now splits by job. Delete, Backspace and the arrows act only when the event's target is inside the slide canvas (`[data-slide-canvas]`); with nothing selected the arrows on the canvas still step slides, and every other key the canvas had is unchanged. PageUp and PageDown step slides from anywhere in the window except inside a control that takes them itself (`select`, slider, spinbutton, combobox, menu, menubar, tablist, radiogroup, and a listbox other than the slide rail); text fields were already skipped. Home and End do the same, and still only with nothing selected. Space no longer steps slides in the editor at all (it only presses the focused control; the presenter keeps its own); this includes the canvas, where it stepped slides with nothing selected before.
- **The thumbnails** keep what they took: ArrowUp and ArrowDown move between slides (Ctrl or Cmd moves the slide), Delete and Backspace remove the slide. The rail takes none of PageUp, PageDown, Home and End, so those step slides from it.
- **Tests** (`App.test.tsx`, "keys by job"): Delete and Backspace on a toolbar button and on the rail delete no shape, on the canvas they do; arrows outside the canvas nudge nothing and keep the slide; PageDown, PageUp and End from a toolbar button step slides, PageUp in a text field doesn't; Space on a button and on the canvas is not taken. Against the old handler the delete, nudge and Space tests fail (3 of 4); the PageDown test passes on both, because that key already worked from a button.
- **CAD's Layers heads:** the CURRENT column is 76 px (was 52) at desktop widths; the phone grid is unchanged. At 1280 the CURRENT and NAME head texts are 24.4 px apart, and CURRENT fits its column with 21 px to spare.
- **REST client:** on a phone the URL is a row of its own under the method, Send and Save. The kit's `Input` wraps itself in a div, so classes passed to it never reach the flex row; the first attempt (`75d037b`) did nothing (228 px wide at 360 and 390), and `5ba7f07` puts a `contents` box around it that becomes the full-width, last item below 600 px. The URL is 342 px wide at 360 and 372 at 390. Desktop is as before.
- **Solitaire:** "You won in N moves. F2 deals again."
- **Walk** (dev container's desktop, all four groups installed from the scratch clone): the overflow spec against `5ba7f07`, `npx playwright test -c tools/browser/playwright.config.ts tools/browser/overflow.spec.ts --workers=2`: 52 passed, 26 skipped, exit 0 (the clip check included, at 390 and 360). The Slides focus spec (`focus.spec.ts --grep slides --workers=1`), run against `75d037b`: 20 passed, exit 0. Shots are kept in the builder's scratch folder.
- **Run:** `npm run check` exit 0, `bash corpus/lint.sh` OK.
- **Owner step:** push this repo, re-pin imbatranimOS's descriptors for the groups this brief changed (`imbatranim-office.json` for Slides and CAD, `developer.json` for the REST client, `games.json` for Solitaire) to this repo's last commit, then `node cli.ts imbatranim-os server` from the vps-deploy checkout.
