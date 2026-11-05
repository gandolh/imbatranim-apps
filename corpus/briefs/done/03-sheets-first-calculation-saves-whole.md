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

## Outcome (2026-11-05)

Done in `7950024`.

1. **Why the save didn't wait.** Univer's `onCalculationResultApplied` waits
   for the latest calculation and treats a *stopped* one as finished. An
   edit during the first calculation makes the trigger controller stop it
   and start it again with the edit merged in (`_executingDirtyData` keeps
   the first calculation's work until a run ends without a stop). The save's
   wait resolved in the gap between the stop and the restart.
   `engine/firstCalculation.ts` tracks the first calculation itself: from the
   first `calculationStart` after a load to the first `calculationEnd` that
   isn't `STOP_EXECUTION` (SUCCESS, NOT_EXECUTED, or INITIAL, the runtime's
   reset value). `snapshot()` waits for it, then for the latest results as
   before, and checks again in case it started inside Univer's 500 ms start
   window. Its own limit is 15 minutes (`FIRST_CALCULATION_WAIT_MS`; the 120 s
   one would fail on the very workbook this is for), then a sentence that the
   formulas are still calculating, not the generic "could not reach the OS".
   A workbook with no formulas never waits.
2. **It shows that it waits:** "Saving once the formulas finish
   calculating…" in the toolbar beside Save.
3. **The formula bar's label:** no locale Univer 0.25.1 ships has
   `sheets-formula.progress.*`; the en-US locale merges five strings in
   (`PROGRESS_STRINGS`: Analyzing formulas, Calculating, Analyzing array
   formulas, Calculating array formulas, Done). Univer's `merge` is lodash's
   deep merge, so the function list stays.
4. **The look (about 20 minutes of reading, of the hour).** No setting sizes
   or spaces out the result batches in 0.25.1:
   - `ENGINE_FORMULA_PLUGIN_CONFIG_KEY.intervalCount` (default 500) only sets
     how often the worker yields and posts a progress notification, six
     numbers (`getRuntimeState()`).
   - Each run's results reach the main thread as **one**
     `SetFormulaCalculationResultMutation` carrying the whole `unitData`
     (`CalculateController._applyResult`), after the run; the main thread
     applies it in one `SetRangeValuesMutation`. A stopped run sends none.
   - `@univerjs/rpc` has no chunking or batch setting.
   So nothing was tried and there is no before/after run. Text for an
   upstream report, for the owner to file:

   > **Large first calculation freezes the main thread when its results
   > arrive (sheets-core preset with the formula worker, 0.25.1).** With
   > `UniverSheetsCorePreset({ workerURL })` and a workbook of about 220,000
   > formulas (one sheet of mostly single-cell references and SUM/IF chains,
   > sized past row 1,000), the first calculation runs 4.6–5.3 min in the
   > worker. While it runs the main thread shows 2–15 long tasks over 1 s,
   > the longest 2.7–4.0 s, between 17 and 319 s after the grid draws. A CPU
   > profile puts them in the RPC channel's message listener (deserializing
   > the result), `forValue`/`_cellValueToRange` writing values into the
   > model, GC, and a redraw. Each run sends its results as a single
   > `SetFormulaCalculationResultMutation` with the whole `unitData`, and
   > `intervalCount` only paces progress notifications. Could results be
   > sent and applied in chunks (by row range or cell count), or yielded
   > between sheets, so the main thread stays responsive? Separately:
   > `FormulaCalculationSessionService.waitForLatestApplied` resolves when an
   > edit stops a running calculation, before the restarted run's results
   > land, so a save that waits on `onCalculationResultApplied` can write
   > formulas with no cached values.

**Checked:**
- `firstCalculation.test.ts` (7): no wait when nothing started; a stop and
  restart keep the wait, the next non-stop end releases it; NOT_EXECUTED and
  INITIAL count as done; a later calculation isn't waited on; each load
  starts over; the limit's error; dispose stops listening and rejects.
- `univer.test.ts`: a save during the first calculation waits through a
  stop/restart and writes the values computed at its end (it resolved early
  before); a save after it waits only for the latest results; the five
  progress strings reach the en-US locale.
- `App.test.tsx`: the toolbar says the save waits, and the upload happens
  once the calculation is done.
- Typecheck, lint, Sheets' tests (99).
- **In the OS** (dev container, Office reinstalled at `7950024`), with a
  generated workbook of 30,000 `=SUM($A$1:$A$2000)+ROW()` formulas
  (openpyxl, no cached values): the formula bar read "Analyzing formulas",
  then "Calculating", then "Done" about 19 s later. Opened again, a value
  typed into E7 and Ctrl+S about 2 s into the calculation: the toolbar said
  "Saving once the formulas finish calculating…" with column B still empty,
  and the saved file had all 30,000 cached values and E7 = 7 (read back with
  openpyxl). Because each run's results arrive in one message at its end,
  a save that hadn't waited would have had none.
- Not run: `big-formulas.xlsx` itself (a 5-minute calculation; the machine
  was at load ~3) and any timing of the freezes.
