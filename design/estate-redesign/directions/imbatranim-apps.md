# imbatranim-apps (Docs, Sheets, Slides, PDF): two directions

Written 2026-11-13 by the art director. Repo: imbatranim-apps, brief 11. The apps are kit apps on the desktop's kit (`decisions.md`, 2026-10-21), so both directions take imbatranimOS's winning look as it is: direction B "Start, opened wide", Apricot in Light / Dark, Figtree for the UI, Solway 700 as the display token, the six token radii, shadows only on floating layers, "selected is soft, an action is strong". A and B differ in structure only. Neither adds a palette, a face or a theme switch; the switch is the desktop's. Brief 11's default holds for both: each app keeps its features, its window chrome and the kit's controls, and "a change to the tab order, a toolbar's position or a dialog's wording is flagged on the board as a reopened decision".

## 1. Today's strengths (keep all of them)

1. **A layout office users already know.** The navigator sits at the left (Slides' numbered thumbnails; PDF's Thumbnails, Outline and Forms), the document in the middle, and every tool is on screen with a tooltip naming it and its shortcut (`Save (Ctrl+S)`, `New slide (Ctrl+M)`).
2. **Bands group the chrome.** Under the OS title band, the bar and the tool row each sit on `surface-container-low` with a hairline under them, and 1 px dividers split the groups (file, history, slides, zoom, view; slide, insert, text, align, shape).
3. **The document reads as the document.** A white slide or page rests on a sunk desk with room around it, and the current slide or page is framed in the accent.
4. **State stays on screen.** `1 / 6`, `1 / 15`, `Fit page`, `95%`, `3 words`, the pressed rail and tool toggles, the unsaved dot in the window title, and `Save` greyed until something changes.
5. **They are OS apps.** The desktop's buttons, tooltips, dialogs, tokens and accent, so a preset or a Light / Dark change recolours the suite with the desktop.
6. **Words where they count.** `Save`, `Save as…`, `Download`, `Sign`, `Organize` and `Search document…` carry labels; the rest are icons.

Faults both directions fix (measured on the shots and in HEAD's code):
- Controls are `h-6` (19.5 px) and `h-5` (16.25 px) at the kit's 3.25 px spacing, with 12 px icons. That is under the 24 px floor on desktop and far under 48 on the phone.
- The `▾` is 8 px (`text-nano`) and `A-` is 10 px (`text-tiny`), under the OS's new 11 px floor.
- The file name shows twice, in the title band and again in the bar.
- The four bars disagree. `Save` is at the left in Docs, Sheets and Slides but at the far right in PDF. Only PDF carries a brand label (`PDF`), and position and zoom sit in a different place in each app.
- PDF's first panel tab reads `Thumbn…` (G3).
- The rail's number badge covers the slide's bottom-right corner.
- At 390 the window keeps its desktop width and runs off the right edge. The stage is clipped (`Animated slide` without its number), the second tool row is cut, and the rail takes 150 of 390 px.
- Pressed toggles (the rail, PDF's current tool) are strong apricot fills. The OS rule makes a selection soft: `primary-soft` with a `primary` edge.
- Univer paints its own blue (the `Start` tab, the `Calc` sheet tab), and its grid stays light in dark.

## 2. The main screen

**Slides with `anim.pptx` open.** Slides and PDF are the two apps that paint all their own chrome, and Slides carries the most of it: two rows, 37 controls, a navigator and a stage. Its file row and format row are also the pattern Docs and Sheets follow above their libraries' toolbars. Today: `light-1280-slides.png` and `light-390-slides.png`. The full build's other three screens are Docs (`test.docx`), Sheets (`calc-30k.xlsx`) and PDF (`fontconfig-user.pdf`, side panel and annotate row shown), named the same way.

**The frame, the same in A and B.** At 1280 the window is maximized, 1280 × 756 above the OS's 44 px taskbar, under a 30 px title band. At 390 it fills the screen above the OS's 56 px phone taskbar, 390 × 788, under a 40 px title band whose three buttons are 48 px wide. The phone window is an assumption the OS has not made (owner question 2). The title band and the taskbar are the OS's (`directions/imbatranimOS.md`). Draw them the same in both sketches; the judges don't score them.

## 3. The content fixture (word for word; English)

- **Title band:** the window's dot, `anim.pptx`, then minimize, maximize and close.
- **Row 1, in today's order** (each item's tooltip from `Toolbar.tsx`; visible text in backticks): New presentation; Open (Ctrl+O); `Save` (disabled, no changes); `Save as…` (Save a copy under another name); divider; Undo (Ctrl+Z, disabled); Redo (Ctrl+Y, disabled); divider; Slide thumbnails (pressed); Previous slide (Page Up, disabled); `1 / 6`; Next slide (Page Down); divider; Zoom out; `Fit page` (Switch between fit width and fit page); Zoom in; divider; Speaker notes (not pressed); Present (Escape to exit) (F5); Export this slide as a PNG; then at the right the info icon (`Drawn by this app — layout may differ from PowerPoint`), `anim.pptx`, and `Download` (Download original (the file as last saved)).
- **Row 2, in today's order.** New slide ▾ (Ctrl+M), Duplicate slide, Delete slide; Text box, Picture, Shape ▾; Bold, Italic, Underline, Font size `—` ▾, Increase font size `A+`, Decrease font size `A-`, Font colour ▾; Align left, Centre, Align right, Justify; Shape fill ▾, Shape outline ▾, Arrange ▾, Delete (error ink). Nothing is selected, so everything from Bold to Delete is disabled. That makes 16 controls in row 1 plus the readout, and 21 in row 2.
- **Rail:** six 16:9 white thumbnails, each with `Animated slide N` (title, centred near the top) over `• Body that fades in on click N` (one bullet), numbered `1` to `6`. Slide 1 is current.
- **Stage:** slide 1 at fit page shows `Animated slide 1` (title, centred) and `• Body that fades in on click 1`. The slide's text is the deck's, so draw it in Arimo (Arial's metric twin on Google Fonts), `#000000` on `#ffffff`, in both themes. Speaker notes are hidden.
- **Taskbar (OS).** At 1280: `ImbatranimOS` Start, Search, the task `anim.pptx` (current), pips `1` (current) `2` `3` `4`, volume, bell, `17:49` over `Thu, 12 Nov`. At 390, the OS's phone taskbar: Start as the logo alone, Search, one workspace button showing `1`, volume, bell and the same clock, with 48 px targets.
- **States** (Direction sheet strip). Empty: `Nothing open`, `Open a presentation`, `New presentation`. Loading: `Opening anim.pptx…`. Error: `WithLinks.ppt` (a real test file), `PowerPoint 97-2003 (.ppt) is not supported. Slides reads .pptx files.`, `Open a .pptx instead`.
- **New strings, only where a direction names them.** A adds `More` and the visible label `Present`. B adds `Slide 1 of 6`, `Notes`, the group heads `Insert`, `Slide`, `Text` and `Shape`, the hint `Select a text box or shape to format it.`, and `Show format panel` / `Hide format panel`.

**The shell's slots today** (vendor means the library paints it and only tokens or its theme option reach it):

| Slot | Docs | Sheets | Slides | PDF |
|---|---|---|---|---|
| File | `Save` | `Save` | New, Open, `Save`, `Save as…` | Open PDF, Export a copy, `Save` at the far right |
| History | vendor toolbar | vendor ribbon | Undo, Redo | none |
| Name | `test.docx` at the right | `calc-30k.xlsx` at the right | info, `anim.pptx` at the right | `PDF` label, then the name at the left |
| Position | `3 words` | vendor cell box | ‹ `1 / 6` › | ‹ `1` / 15 › |
| Zoom | vendor `100%` | vendor foot slider | − `Fit page` + | − `95%` +, Fit width, Fit page |
| View and own | Find | none | Thumbnails, Notes, Present, Export PNG | Side panel, `Search document…` |
| Tools | SuperDoc's row (vendor) | Univer's ribbon (vendor) | own row of 21 | own annotate row, `Sign`, colours, widths, `Organize` |
| Panel and foot | none | Univer's sheet bar (vendor) | rail | Thumbnails, Outline, Forms |

## 4. The look both directions inherit

Hex values come from `board/sketches/imbatranimOS/B/tokens.md` (light / dark). The desk is `surface-container` `#f4e6d7` / `#322822`, which is also the OS title band. Bars, the tool row and the panels are `surface-container-low` `#fdf7f0` / `#29211c`. Fields are `surface-container-lowest` `#fffdf9` / `#201a17`. Hover is `container-high` `#f0e1d2` / `#3c302a` and pressed is `container-highest` `#e9d6c3` / `#473932`. Ink is `on-surface` `#33241b` / `#f6eadf`, with readouts and heads in `on-surface-variant` `#6b5141` / `#cdb6a5`. Control edges are `outline` `#a2826b` / `#937a69`, and hairlines plus the slide's edge are `outline-variant` `#e0c8b2` / `#54443a`. The strong action and the focus ring are `primary` `#a04b23` / `#f2a97e` with `on-primary` `#ffffff` / `#33241b`. Selection is `primary-soft` `#f2a97e` / `#5e3725` with `#33241b` / `#ffdcc7` text and a `primary` edge. Error is `#ba1a1a` / `#ff8a80`. The document stays `#ffffff` with its own ink in both themes, because it is data.

Pairs checked with `board/tools/color.mjs` (light / dark): band on desk 1.15 / 1.10, plus a hairline at 1.31 / 1.55; slide on desk 1.22 / 14.36; muted text on a band 6.86 / 8.15 and on the desk 5.96 / 7.41; primary on a band 5.60 / 8.09. In dark, the current-thumbnail frame is 1.95 against the white thumbnail, so it sits 2 px off it, against the band (8.09). `outline` on the desk is 2.89 in light, so bordered controls on the desk or a status band take the OS build's 3:1 outline (about `#9c7c66`, ruling 4 in `judge/imbatranimOS/RESULT.md`).

Type is Figtree 400-700 at the kit's sizes. On desktop: label 11/15 (readouts, numbers, heads at 600), control 12/16 (buttons, tabs), body 13/18 (fields). On the phone: label 12/16, control and body 14/20, inputs 16. Solway 700 (`--k-font-display`) sets the state titles (`Nothing open`) at 24/30, like the OS's page titles. Icons are Lucide (the apps' `lucide-react`): 16 px in 32 px buttons at 1280, 20 px in 48 px targets at 390. Corners use the OS's tokens (control 10, menu 14); slides and pages keep square corners. The only shadows are on menus, popovers and the phone sheet.

## 5. Directions

### A. One bar for four (Evolve today)
- **Idea:** today's two rows, rail and desk, rebuilt as one bar that all four apps share in the same order, with 32 px controls and the doubled file name gone.
- **Skeleton, 1280.** OS title band 30 px. Under it, the office bar, 40 px on `container-low` with a hairline under it. Then the tool row, 40 px, the same band with a hairline under it. The rail is 176 px on `container-low` with a hairline right edge. The desk is `surface-container`, with the slide at fit page, 24 px clear and an `outline-variant` edge.
- **The office bar, same order in every app:** panel toggle, then file, history, position, zoom, the app's own actions, a spacer, the info icon and `Download`. No file name, because the title band has it with the unsaved dot. Dividers are 1 × 20 px `outline-variant`. Icon buttons are 32 × 32 with 16 px icons. `Save`, `Save as…`, `Present` and `Download` carry labels. `Save` is strong when there are changes and disabled otherwise; `Present` and `Download` are bordered.
- **Tool row:** today's 21 controls in today's five groups at 32 px. `A+` and `A-` become Lucide's `a-arrow-up` and `a-arrow-down`, the ▾ becomes a 12 px chevron inside its button, and Delete keeps the error ink.
- **Rail:** 136 × 77 thumbnails with the number to their left (label, tabular), never over the slide. The current slide gets a 2 px `primary` frame 2 px off the thumbnail, and its number in `primary` 600.
- **Narrower windows.** At 1280 the bar needs about 1030 px. Under 1050 the labels on `Save as…` and `Present` drop to icons with their tooltips. Under 900, Speaker notes, Present and Export this slide as a PNG move into a `More` menu at the bar's right end.
- **390.** The bar is 48 px: `Save`, Undo, Redo, a spacer, `1 / 6`, and `More` (⋮, the system menu that Slides' other menus already use). `More` holds the other 13: New presentation, Open, Save as…, Slide thumbnails, Previous slide, Next slide, Zoom out, `Fit page`, Zoom in, Speaker notes, Present, Export this slide as a PNG, Download, then the info line. The tool row stays one line that scrolls sideways, with 48 px targets and a fade at the right edge as the cue. The slide goes full width with 16 px gutters. The rail folds into a two-column grid of all six thumbnails under the stage, and the window body scrolls as one.
- **The other three screens, by the slot map.** Docs: `Save`, Find and `3 words`, then SuperDoc's toolbar as the tool row, with the page centred on the desk (today it sits flush left). Sheets: `Save`, then Univer's ribbon as the tool row. PDF: Show side panel, then Open PDF, `Save` and Export a copy, then ‹ `1` / 15 ›, then − `95%` +, Fit width and Fit page, then the `Search document…` field. The `PDF` label goes. The annotate row becomes the tool row, with the current tool soft. The side panel tabs show `Thumbnails`, `Outline` and `Forms` in full, icon over label.
- **Signature:** the office bar. It has the same order and the same 32 px controls in all four apps, so Save, the position and zoom sit in one place whichever app is open.
- **Reference:** `notion`, for one move: even-sized controls on quiet bands, with the document as the brightest thing on screen. Nothing of its type or palette.
- **Reopens:** a toolbar's position (brief 11's default), for PDF's `Save` moving left and its `PDF` label going.

### B. Tools beside the page
- **Idea:** the document gets the middle, the slides or pages sit at the left, and every tool moves into labelled groups at the right. File and history share one bar above, and position, notes and zoom move to a status band at the window's foot. That is the frame presentation editors use, built from the OS window's own bands.
- **Skeleton, 1280.** OS title band 30 px.
  - **App bar,** 44 px on `container-low`. Left: Slide thumbnails, New presentation, Open, `Save`, `Save as…`, Undo, Redo. Right: info, Export this slide as a PNG, `Download`, `Present` (bordered), and the format panel toggle.
  - **Navigator,** 184 px on `container-low`. It holds the six thumbnails, each with its number at its left in Solway 700 16/20, like the OS's A-Z letters: `primary` on the current slide, `on-surface-variant` on the rest. The current row is soft with a `primary` edge.
  - **Desk:** `surface-container`, the slide at fit.
  - **Inspector,** 272 px on `container-low` with a hairline left edge. Four groups split by hairlines, each with a sentence-case head (Figtree 600 12/16): `Insert` (Text box, Picture, Shape ▾ as labelled buttons), `Slide` (New slide ▾, Duplicate slide, Delete slide, labelled), `Text` (Font size, Increase, Decrease, Bold, Italic, Underline, Font colour ▾, then the four aligns as one ToggleGroup) and `Shape` (Shape fill ▾, Shape outline ▾, Arrange ▾, Delete). With nothing selected, Text and Shape show disabled under the hint `Select a text box or shape to format it.`
  - **Status band,** 32 px on `surface-container` with a hairline on top: ‹ `Slide 1 of 6` › at the left; `Notes`, −, `Fit page` and + at the right.
- **All 37 controls keep a visible home.** Ten go in the app bar, six in the status band and 21 in the inspector. No shortcut or behaviour changes.
- **Narrower windows.** Under 1100 px the inspector folds to a 48 px column of its four group icons, and each opens its group in a popover. Under 600 the phone layout takes over.
- **390.** The bar is 48 px: `Save`, Undo, Redo, a spacer, `Present`, and `More` (New presentation, Open, Save as…, Slide thumbnails, Zoom out, `Fit page`, Zoom in, Export this slide as a PNG, Download, the info line). The status band keeps Previous slide, Next slide and `Notes`, so all 37 still have a home on the phone. Under the bar come the slide at full width, then the navigator as a sideways filmstrip with each number under its thumbnail, then the status band (‹ `Slide 1 of 6` ›, `Notes`). At the bottom of the window sits a 56 px bar of the inspector's groups, `Insert`, `Slide`, `Text` and `Shape`, each an icon over its label. Each one opens its group as a bottom sheet (18 px top corners, `shadow-menu`). The kit has no sheet, so that is a request to imbatranimOS brief 88.
- **The other three screens.** PDF's app bar holds Show side panel, Open PDF, `Save`, Export a copy, the `Search document…` field and the format panel toggle. Its navigator has the `Thumbnails`, `Outline` and `Forms` tabs in full. Its inspector, `Annotate`, holds the ten tools as a two-column grid of labelled toggles with the current one soft, then `Sign`, the mark colours, the stroke widths, and `Organize` at its foot. Its status band holds ‹ Page [`1`] of 15 ›, − `95%` +, Fit width and Fit page. Docs keeps SuperDoc's toolbar as a top band under its app bar (`Save`, Find), because the library paints it and can't move. Its page sits centred on the desk, and its status band holds `3 words`, with the character count as a second readout while Find is open, not joined by a middle dot. Sheets gets the app bar (`Save`); Univer keeps its ribbon and its own foot bar, which already does the status band's job.
- **Signature:** the inspector. Every tool sits in a labelled group beside the page, and the same four groups become the phone's bottom bar.
- **Reference:** `webflow`, for one move: a style panel of sentence-case sections in a column beside the canvas. Nothing of its blue or type. It is not newspapper's "Contact sheet", which puts a raised stage card over a contact strip. B's zones are flush window bands, with a status band at the foot.
- **Reopens:** brief 11's "the layout of the toolbars, which copy desktop office suites", which it names as the likeliest to reopen. Also the wording `1 / 6` → `Slide 1 of 6`, and in PDF, `Save` moving left and the `PDF` label going.

## 6. Registry lines

| imbatranim-apps (A) | One bar for four | Solway (OS token; state titles only) | Figtree (OS; Inter for content, slide text is the deck's) | apricot (the OS's; satchel's clay family) | maximized OS window; one office bar in the same order in all four apps (file, history, position, zoom, own actions, Download) over the tool row; a 176 px navigator, numbers beside the thumbnails; the document on a sunk desk; phone: bar with More, a sideways tool row, the rail as a two-column grid under the stage |
| imbatranim-apps (B) | Tools beside the page | Solway (navigator numbers, state titles) | Figtree (OS) | apricot (the OS's) | app bar of file and history; a 184 px navigator; the desk; a 272 px inspector of labelled tool groups at the right; a status band at the window foot (position, notes, zoom); phone: slide, filmstrip, status band, a bottom bar of four groups opening a sheet |

## 7. Questions for the owner (ask sticky) and notes

1. **B moves the tools of Slides and PDF to a panel beside the document, and position and zoom to a status band at the window's foot.** Docs and Sheets keep their libraries' toolbars on top. Brief 11 flags "a toolbar's position" as a reopened decision. Is the move welcome, or do the tools stay on top (A)?
2. **On a phone, should a window open maximized above the taskbar?** Both sketches assume it. Today the window keeps its desktop width and runs off the screen. The window layer is imbatranimOS's, so a yes becomes a request to its brief 88 (with B, the kit's bottom sheet too).
3. **Approve a direction:** A or B?

- **Controller, the frame.** Today's shots show a floating window of about 958 × 558 at (198, 156) over the desktop, while the sketches draw it maximized. Capture today's Slides maximized at 1280 and 390 before judging, or tell the judges.
- **Controller, the dark shots.** Today's dark shots are Classic dark (`shots.md`). Judge both widths in Apricot light, or capture Apricot dark at 390, as for imbatranimOS.
- **The build in the shots** is the one before briefs 07-10 (office ref 1b4394f). Where a shot and HEAD disagree, the shot wins. The icon names come from HEAD's `lucide-react` imports.
- **Sketchers:** Floor 11 (no hand-drawn OS window) and Floor 14 (a capped container) don't apply in app scope, because the window is the product's own frame. Lint with `--scope app`, and if a gate still fires, report it with that reason.
- **Vendors:** Univer's blue and its light grid in dark, and SuperDoc's toolbar, change only through the tokens they read or their theme option. Sheets passes Univer `defaultTheme` today. If neither works, they stay, as brief 11 says ("or not at all").

## Controller's ruling on the frames (2026-11-13)

- **1280: draw today's window state.** Today's Slides opens as a floating window, about 958 × 558, over the OS desktop and taskbar. Both sketches draw the Slides window at that size and place, with the OS B desktop around it, so the judges compare like with like. The full build adds a maximized state as an extra artboard.
- **390: fit the phone.** Today's window runs past the phone's edge; both sketches draw the window fitted to the viewport above the taskbar (that is the fix, and the owner's question 2 asks whether it opens maximized).
- **Judging is in Apricot light at both widths** (today's dark shots are Classic dark), as for the OS. Sketchers still render Apricot dark for the critic.
