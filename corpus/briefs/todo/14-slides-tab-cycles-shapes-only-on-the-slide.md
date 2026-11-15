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
