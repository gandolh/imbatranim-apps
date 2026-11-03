---
summary: How the Sheets app is built, moved in from the OS on 2026-10-22. Univer 0.25.1 with the ExcelJS bridge, the shared refcounted xlsx worker, Univer's formula engine in a worker of each window's own (2026-10-28), why each sheet is sized to its data and its formulas' references (the row-1000 bug), the main-thread task the owner accepted, and the open big-first-calculation freeze.
updated: 2026-11-03
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

## Open: the big first calculation

With every formula really computing, the 220,000-formula workbook's first
calculation takes 4.6–5.3 minutes in the worker (load 20–40), and the main
thread freezes 1–4 s in bursts while results land (RPC deserialization,
writing values, GC, a redraw). A save during it writes formulas with no
cached values. Brief 03 (2026-11-03) makes a save wait for the first calculation, fixes the
formula bar's label and takes a time-boxed look at Univer's settings. A sheet with one
reference at Excel's last row draws its grid in 1.6–2.1 s; scrolling it wasn't
tried.
