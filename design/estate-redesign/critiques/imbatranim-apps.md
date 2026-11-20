fix

# imbatranim-apps (Slides, Docs, Sheets, PDF): critique of the B build "Tools beside the page"

Read from today's Apricot light shots, the build's twins rendered headless at 1280x800, 1024x768, 768x1024, 390x844 and 360x800 in both themes, and the rulings. Numbers are CSS px measured in the DOM (twins) or on pixels (today). Today has no 360 shot (n/a).

## First screens, today against the build

| Measure | Today 1280 (958x558 window) | Build 1280 | Today 390 | Build 390 | Build 360 |
|---|---|---|---|---|---|
| Slide width, idle | 757 | 752, bands 14 | 213 visible, clipped by the screen edge | 366 | 336 |
| Slide width, inspector open | n/a (format row on top) | 528, bands 77 above and below | n/a | 366 (sheet) | 336 |
| Thumbnails whole | 5 of 6, 132x74 | 6 of 6, 89x50 | 5, rail takes 150 of 390 | 4 (row 3 cut 22 px above its numerals) | 4 |
| Present / Download labelled | Present icon only / yes | yes / yes | icon / yes | yes / in More | yes / in More |
| Status band with zoom | none, zoom in the top bar | 32 px: Slide 1 of 6, Notes, minus, Fit page, plus | none | 48 px, zoom kept | same |
| Bottom bar at thumb reach | n/a | n/a | none, window runs off screen | 56 px at y 731-787, taskbar from 788, nothing under it | 687-743, taskbar 744 |

Below 1280: Slides idle 802 at 1024 (bands 90), 546 at 768 (bands 162); open 578 (bands 153) and 322 (bands 225). Maximized 1280 open: 816 (bands 95).
Other screens: PDF page 751 today against 560 (1280), 542 (1024), 286 (768), all labelled 95%. Docs page 814 today (SuperDoc at 100%) against 620 at every desktop width, labelled 100%; visible document height 573 against 504. Sheets: 13 rows plus a part row today, 13 rows in the build.

## Regressions against today

1. **PDF, 1280: the page reads 25% narrower.** Today's page is 751 px with the annotate tools in one 31 px row. The build rests the Annotate inspector open (232 px), so the page is 560, and at 768 it is 286 with the Synopsis code lines cut by the page's `overflow: hidden` (text runs to x 543, page edge at 511). Reading a 15-page PDF is the common task. Fix: give PDF ruling 1's fold. With `Select / text` current, the inspector rests as the 48 px strip (Annotate, Sign, Organize, icon over label, 11/15 label) and opens at 232 px when a markup tool is picked or the toggle is pressed. The page comes back to about 744 in today's 1038 px PDF window.
2. **Docs and Sheets, 1280: the document lost height.** Docs shows 504 px of page against today's 573 (minus 12%), because the app bar grew from 33 to 44 px for two controls (Save, Find), a 24 px desk margin was added on top, and a 32 px status band carries only `3 words`. Sheets' 44 px app bar holds one disabled Save, and the grid drops its part row. Fix: app bar at 40 px in all four apps (32 px controls, 4 px padding, as direction A drew it), Docs' desk top margin 24 to 12. That returns 16 px. Moving `3 words` back into the app bar's right end and dropping Docs' status band would return 32 px more, but ruling 5 keeps the status band, so that one is a question for the controller, not a fix.
3. **Slides navigator: the thumbnails shrank a third.** 132x74 today, 89x50 now. The numeral column is 22 px, plus 8 and 9 px side padding. Fix: numeral at Solway 700 14/18 in a 16 px column, side padding 6, which takes the thumbnail to about 99x56 with the navigator still 132 (the idle slide keeps 752).
4. **Phone Download.** Today it is labelled at 390; the build moves it into More. That is the right call at 390, because the bar's spacer is only 68 px and a labelled Download would push out Undo and Redo. Ruling 4 says "Present and Download stay labelled", so the controller should confirm the ruling is desktop-only.

Nothing else regressed. Grouping, depth and emphasis are better than today in every screen: today's two flat rows of 12 px icons became labelled groups on their own bands.

## Priority issues (ranked by cost to the user)

1. **PDF opens with Annotate docked** (regression 1). The page is 560 at 1280, 542 at 1024 and 286 at 768, where the code lines are cut. Fix as above. Below 1100 px, follow B's own rule: fold to the strip and open each group as a popover.
2. **The scale readouts don't match the drawn page, so the comps overstate legibility.** PDF draws a 560 px page under `95%` (a true 95% A4 page is about 750, so this is about 71%). It is 286 under 95% at 768 (about 36%) and 366 under 95% on the phone (about 46%). Docs draws a 620 px page under `100%` (true 816, today 814). The PDF twin also reflows its text instead of scaling it, which causes the 768 clip. Fix: draw each page as a fixed A4 or Letter sheet scaled with `transform`, with the readout showing that scale (Fit width at 1280 with both panels: 71%). Draw Docs' page at 816 with about 21 px gutters in the 858 px window, or show the zoom that fits (76%). Nothing invented.
3. **Empty bands on the phone and tablet artboards.**
   - PDF 390/360: the page stops at y 391 and `.main` runs to 683, which leaves about 292 px of blank cream. Today's phone shows text to about y 740. Fix: the pager takes `flex: 1`, the page keeps its aspect (366x518 for A4) and runs under the status band, with page 2's top edge 12 px below.
   - Sheets 390: the grid stops at row 13 (y 540), 207 px above Univer's foot. At 768 and 1024 the gap is about 185 px. Fix: draw rows down to the foot (about 22 at 390).
   - The frame: the desktop is a fixed 800 px tall. At 1024x768 the taskbar (y 756-800) is cut 32 px by the viewport, and at 768x1024 224 px of white sits under it. Fix: desktop at `100vh`, window at viewport minus taskbar minus 8.
4. **Slide with the inspector open below 1100 px.** It is 528 in today's 958 window (minus 30% against 758, with 77 px bands), 578 at 1024 and 322 at 768 with 225 px bands. Ruling 1 asked for no bands; it holds only at 1280 idle. Fix, using B's own fold rule: under 1100 px window width, selecting a text box enables Text and Shape in the strip and opens the Text group as a 264 px popover anchored to its strip icon (radius 14, `shadow-menu`) over the desk's right edge, so the slide stays 752. Dock the 272 px panel only at 1100+, as the maximized board shows (816). This doesn't clash with ruling 1 ("selecting opens it"): a popover is still that opening, but the controller should confirm.
5. **Dark reverses the depth.** The app bar, navigator, inspector and bottom bar sit on `surface-container-low` #29211c, which is darker than the desk, title band and status band on `surface-container` #322822. In light the panels are lighter (raised) and the desk sunk. In dark the desk reads raised and the chrome recessed. Every pair is only 1.10 apart and is held by the #54443a hairline. Fix (the app's role mapping, not the OS tokens): in dark, the desk takes `surface-container-lowest` #201a17, so the slide sits in the deepest well and the panels read one step up. The white slide on the desk stays above 14:1.
6. **The phone vendor bars aren't drawn as they paint today.** At 390 today, SuperDoc collapses into its own ⋮ (B, I, U, S, A, ⋮). The twin draws a sideways scroller with Underline cut at the edge and 11 controls off screen. Univer's ribbon cuts Italic at 390 and Bold at 360 with no cue. Fix: draw SuperDoc's 390 toolbar with its ⋮ as captured. Give Univer's ribbon the 24 px right-edge fade that direction A names as the scroll cue, or draw it exactly as today's shot.
7. **The phone filmstrip cut reads like a bug.** The strip ends at y 683, row 3's thumbnails end at 705, and their numerals 5 and 6 are hidden. Fix: a 24 px fade at the strip's foot (`surface-container-low` to transparent), and size the strip so the cut falls near the middle of row 3 (a peek of about 60 px).

## The builder's choices

- **Two-column phone grid, not a sideways strip:** keep. A one-row strip at 390 shows about 2.5 thumbnails and leaves about 250 px empty under them, which is the band ruling 3 forbids. The grid shows 4 whole thumbnails where ruling 3 asks for 3. It departs from B's text but serves the ruling. Only the cut needs fixing (issue 7).
- **Notes icon-only on the phone:** keep. At 360 the status row has about 44 px free, and a label would crowd the zoom. But the glyph (Lucide `sticky-note`) is PDF's Sticky note tool and reads as "a page". Use Lucide `notebook-text`, keep the `Speaker notes` aria-label, and show the pressed state soft (`primary-soft` with a `primary` edge).
- **PDF's Fit width and Fit page in More on the phone:** keep. Fit width is the phone default and pinch zooms; the status row keeps minus, the readout and plus. The readout must be honest (issue 2).
- **Below 1280 the window fills the screen minus 8 px:** keep for the board; it beats a 958 px window floating in a 1024 screen. It is an OS window behaviour, so the brief 88 sticky should name it. Fix the fixed-800 frame (issue 3).
- **Three tooltips lost an em dash:** keep. The commas read cleanly, and the change is recorded on a `reopened` sticky. That sticky is the right place for the info string's departure from the fixture; no clash.

## Dark and the vendor clash

Dark is a designed theme in its accents: a calm `primary` #f2a97e, the soft selected thumbnail with a 2 px offset frame, and the error ink lifted to #ff8a80. Its surfaces separate only by hairline, and the depth is reversed (issue 5). The vendor bars in dark are a hard clash. In Docs, one 44 px white SuperDoc band sits between dark bars. In Sheets, about 85% of the window is Univer's white tabs, ribbon, grid and foot. For a board proposal this is acceptable with the existing Open sticky only. Drawing a dark Univer or SuperDoc would be invented until the pinned versions' theme options are tried. The sticky should name that check: whether Univer's dark mode or theme option reaches the grid, and whether SuperDoc reads CSS variables.

## Strengths to keep

1. **The phone is a real phone design.**
   - The slide runs full width at 366 (today 213 visible, clipped).
   - A labelled 56 px bottom bar of Insert, Slide, Text and Shape sits at thumb reach.
   - The status row keeps the position and zoom.
   - Nothing sits under the taskbar, and targets are 44 px or more.
2. **Slides idle keeps today's slide (752 against 757)** while all 37 controls gain a labelled home. The disabled Text and Shape groups explain themselves with `Select a text box or shape to format it.`
3. **Islands and bands, not flat.** The title band, app bar, navigator, desk, inspector and status band each sit on their own tone with a hairline, in both themes. PDF's tabs read `Thumbnails`, `Outline` and `Forms` in full, and its ten tools are labelled toggles with the current one soft.
4. **One status band.** Position and zoom sit in the same place in Slides and PDF. The current slide is an outline with a `primary` Solway numeral, never a filled card.

## Heuristics (0-4) and detector

1. Visibility of status, 3: Slide 1 of 6, zoom, words and the pressed tool are all on screen, but the comps' zoom readouts are wrong.
2. Match with the real world, 3: the familiar office frame of navigator, page and format pane.
3. User control, 3: undo and redo, both panel toggles, More.
4. Consistency, 3: the same bands in all four apps, Save at the left everywhere; the vendor bars still differ.
5. Error prevention, 3: Save and the format groups are disabled with a reason.
6. Recognition over recall, 4: 21 icon-only tools became labelled groups.
7. Flexibility and efficiency, 2: formatting needs the strip, then the panel, one click more than today's always-on row; shortcuts stay in the tooltips.
8. Aesthetic and minimalist design, 3: calm and grouped, but Docs' and Sheets' app bars are nearly empty.
9. Error recovery, 3: the refused-file state names the format and offers `Open a .pptx instead`.
10. Help, 2: tooltips with shortcuts and the info icon only.

Total 29/40.

Detector: `NODE_PATH` alone ran it degraded, because ESM ignores `NODE_PATH`. Run full, from a scratch copy with presentation-sites' `node_modules` linked in, on 12 twins plus the Direction sheet:

- **`cramped-padding`** (4-20 per twin; `.root`, the OS title band `.at`, `.abar`, `.vb`, the slide's own boxes): dismissed. These are compact toolbars and bands flush by design, the expected false positive.
- **`gpt-thin-border-wide-shadow`** (1 per twin; a 1 px edge with a 44-48 px blur): dismissed. It is the OS's floating window, which is OS chrome.
- **`flat-type-hierarchy`** on Docs, Sheets and PDF (sizes 11, 12, 13 and 15): dismissed. Hierarchy in tool chrome comes from bands and group heads.
- **`tiny-text`** (11 px, once in Slides open, 56 times on the Direction sheet): 11 px is the OS's floor and the direction's label size, so the specimens are dismissed. One is kept: set the inspector hint `Select a text box or shape to format it.` at 12/16, because it is a sentence, not a label.
- **`em-dash-overuse`** on the Direction sheet ("40 em-dashes"): a false positive. The hits are the `--k-*` token names in the specimens.
- `nested-cards` didn't fire.

Don't dilute: the slide or page as the widest, first-read thing on every screen, and the labelled groups that replaced today's icon rows.
