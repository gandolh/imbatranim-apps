# Task 14: Slides' Tab cycles shapes only on the slide

**Depends on:** brief 11 (its focus walk found the window-wide Tab; `tools/browser` holds the walk).

**Runs before:** nothing. **Runs after:** 11.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../../CLAUDE.md)).

## Context

Slides listens for keys on the whole window (`useTopWindowKeydown` in `apps/slides/src/editor/Editor.tsx`). Tab and Shift+Tab select the next or previous shape wherever focus is: the app bar, the navigator, the format panel or a field in it. So Tab never moves focus inside a Slides window, and a keyboard user can't reach the toolbar or the inspector. Brief 11's focus walk found it; the behaviour predates that brief, and the owner's ruling of 2026-11-15 calls it a keyboard trap.

## Decisions (from the todo, 2026-11-15)

- PowerPoint cycles shapes with Tab only while the slide pane has focus. Slides does the same.
- Tab and Shift+Tab cycle shapes only when focus is on the slide canvas (or inside it). Everywhere else in the window (app bar, navigator, format panel and its fields, notes) Tab follows the normal focus order and leaves the selection alone.
- The canvas is a single Tab stop. Escape keeps today's behaviour. The other window-wide keys (Delete, arrows, shortcuts) keep theirs unless they share the bug; any that do are listed in the outcome and left alone.

## Files you OWN

- `apps/slides/src/editor/Editor.tsx`, `Stage.tsx`, and a new test beside them
- `tools/browser/` only if a Slides check encoded the old Tab
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md), brief 11's outcome (one line)

## What to do

1. Scope the Tab handler to the canvas; make the canvas one Tab stop that takes focus when pressed.
2. A Testing Library test: Tab in the format panel moves focus and keeps the selection; Tab on the canvas selects the next shape; Shift+Tab the previous one.
3. The focus walk for the Slides screens in the dev container's desktop.

## Acceptance

- [ ] Tab with focus outside the canvas moves focus and leaves the selection alone; with focus on the canvas it selects the next shape (Shift+Tab the previous).
- [ ] The canvas is one Tab stop; Escape behaves as before.
- [ ] The focus spec for the Slides screens passes against the desktop.
- [ ] `npm run check` exits 0, and `bash corpus/lint.sh` ends clean.

## Outcome (2026-11-15)

Built in `1741101` and `5ed9e3b`, local on `main`, not pushed.

- `Stage.tsx`: the slide canvas (`role="application"`) is `tabIndex={0}` with a `data-slide-canvas` mark and an outline ring on keyboard focus. A press on the slide takes focus for it (the press is prevented, which used to leave focus where it was). `Editor.tsx`: Tab and Shift+Tab cycle shapes only when the event's target is inside `[data-slide-canvas]`. Everywhere else the key is left alone, so the browser's focus order runs and the selection stays. The cycle still wraps, as before; Escape is as before.
- The first ring was `outline-none` plus `focus-visible:outline-2`, which draws nothing in Tailwind 4 (`outline-none` sets the style variable to none); the walk caught it (a 0 px ring on "Slide editor"). `5ed9e3b` uses `outline-0`.
- Test: `App.test.tsx`, "Tab": on the canvas Tab selects a shape, the next Tab another, Shift+Tab goes back; on a button in the format panel Tab and Shift+Tab are not taken and the selection is the same. It fails on the old handler. jsdom doesn't move focus on Tab, so "moves focus" is shown by the key not being prevented, and by the walk below.
- Walk: the focus spec for the Slides screens (`tools/browser/focus.spec.ts --grep slides --workers=2`, headless on the host against the dev container's desktop, the office group installed from `5ed9e3b`): 20 passed, 0 failed, exit 0. Slides' Tab order now runs thumbnails, the app bar, the navigator, "Slide editor", the format panel and the status band, 25 stops; before it stuck on the first. No spec check encoded the old Tab, so none changed.
- Other window-wide keys, not changed: Delete and Backspace delete the selection whatever non-text control has focus (a focused button, the navigator); arrows nudge the selection unless a button has focus (the navigator takes its own arrows first); PageUp, PageDown, Home, End and Space step slides from anywhere. Text fields are already skipped by the hook. These are the same shape as the Tab bug, kept as shortcuts until the owner says.
- Concern: Tab on the canvas still wraps through the shapes, so once a slide has shapes a keyboard user leaves the canvas only with Shift+Tab or a click (Escape clears the selection, the next Tab selects again). A "leave at the ends" rule would fix it; not done, the todo said cycle.
- Run: `npm run check` exit 0 (91 files, 947 tests passed, 3 skipped), `bash corpus/lint.sh` OK.
- **Owner step:** push this repo, re-pin imbatranimOS's `marketplace/imbatranim-office.json` `ref` to this repo's last commit (it supersedes the pins in briefs 11-13; leave `accessories.json` and `developer.json` as brief 11 sets them), then `node cli.ts imbatranim-os server` from the vps-deploy checkout.
