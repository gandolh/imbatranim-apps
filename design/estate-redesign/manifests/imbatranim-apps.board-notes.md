# The board's notes: imbatranim-apps

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. Approve this direction, B "Tools beside the page"? It moves Slides' and PDF's tools into a labelled strip beside the document that opens as a panel or a popover, and position, notes and zoom into a status band, which reopens brief 11's toolbar position. 2. On a phone, may a window open maximized above the taskbar (today it keeps its desktop width and runs off the screen)? A yes is a request to imbatranimOS brief 88, with a kit bottom sheet. 3. Is Slide 1 of 6 for 1 / 6 fine, and PDF's Save moving to the left with the PDF label gone? (beside `imbatranim-apps-proposed-slides-1280`)

## Decisions

- Slides: the slide keeps its room. With nothing selected the inspector is a 48 px strip of Insert, Slide, Text and Shape (icon over label); selecting a text box enables Text and Shape and, below 1100 px, opens Text as a 264 px popover over the desk's right edge, so the slide stays 751 px wide idle and open (today's stage is 758). The 272 px panel docks only at 1100 px and up, as the maximized artboard shows. [rulings 1 and 2] (beside `imbatranim-apps-proposed-slides-1280`)
- Slides: the app bar is 40 px and keeps file and history at the left and Download and Present, both labelled, at the right. The navigator's numerals are Solway 700 14/18; the current slide is an outline and a primary numeral, never a filled card (thumbnails 100 x 56, today's 132 x 74 in a 132 px rail). [rulings 2 and 4] (beside `imbatranim-apps-proposed-slides-1280`)
- Slides: Text and Shape stay in the strip, disabled with the tooltip Select a text box or shape to format it. while nothing is selected. The three inspector states, and PDF's, are on the Direction sheet. (beside `imbatranim-apps-proposed-slides-1280`)
- Slides: the status band at the foot holds the position (Slide 1 of 6), Notes (Lucide notebook-text) and zoom. (beside `imbatranim-apps-proposed-slides-1280`)
- Slides on a phone: the slide sits under the bar, the freed height holds all six thumbnails in a two-column grid (150 x 84, 135 x 76 at 360), the status row keeps minus, Fit page and plus, and the labelled bottom bar opens a sheet. Download sits in More, labelled there; Present stays on the bar. Ruling 4 is desktop-only. [rulings 3 and 5] (beside `imbatranim-apps-proposed-slides-390`)
- Slides maximized (extra): the window is 1280 x 756 above the 44 px taskbar with the 272 px panel docked and a title text box selected; the slide is 792 px wide. (beside `imbatranim-apps-proposed-slides-maximized-1280`)
- Docs: SuperDoc keeps its own toolbar under a 40 px app bar (Save, Find); the page is a true 816 px sheet at 100%, centred on the desk (today it sits flush left), with 3 words in the status band. On a phone the sheet is scaled to 44% (40% at 360) and the status band says so; SuperDoc's toolbar collapses to B, I, U, S, A and its own ⋮ as captured today. (beside `imbatranim-apps-proposed-docs-1280`)
- Sheets: the app bar holds Save; Univer keeps its ribbon, formula bar and foot bar, which already do the status band's job. The grid runs down to the foot bar; on a phone the ribbon fades at its right edge to show it scrolls. (beside `imbatranim-apps-proposed-sheets-1280`)
- PDF: the app bar holds the side panel toggle, Open PDF, Save, Export a copy, Search document… and the format panel toggle; the PDF label and the doubled file name go. While Select / text is current, Annotate, Sign and Organize rest as a 56 px strip, so the page is a true 746 px sheet at 94% (today 751 at 95%); a markup tool opens the 232 px panel at 1100 px and up and a popover below. Thumbnails, Outline and Forms show in full; the status band holds Page 1 of 15, the honest zoom and the two fit modes. (beside `imbatranim-apps-proposed-pdf-1280`)

## Reopened rules

- Toolbar position. Recorded: "A change to the tab order, a toolbar's position or a dialog's wording is flagged on the board as a reopened decision" and "the likeliest to reopen is the layout of the toolbars, which copy desktop office suites" (imbatranim-apps brief 11, Context and Owner decisions). Slides' and PDF's tools move from rows on top to a strip and panel at the right; PDF's Save moves from the far right to the left. (beside `imbatranim-apps-proposed-pdf-1280`)
- Wording. 1 / 6 becomes Slide 1 of 6 and PDF's Page 1 / 15 becomes Page 1 of 15 (brief 11: a dialog's wording is a reopened call). Three tooltips lose their em dash because the Floor forbids it: Drawn by this app, layout may differ from PowerPoint; Save (Ctrl+S), write changes back to the file; Sign: capture a signature and stamp it on the page. (beside `imbatranim-apps-proposed-slides-1280`)

## Open questions

- Univer and SuperDoc paint their own chrome. Drawn as they paint today: Univer's blue, a white grid and ribbon in dark too, SuperDoc's white toolbar, their controls under 44 px on a phone. To check before the build: whether the pinned Univer's dark mode or theme option reaches the grid and ribbon, and whether the pinned SuperDoc reads CSS variables for its toolbar. If neither does, they stay as brief 11 says ("or not at all"); a dark Univer or SuperDoc is not drawn because that would be invented. (beside `imbatranim-apps-proposed-sheets-390`)
- Needs imbatranimOS brief 88: a window that opens maximized on a phone, a window that fills the screen minus 8 px below 1280 px, and a kit bottom sheet (18 px top corners, shadow-menu) for the Insert, Slide, Text and Shape groups and for PDF's Pages and Annotate; plus the kit popover (radius 14, shadow-menu) for the idle strip below 1100 px. (beside `imbatranim-apps-proposed-slides-390`)
- Docs' refusal name test.doc is illustrative (the repo says only "a .doc conversion"); PDF's open-error text is the engine's own message, so its state is not drawn. On a phone PDF's Fit width and Fit page move into More. (beside `imbatranim-apps-direction`)

## The Floor

- Contrast: text min 5.6 light / 6.29 dark, UI parts min 3.21 / 3.58; every surface-on-ground pair is on the Direction sheet (in dark the desk is surface-container-lowest, so panels read one step up). Checks from scratch at 1280 (958 window), 1024, 768, 390 and 360, both themes: page overflow none; control overflow, clip, text-in-column, gap and empty-band checks pass (exit 0); phone targets 44 px or more except the OS title buttons and vendor bars. The only bands over 48 px are a 16:9 slide in a window of another shape (1024, 768, and the maximized docked state) and the navigator at 768. sloplint on the ten twins: 0 FAIL, 0 WARN, 2 REFLEX (both spacing off the 4 px scale, kept). Pages are fixed sheets scaled by transform: Docs 100% (816 px) at 1280 and 1024, PDF 94% at 1280 (746 px); readouts match the drawing at every width. Callouts sit in the right gutter, 1280 only. (beside `imbatranim-apps-direction`)

## Other notes

- Round 2 (critic and controller): desk goes to surface-container-lowest in dark (apps' mapping only); app bars 40 px; frame at 100vh with the window filling it minus the taskbar and 8 px below 1280; sheets drawn at true size and scaled; PDF gets the idle strip; the phone filmstrip fits all six thumbnails with no cut; Univer's ribbon fades at the edge; the inspector hint is 12/16.

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| on-surface on surface-container-low (app bar, navigator, inspector) | 14.01 | 13.36 | 4.5 |
| on-surface on surface-container (title band, status band, desk) | 12.17 | 12.14 | 4.5 |
| on-surface-variant on surface-container-low (group heads, hint, tab and bar labels) | 6.86 | 8.15 | 4.5 |
| on-surface-variant on surface-container (status readouts, slide numbers) | 5.96 | 7.41 | 4.5 |
| on-surface on surface-container-lowest (tool labels, field text) | 14.67 | 14.53 | 4.5 |
| on-surface-variant on surface-container-lowest (tool icons, placeholder) | 7.18 | 8.87 | 4.5 |
| on-surface on surface-container-high (hover) | 11.64 | 10.77 | 4.5 |
| on-surface on surface-container-highest (pressed) | 10.56 | 9.35 | 4.5 |
| accent on surface-container-low (current slide number, selected tab) | 5.6 | 8.09 | 4.5 |
| accent-soft-on on accent-soft (pressed toggles, taskbar task) | 7.63 | 7.96 | 4.5 |
| accent-on on accent (primary button, callout number) | 5.96 | 7.63 | 4.5 |
| error on surface-container-lowest (Delete) | 6.36 | 7.53 | 4.5 |
| error on surface-container-low (refusal text) | 6.07 | 6.92 | 4.5 |
| doc-ink on doc-paper (slide, page; board only) | 21 | 21 | 4.5 |
| vendor-ink on vendor-surface (SuperDoc, Univer; board only) | 16.27 | 16.27 | 4.5 |
| vendor-ink-soft on vendor-surface-alt (Univer headers; board only) | 6.29 | 6.29 | 4.5 |
| vendor-blue on vendor-blue-soft (Univer tab and sheet name; board only) | 6.35 | 6.35 | 4.5 |
| vendor-blue on vendor-surface (Univer selected header; board only) | 7.43 | 7.43 | 4.5 |
| accent (focus ring, current frame) on surface-container-low | 5.6 | 8.09 | 3 |
| accent (focus ring) on surface-container | 4.86 | 7.35 | 3 |
| accent (focus ring, popover edge) on desk | 4.86 | 8.8 | 3 |
| on-surface-variant on desk (page and slide numbers if drawn on it) | 5.96 | 8.87 | 4.5 |
| accent (selection edge) on surface-container-lowest | 5.86 | 8.8 | 3 |
| doc-accent (selection frame) on doc-paper (board only) | 5.96 | 5.96 | 3 |
| outline on surface-container-lowest (Download, Present, field edge) | 3.87 | 4.28 | 3 |
| outline on surface-container-low (window edge on bars) | 3.7 | 3.94 | 3 |
| outline on surface-container (edge on status band) | 3.21 | 3.58 | 3 |
| outline on desk | 3.21 | 4.28 | 3 |
| on-surface-variant on surface-container-low (icons) | 6.86 | 8.15 | 3 |
| surface-container-low (bars, navigator, inspector) on desk (container in light, container-lowest in dark) | 1.15 | 1.09 | 1.09 |
| surface-container (title band, status band) on surface-container-low | 1.15 | 1.1 | 1.09 |
| surface-container-lowest (tool, field) on surface-container-low | 1.05 | 1.09 | 1 |
| doc-paper (slide, page) on desk | 1.22 | 17.19 | 1.09 |
| doc-paper (thumbnail) on surface-container-low (navigator) | 1.06 | 15.81 | 1 |
| outline-variant (hairline) on surface-container-low | 1.51 | 1.7 | 1.3 |
| outline-variant (hairline) on surface-container | 1.31 | 1.55 | 1.3 |
| outline-variant (hairline) on desk | 1.31 | 1.85 | 1.3 |
| surface-container-low (window body) on wallpaper hill-1 | 1.66 | 1.6 | 1.09 |

## The runner-up

**Runner-up: A, One bar for four (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A one bar for four, B tools beside the page) and two judges compared every pair against today, in both orders, at 1280 and 390, both in Apricot light (today's dark captures are Classic dark, another theme). All 12 verdicts agreed: B won 4, A 2, today 0. Today lost on two rows of small unlabelled icons and, on the phone, a desktop window cut by the screen's edge. B won on grouping and findability: a file bar, the slide navigator, the document, a labelled inspector with a hint for disabled controls, and a status band; on the phone a labelled bottom bar at thumb reach. What A did better: a bigger slide, which the build won back by folding the inspector when nothing is selected. Say so here if you'd rather keep one toolbar on top for all four apps (A).

## The artboards on the board

- Direction · Tools beside the page
- Slides · 1280 · light · today
- Slides · 390 · light · today
- Slides · 1280 · light · proposed
- Slides · 390 · dark · proposed
- Docs · 1280 · light · today
- Docs · 390 · light · today
- Docs · 1280 · light · proposed
- Docs · 390 · dark · proposed
- Sheets · 1280 · light · today
- Sheets · 390 · light · today
- Sheets · 1280 · light · proposed
- Sheets · 390 · dark · proposed
- PDF · 1280 · light · today
- PDF · 390 · light · today
- PDF · 1280 · light · proposed
- PDF · 390 · dark · proposed
- Slides maximized · 1280 · light · proposed (extra)
- Runner-up A, One bar for four · light 1280 (sketch)
- Runner-up A, One bar for four · light 390 (sketch)
