# imbatranim-apps tokens map (direction B, Tools beside the page)

The apps inherit the desktop's tokens (Apricot, light and dark) unchanged; the OS tokens file is `imbatranimOS.tokens.css`. The board drew the apps in the desktop's own `--k-*` and `--accent*` names, so nothing is renamed. The apps may not define tokens themselves (utilities only, no `--color-*`), so the new geometry tokens go to the kit's `theme.css` through imbatranimOS brief 88 and arrive with `kit:sync`.

## Renamed or remapped (board role to app token)

None. Which OS token each part uses:
- Title band, status band: `--k-surface-container`. The desk (slide, page and sheet ground): `--k-surface-container` in light and `--k-surface-container-lowest` in dark, so the panels read one step up in both themes; this is the apps' role mapping, the OS tokens do not change (a `dark:` variant on the desk class). App bar, navigator, inspector, annotate panel, bottom bar: `--k-surface-container-low`.
- Tool buttons, fields, Download and Present: `--k-surface-container-lowest`, with an `--k-outline-variant` edge (tools) or `--k-outline` edge (Download, Present, fields).
- Hover `--k-surface-container-high`, pressed `--k-surface-container-highest`. Hairlines `--k-outline-variant`.
- Text `--k-on-surface`; readouts, group heads, hints `--k-on-surface-variant`. Slide numbers: Solway 700 at `--text-index` (16/20), `--k-on-surface-variant`, the current one `--accent`.
- Selected (pressed toggles, tool in use, width in use): `--accent-soft` with `--accent-soft-on` and an `--accent-soft-edge` edge. Focus ring and the current-slide frame: `--accent`. Delete: `--k-error`.
- Type: `--text-label` (11/15), `--text-control` (12/16), `--text-body` (13/18), phone sizes through the coarse-pointer block; state titles `--text-headline` in `--font-display`.
- Radii `--k-radius-control` (10), `--k-radius-item` (8), `--k-radius-window` (12), `--k-radius-menu` (14). Shadows: the window `--k-shadow-window-focused`, menus and the phone sheet `--k-shadow-menu`; bars and panes have none.

## New tokens (and the component that needs each)

- `--container-navigator`, `--container-navigator-max`: Slides' navigator, which grows with the window's height; `--container-pdf-navigator`: PDF's side panel; `--container-inspector`, `--container-inspector-strip`: Slides' inspector, docked and idle; `--container-annotate`, `--container-pdf-strip`: PDF's annotate panel and its idle strip; `--container-popover`: the 264 px popover that opens a group below 1100 px window width.
- `--spacing-appbar`, `--spacing-appbar-phone`, `--spacing-statusbar`, `--spacing-statusbar-phone`, `--spacing-bottombar`: the 40 px app bar, status band and phone bottom bar of all four apps; `--spacing-target`: 44 px phone targets.
- A sheet radius of 18 px (the phone bottom sheet's top corners) is the OS's literal in its phone Start; the kit's bottom sheet (imbatranimOS brief 88) owns it.

Board only, not for the code: `--desk` (the board's name for the desk mapping above), `--doc-paper`, `--doc-ink` (slide and page stay #ffffff and #000000, as the deck and the document have them), `--doc-accent` (the selection frame on a white slide, `#a04b23` in both themes because the pastel accent is 1.9:1 on white; the code uses a fixed colour for it, beside the `bg-white` exceptions of brief 09), `--vendor-*` (SuperDoc's and Univer's own surfaces, ink and blue; no token reaches them), `--mark-*` (PDF's five existing mark colours, Saffron, Rose, Leaf, Sky and Ink, from `AnnotateToolbar.tsx`).

## App tokens the design no longer uses (keep or drop is the code brief's call)

- `text-nano` (the 8 px `▾`) and `text-tiny` (10 px `A-`) in Slides' two rows; `text-micro`.
- The kit's `shadow` on a floating window is unchanged; the idle strip needs the kit's popover (imbatranimOS brief 88).
- The 19.5 px and 16.25 px control sizes (`h-6`, `h-5`): controls are 32 px at 1280 and 44 px on a phone.
- PDF's strong-fill pressed state (`primary` fill on the current tool and the rail toggles): selection becomes `accent-soft` with its edge.
- The doubled file name in the bar, PDF's `PDF` brand label and Slides' number badge over the thumbnail (`bg-on-surface` badge): the title band carries the name and the number moves beside the thumbnail.
