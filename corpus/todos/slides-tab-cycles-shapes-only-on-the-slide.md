---
title: Slides' Tab cycles shapes only on the slide
created: 2026-11-15
status: open
tags: [imbatranim-apps, keyboard, a11y]
---

# Slides' Tab cycles shapes only on the slide

Slides listens for keys on the whole window (`useTopWindowKeydown` in
`apps/slides/src/editor/Editor.tsx`). Tab and Shift+Tab select the next or
previous shape wherever focus is: the app bar, the navigator, the format
panel or a field in it. So Tab never moves focus inside a Slides window,
and a keyboard user can't reach the toolbar or the inspector. Brief 11's
focus walk found it; the behaviour predates the brief.

PowerPoint cycles shapes with Tab only while the slide pane has focus.
Do the same:

- Tab cycles shapes only when focus is on the slide canvas (or on a
  selected shape in it).
- Everywhere else, Tab follows the normal focus order and leaves the
  slide's selection alone.
- The canvas stays a single Tab stop, and Escape leaves the shape
  selection as it does today.

Then rerun brief 11's focus walk for Slides (`tools/browser`, the slides
screens) and drop the window-wide Tab note from its outcome's "For the
owner" line.
