---
summary: The owner's call of 2026-11-13 on the board, "Tools beside the page" (direction B): Slides' and PDF's tools in a labelled inspector beside the document, a status band at the foot, PDF's Save at the left, 32 px controls (44 on a phone) in the four drawn apps against the OS's rule 15, CAD at 28 px; what it reopened, what it rejected and why.
updated: 2026-11-15
---

# The apps' layout: tools beside the page

Split out of [decisions.md](decisions.md). The shipped result is
[DESIGN.md](../../DESIGN.md) at the repo root.

_2026-11-13_ — The owner approved direction B, "Tools beside the page", on
the estate board (runner-up A, "One bar for four"). It reopens two calls.
Brief 11's default, "the proposal keeps each app's feature set, its window
chrome and the kit's controls. A change to the tab order, a toolbar's
position or a dialog's wording is flagged on the board as a reopened
decision": Slides' and PDF's tools leave the rows on top for a labelled
inspector beside the document (a strip when idle, a panel or popover when
open); position, notes and zoom move to a status band at the foot; PDF's
Save moves left and its `PDF` label and doubled file name go. Docs and Sheets
keep SuperDoc's and Univer's toolbars on top. And imbatranimOS's
ui-conventions rule 15, "compact toolbars, icon buttons `h-5 w-5`": the four
drawn apps' controls are 32 px on a desktop and 44 px on a phone (OS 88
notes the exception on its rules page). CAD keeps 28 px tools (24 px or more
on a desktop, 44 on a phone): with 32 px buttons its toolbar wraps at the
958 px window. "Kit apps, on the desktop's shared kit" and "utilities only,
no `--color-*`" stand.
Rejected: A, one bar for four, the runner-up; today's two rows of small
unlabelled icons, which lost every pair, and on a phone a desktop window cut
by the screen's edge.
**Why**: the board's judges picked B on grouping and findability (a file
bar, the navigator, the document, a labelled inspector with a hint for
disabled controls, a status band; on a phone a labelled bottom bar at thumb
reach). Their one cost, a much smaller slide, was answered by the strip
when idle, so the slide keeps about 751 px in the 958 px window. What
shipped is in [DESIGN.md](../../DESIGN.md).
