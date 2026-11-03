# Brief 03 — A save during Sheets' first calculation writes whole values

## Context

Found on 2026-10-28 ([wiki/sheets-app.md](../../wiki/sheets-app.md)), once
the row-1000 fix let all 220,000 formulas of `big-formulas.xlsx` compute. In
the production image, a `longtask` observer from the open until Univer's
progress bar went away saw 2 to 15 tasks over 1 s, the longest 2.7-4.0 s,
between 17 and 319 s after the grid showed. A CPU profile put it on the
formula worker's results arriving on the main thread: the RPC channel's
message listener (`@univerjs/rpc`, deserializing a batch), Univer writing
the values into the model (`forValue`, `_cellValueToRange`), garbage
collection and redraws. The calculation itself stays in the worker. The
machine was shared with other builds; the sizes at low load are not known.

Two bugs come with it:

- A save during that first calculation writes the formulas with **no cached
  values** (all 220,000 empty in openpyxl): an edit at 40 s and Ctrl+S saved
  in 18 s, because `onCalculationResultApplied`
  (`apps/sheets/src/engine/univer.ts`) resolved for the edit's own small
  calculation, not the first one. A save after the calculation wrote every
  value right.
- While it runs, the formula bar shows the raw locale key
  `sheets-formula.progress.calculating`.

The owner chose on 2026-11-03 to fix the two bugs and take a short look at
the freezes; the freezes themselves may stay. Promoted from the todo
`2026-10-28-sheets-big-first-calculation`.

## Spec

1. **A save waits for the first calculation.** Track when the workbook's
   first full calculation is done (not any calculation), and make a save
   wait for it, showing that it waits. A save after it behaves as today.
2. **The formula bar's label.** Add the missing `sheets-formula` locale
   strings so the progress reads as words.
3. **A look at the freezes, time-boxed to an hour of reading.** Look in
   Univer's formula and RPC packages (the version this repo pins) for a
   setting that sizes the result batches or spaces them out. If one exists,
   try it once on `big-formulas.xlsx` and keep it if the longest task drops.
   If none exists, write the upstream report's text (what, the profile's
   findings, the file's shape) into the outcome for the owner to file; don't
   file it.

## Acceptance

- A test: a save started before the first calculation finishes waits, and
  the saved file has cached values; a save after it doesn't wait.
- The formula bar shows a word label during the calculation.
- The outcome says what the look found: the setting and its effect, or the
  upstream text.
- No timing series: one before/after run at most, on a quiet machine, or
  none if it's busy, and the outcome says which.
- Typecheck, lint and Sheets' tests pass.

## Files you OWN

- `apps/sheets/src/engine/univer.ts`, `apps/sheets/src/engine/formulaWorker.ts`
- Sheets' save path and its locale setup in `apps/sheets/src/`
- `corpus/wiki/sheets-app.md` (what the look found)
