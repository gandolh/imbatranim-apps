---
name: imbatranim-apps
description: The apps that install on the imbatranimOS desktop. Tools beside the page, a status band at the foot, every page an honest fixed sheet, on the desktop's own tokens and kit.
source: recorded from what shipped on 2026-11-15 (brief 11), after the owner approved "Tools beside the page" on the estate board on 2026-11-13
tokens: none of its own; every name below is the desktop's, from the kit snapshot's theme.css, and its value is imbatranimOS's
roles:
  title-band: surface-container
  status-band: surface-container
  app-bar: surface-container-low
  navigator: surface-container-low
  inspector: surface-container-low
  annotate-panel: surface-container-low
  bottom-bar: surface-container-low
  desk: desk
  tool: surface-container-lowest, edged outline-variant
  field: surface-container-lowest, edged outline
  labelled-action: surface-container-lowest, edged outline (Download, Present)
  hover: surface-container-high
  pressed: surface-container-highest
  selected: primary-container with on-primary-container, a primary edge
  focus-ring: primary, 2 px
  current-slide-frame: primary
  delete: error
  hairline: outline-variant
fixed:
  slide-selection-frame: "#a04b23"
  paper: white
  presenter-stage: black
geometry:
  appbar: 40px
  appbar-phone: 48px
  statusbar: 32px
  statusbar-phone: 48px
  bottombar: 56px
  target: 44px
  navigator: 132px (to 220px in a tall window)
  inspector: 272px
  inspector-strip: 48px
  annotate: 232px
  pdf-strip: 56px
  pdf-navigator: 200px
  popover: 264px
  control: 32px on a desktop, 44px on a phone
---

# Design System: imbatranim-apps

## Overview

Docs, Sheets, Slides, PDF and CAD, the two Accessories (Todo, Bookmarks)
and the two Developer apps (Git GUI, the REST API Client) are windows of the
imbatranimOS desktop. They draw nothing of their own identity: the look is
the desktop's (Apricot and Classic, light and dark), reached through the
kit's tokens. What this repo owns is the layout inside each window.

The layout is **tools beside the page**. A 40 px app bar holds the file and
history at the left and the labelled Download and Present at the right. The
tools that format a thing sit in a labelled inspector beside the document: a
strip when idle, a panel or popover when open. Position, notes and zoom sit
in a 32 px status band at the foot. The page sits on a desk one step below
the panels around it.

Games stay out: their UI is the game.

## Colours

The apps define no colour. Every utility names a desktop token
(`bg-surface-container-low`, `text-on-surface-variant`, `ring-primary`), so
the four looks, the accent the person picked and Light / Dark / System all
arrive from the desktop. There is no `dark:` variant anywhere: the token
blocks carry the modes.

- **Bands and panels.** The title and status bands are `surface-container`;
  the app bar, the navigator, the inspector, PDF's annotate panel and the
  phone's bottom bar are `surface-container-low`. Each meets the next with an
  `outline-variant` hairline.
- **The desk** is `bg-desk`, the kit's token for the ground under a page,
  slide or sheet: `surface-container` in light and `surface-container-lowest`
  in dark, so the panels read one step up in both modes.
- **Controls.** A tool rests on `surface-container-lowest`, hovers to
  `-high` and presses to `-highest`. Something selected or pressed is soft:
  `primary-container` with its own ink and a `primary` edge, never the strong
  fill. Delete is `error`.
- **Fixed colours.** A slide is white in every look, so Slides' selection
  frame, handles, marquee and snap guide are a fixed `#a04b23` (5.96:1 on
  white; the dark accent is a pastel at 1.9:1). PDF pages, thumbnails and the
  signature canvas are paper white; the Presenter's stage is black. All are on
  record in `tools/conventions.json`. PDF's five mark colours are the
  document's.

### Named rules

- A colour that lands on paper is checked against white, not the theme.
- A tint over a ground (`bg-primary/25` for an added diff line) is checked
  over each ground the app paints.
- `npm run contrast -- <imbatranimOS checkout>` holds all of it in the four
  looks.

## Typography

The desktop's faces: Figtree for the UI in Apricot, Space Grotesk in
Classic, Inter for content, and Solway 700 (`font-display`) for display
only. The apps load no font of their own.

Sizes are the kit's names, never `text-[Npx]`: `text-label` 11/15,
`text-control` 12/16, `text-body` 13/18, `text-subhead` 14. Slides' slide
numbers are Solway 700 at 14/18 (`font-display text-subhead`) in a 16 px
column; PDF's thumbnail numbers the same.

## Layout

### The four drawn apps

- **App bar, 40 px (48 on a phone).** File and history at the left; Download
  and Present labelled at the right. On a phone Download sits in More,
  labelled there, and Present stays on the bar.
- **Status band, 32 px (48 on a phone).** Slides: `Slide 1 of 6`, Notes
  (Lucide `notebook-text`, soft when pressed) and zoom. PDF: `Page [1] of 15`,
  the true zoom and both fit modes. Docs: the word count, and on a phone the
  page's true scale.
- **Honest scale.** Every page is a fixed sheet scaled with `transform`,
  never reflowed, and each readout shows its true scale. Docs is a true 816 px
  sheet at 100%, centred, 12 px below the bar.
- **Slides.** A 132 px navigator (220 px in a taller window) of 100 x 56
  thumbnails, the current one outlined with an accent numeral and never a
  filled card. A 48 px inspector strip of Insert, Slide, Text and Shape, icon
  over label; Text and Shape are disabled with the hint "Select a text box or
  shape to format it." until something is selected. The 272 px panel docks
  from a 1100 px window; below that a group opens as a 264 px popover.
- **PDF.** The app bar holds the side panel toggle, Open PDF, Save (at the
  left), Export a copy, `Search document…` and the format panel toggle. With
  `Select / text` current the tools rest as a 56 px strip (Annotate, Sign,
  Organize); a markup tool or the toggle opens the 232 px panel from 1100 px,
  a popover below. The 200 px side panel names Thumbnails, Outline and Forms
  in full.
- **Docs and Sheets** keep SuperDoc's and Univer's own toolbars under the app
  bar. SuperDoc's toolbar reads the desktop's tokens through its `--sd-ui-*`
  variables; Univer follows the desktop's mode through its own dark mode.

### Phones (under 600 px)

A window opens maximized above the taskbar. The slide sits under the bar,
the six thumbnails fill a two-column grid with a 24 px fade at its foot, and
the status row keeps minus, Fit page and plus. A labelled 56 px bottom bar
(Slides: Insert, Slide, Text, Shape; PDF: Pages, Annotate, Sign, Organize)
opens the kit's bottom sheet. Targets are 44 px or more, except the OS's
title buttons and the vendor bars. Kit apps write `max-[600px]:`; `phone:`
is the desktop's own.

### The other screens

A screen with a top bar or a status bar takes the app bar's or the status
band's height, surface and hairline, and keeps its own layout: CAD's toolbar
and status bar, Todo's lists bar, Bookmarks', Git GUI's repo bar, the REST
client's environment bar and response line, PDF's organize bar. CAD's tools
stay 28 px (the 32 px rule binds the four drawn apps; its toolbar wraps at
958 px with 32 px buttons).

## Elevation and shape

Corners and shadows are the kit's: `rounded-control`, `rounded-item`,
`rounded-menu`, and `shadow-(--k-shadow-menu)` on a popover. No glass. In
Classic every radius is 0.

## Interaction

- **Focus.** Every stop the app draws has a 2 px `primary` ring, inset on a
  tool, at 3:1 on what it sits on. The kit's ghost Button and a bare kit
  Input draw none, so the apps add `focus-visible:ring-2
  focus-visible:ring-primary` (inset on tools); a scroll area's viewport gets
  a 2 px outline. SuperDoc's and Univer's stops are theirs.
- **Motion.** Every transition and spinner is `motion-safe:`; under
  `prefers-reduced-motion` nothing of the apps' own moves.
- **Copy.** No em dash in a user-visible string. The new names are `Notes`,
  the group heads `Insert`, `Slide`, `Text` and `Shape`, `Show format panel` /
  `Hide format panel`, `More` on a phone, and PDF's `Annotate`, `Sign` and
  `Organize`.

## Checks

- `npm run contrast -- <imbatranimOS checkout>`: every pair in the four looks.
- `tools/browser` (Playwright 1.63.0, run by hand against the dev container's
  desktop): the focus walk, reduced motion, the 390 and 360 phone fit, the
  theme switch, the shots and ruling 8's measurements.
