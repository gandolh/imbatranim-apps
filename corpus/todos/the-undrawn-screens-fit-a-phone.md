---
title: The undrawn screens fit a phone
created: 2026-11-15
status: open
tags: [imbatranim-apps, phone]
---

# The undrawn screens fit a phone

Brief 11 gave the undrawn screens the app bar's and the status band's
height and surface. It kept their layouts, as the direction sheet ruled.
Its 390 px shots (Apricot light, in the dev container at `aca26c0`) show
controls cut off by their own pane. The page doesn't scroll sideways, so
the brief's `scrollWidth` check passes them.

- **REST API Client:** the sidebar and the request builder stay side by
  side at 390. The URL field shrinks to a sliver, Send is cut to "Sen",
  and the sidebar's saved URLs are cut.
- **CAD:** the status bar's OSNAP toggle is cut at the right edge. In the
  Layers dialog, the CURRENT and NAME column heads run into each other.
- **Bookmarks:** the search field is cut to "Searc".
- **Git GUI:** the file list and the diff stay side by side. The diff's
  head wraps ("Compare with HEAD", "Stage hunk") and is cramped, though
  nothing is cut.

What to do: below the phone breakpoint, stack the REST client's and Git
GUI's two panes, with the list first and the request or diff as its own
view, the way Notepad and the File Manager do. Let CAD's status toggles
and Bookmarks' bar wrap or move into a More menu. Add a check beside the
`scrollWidth` one that fails when a control is clipped by an ancestor
(its rect outside the nearest `overflow: hidden` box) at 390 and 360.

Shots: the estate build folder's `scratch-apps11/recorded/shots/*-390.png`.
