---
summary: Brief 09's calls (2026-11-12) - an app imports no Base UI, only the kit; which kit control stands in for a hand-built one (Toggle, RadioGroup, Tabs, ToggleGroup, Checkbox, Select), when a dialog sets disablePointerDismissal, and what stays native with its reason.
updated: 2026-11-12
---

# Base UI only through the kit, and which kit control

Brief 09 applied the owner's Base UI call of 2026-11-09. The skill lets Base UI
into a `ui/` folder; here an app imports **no** Base UI at all (Q15), because the
OS's `ui-conventions.md` rule 4 says a missing control goes into the kit and
never a private copy, and its rule 1 limits an add-on to `@imbatranim/ui`,
`lucide-react`, `react` and `@tanstack/react-query`. The OS's rule is stricter, so
it wins. The kit is the one `ui/` folder an app may reach.

Which kit control stands in for a hand-built one:

- On or off is `Toggle` (`aria-pressed`). A choice of one kept in the app is a
  `RadioGroup` (`Tabs` where it switches panels); a picker that saves to a server
  on each choice would be a `ToggleGroup` with `keepOne` (none here).
- A dialog that holds a form sets `disablePointerDismissal` (Q58): it closes with
  Cancel, the X or Esc, never with a stray click. A dialog that only shows or picks
  keeps outside-press dismissal. The curl dialog is both: it holds its text in
  import mode and only shows a command in export mode, so the prop follows the mode.
- Todo's "Move to" row is an unguarded `ToggleGroup`, not a `RadioGroup`: a pick
  files the task and closes the row, and the arrow keys of a `RadioGroup` would
  pick on the way. Pressing the chosen list again still counts as a pick that
  closes the row, which `keepOne` would swallow.
- Left native, each on record in `tools/conventions.json`: the slide rail (a
  draggable listbox), a PDF's own radio and multiple-choice listbox fields (the
  document's controls), and the native date, time and text inputs (Q16).

