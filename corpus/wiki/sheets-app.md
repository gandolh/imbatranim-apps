---
summary: How the Sheets app is built, moved in from the OS on 2026-10-22. Univer 0.25.1 with the ExcelJS bridge, the shared refcounted xlsx worker, Univer's formula engine in a worker of each window's own (2026-10-28), why each sheet is sized to its data and its formulas' references (the row-1000 bug), the main-thread task the owner accepted, the big first calculation (a save waits for it since 2026-11-05; the freezes stay, no Univer setting spaces the results), and the formula bar's progress words.
updated: 2026-11-05
---

# Sheets

`apps/sheets/` was copied from the OS's built-in at imbatranimOS `56e23b7` and
replaced it on 2026-10-28 ([status.md](status.md)). The code wins where this
page and it disagree. Test workbooks: [test-files.md](test-files.md).

## Engine

`@univerjs/presets` 0.25.1, ExcelJS 4.4.0 and fflate, exact pins, as the
built-in had them. Univer's stylesheet needs two declared allowances, its
`--univer-` namespace and one dropped scrollbar reset
([stylesheets.md](stylesheets.md)).

## The xlsx worker

`engine/xlsxWorker.ts` parses and saves, one file in `dist/os/workers/`
shared by every Sheets window. `engine/xlsxBridge.ts` counts its holders and
stops it only when no window holds it and nothing is in flight, so closing a
window during a save no longer loses the write.

## Formulas in a worker

Since 2026-10-28 Univer's formula engine runs in `engine/formulaWorker.ts`, one
per window (`workers/formulaWorker-*.mjs` in the build). The 6.8 s main-thread
freeze on a 220,000-formula workbook is gone, and a save waits for results.
One task of 210–285 ms stays after the grid draws: Univer's `WHEN_EMPTY` scan
in `TriggerCalculationController._initialExecuteFormula`. The owner accepted
it on 2026-10-28; `CalculationMode.FORCED` and an upstream report were not
tried.

## Sheet size: the row-1000 bug

A Univer sheet is 1,000 × 20 cells unless told otherwise, and a single-cell
reference outside it isn't a reference: `=A1001*2` computes `#NAME?`, and a
save writes that as the cached value. Ranges are unaffected
(`SUM(A1:A5000)` computes past the edge). On the 220,000-formula test
workbook about 95% of formulas were errors.

Since 2026-10-28 `engine/extent.ts` sizes each sheet: `parse` notes every cell
with data and every cell a formula anywhere in the workbook points at by a
single-cell reference (own sheet or named, quoted names too), and sets
`rowCount` and `columnCount` from the furthest, never under 1,000 × 20 and
never past Excel's 1,048,576 × 16,384. Not Excel's whole grid, because Univer
lays out every row and column. `csvToUniver` gets a row per line. String
literals are skipped, so `INDIRECT("A5000")` past the data still errs.

## The big first calculation

With every formula really computing, the 220,000-formula workbook's first
calculation takes 4.6–5.3 minutes in the worker (load 20–40), and the main
thread freezes 1–4 s in bursts while results land (RPC deserialization,
writing values, GC, a redraw). The owner chose on 2026-11-03 to let the
freezes stay; a sheet with one reference at Excel's last row draws its grid in
1.6–2.1 s, scrolling it untried.

**A save waits for the first calculation** (2026-11-05). Univer's
`onCalculationResultApplied` waits for the *latest* calculation and counts a
stopped one as finished. An edit during the first calculation stops it and
starts it again with the edit added (the trigger controller keeps the first
calculation's dirty data until a run ends without a stop), so a save resolved
in that gap and wrote formulas with no cached values. `engine/firstCalculation.ts`
tracks the first calculation itself, from the first `calculationStart` after a
load to the first `calculationEnd` that isn't `STOP_EXECUTION`; `snapshot()`
waits for it (15 minutes at most) and the toolbar says "Saving once the
formulas finish calculating…". Left open: an edit landing after a run's
SUCCESS but before its results are written can still let a save resolve early.

**The formula bar's progress words.** Univer's formula plugin asks for
`sheets-formula.progress.{analyzing,calculating,array-analysis,array-calculation,done}`
and no 0.25.1 locale has them; the en-US locale merges ours in. They show only
for a run over about a second (the controller's start timer). Univer's own bar
reads "Done" at a stop, before the restart.

**No setting spaces out the results** (a look on 2026-11-05). In 0.25.1 the
engine's `intervalCount` (default 500) only sets how often the worker yields
and posts a six-number progress message; each run's results go to the main
thread as one `SetFormulaCalculationResultMutation` with the whole `unitData`,
applied in one go, and `@univerjs/rpc` has no chunking. The upstream report's
text is in brief 03's outcome.
