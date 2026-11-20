# The redesign: "Tools beside the page"

This folder is the design record of imbatranim-apps's redesign. The estate redesign board, where it was drawn and approved, is a private canvas; this is a copy of the app's page on it plus the build behind that page. The owner approved it on 2026-11-13, and [brief 11](../../corpus/briefs/done/11-a-redesign-with-hallmark-on-the-estate-board.md) built it. The code is now the source of truth: where the app and these files differ, the app wins, and later work may have moved a screen on. Read this folder to see what was decided and why before reshaping a screen.

## The owner's decisions

The owner approved the whole board on 2026-11-13, with every question standing at what the board proposed unless they reopened it. The questions this app's page asked:

- **Ask:** 1. Approve this direction, B "Tools beside the page"? It moves Slides' and PDF's tools into a labelled strip beside the document that opens as a panel or a popover, and position, notes and zoom into a status band, which reopens brief 11's toolbar position. 2. On a phone, may a window open maximized above the taskbar (today it keeps its desktop width and runs off the screen)? A yes is a request to imbatranimOS brief 88, with a kit bottom sheet. 3. Is Slide 1 of 6 for 1 / 6 fine, and PDF's Save moving to the left with the PDF label gone?
- **Open question:** Univer and SuperDoc paint their own chrome. Drawn as they paint today: Univer's blue, a white grid and ribbon in dark too, SuperDoc's white toolbar, their controls under 44 px on a phone. To check before the build: whether the pinned Univer's dark mode or theme option reaches the grid and ribbon, and whether the pinned SuperDoc reads CSS variables for its toolbar. If neither does, they stay as brief 11 says ("or not at all"); a dark Univer or SuperDoc is not drawn because that would be invented.
- **Open question:** Needs imbatranimOS brief 88: a window that opens maximized on a phone, a window that fills the screen minus 8 px below 1280 px, and a kit bottom sheet (18 px top corners, shadow-menu) for the Insert, Slide, Text and Shape groups and for PDF's Pages and Annotate; plus the kit popover (radius 14, shadow-menu) for the idle strip below 1100 px.
- **Open question:** Docs' refusal name test.doc is illustrative (the repo says only "a .doc conversion"); PDF's open-error text is the engine's own message, so its state is not drawn. On a phone PDF's Fit width and Fit page move into More.
- **Reopened:** Toolbar position. Recorded: "A change to the tab order, a toolbar's position or a dialog's wording is flagged on the board as a reopened decision" and "the likeliest to reopen is the layout of the toolbars, which copy desktop office suites" (imbatranim-apps brief 11, Context and Owner decisions). Slides' and PDF's tools move from rows on top to a strip and panel at the right; PDF's Save moves from the far right to the left.
- **Reopened:** Wording. 1 / 6 becomes Slide 1 of 6 and PDF's Page 1 / 15 becomes Page 1 of 15 (brief 11: a dialog's wording is a reopened call). Three tooltips lose their em dash because the Floor forbids it: Drawn by this app, layout may differ from PowerPoint; Save (Ctrl+S), write changes back to the file; Sign: capture a signature and stamp it on the page.

Where the files below disagree, the later layer wins: the owner's decisions, then the controller's rulings, then the judges' rulings, then the directions file.

## What is here

| Path | What it holds |
|---|---|
| `directions/imbatranim-apps.md` | The director's brief: both directions (the winner is the one built), the shared fixture and the screens to draw. |
| `judge/imbatranim-apps/RESULT.md` | The blind judging against today and the rulings that came with the win. |
| `critiques/imbatranim-apps-controller.md`, `critiques/imbatranim-apps.md` | The design critic's review against today, and the controller's rulings over it. |
| `manifests/imbatranim-apps.tokens.css`, `manifests/imbatranim-apps.tokens-map.md` | The token hand-off in the app's own names, and the renamed, new and unused tokens. |
| `manifests/imbatranim-apps.board-notes.md` | What the board said beside the screens: the asks, decisions, reopened rules, open questions, the contrast table and the runner-up. |
| `work/imbatranim-apps/twins/*.html` | Each drawn screen as static HTML, light and dark: open one in a browser. |
| `work/imbatranim-apps/shots/` | The twins rendered at 1280 and 390, light and dark, WebP. `direction.webp` is the board's direction sheet. |
| `shots/imbatranim-apps/` | Today's screens as the board showed them before the redesign. |

People's names and data in the pictures come from seeded demo accounts or are invented.

## Not here

The sketches and the judges' images, the runner-up's build (its notes are in the board's notes), the build's scripts, and the screenshots taken while it was built. They stay in the estate build folder.
