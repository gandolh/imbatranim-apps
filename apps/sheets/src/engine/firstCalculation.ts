/**
 * When a workbook's first calculation is done.
 *
 * Univer's `onCalculationResultApplied` waits for the *latest* calculation,
 * and treats a stopped one as finished. An edit during a workbook's first
 * calculation stops it and starts it again with the edit added (Univer keeps
 * the first calculation's work until a calculation ends without being
 * stopped), so a save that waited only for "the latest" resolved in the gap
 * and wrote 220,000 formulas with no cached values. This tracks the first
 * calculation itself: it starts with the first `calculationStart` after a
 * load and ends with the first `calculationEnd` that isn't a stop.
 */

/** Univer's `FormulaExecutedStateType.STOP_EXECUTION`. */
export const STOP_EXECUTION = 1

type Disposable = { dispose: () => void }

export type CalculationEvents = {
  calculationStart: (cb: (forceCalculation: boolean) => void) => Disposable
  calculationEnd: (cb: (functionsExecutedState: number) => void) => Disposable
}

export class FirstCalculationTimeoutError extends Error {
  constructor() {
    super('The formulas are still calculating, so the spreadsheet was not saved. Try again later.')
    this.name = 'FirstCalculationTimeoutError'
  }
}

export type FirstCalculation = {
  /** A workbook was loaded: its first calculation is the next one to start. */
  reset: () => void
  /** True from the first calculation's start until it ends without being stopped. */
  pending: () => boolean
  /**
   * Resolves once the first calculation has ended; at once when it has, or
   * when none has started since the load. Rejects with
   * {@link FirstCalculationTimeoutError} after `timeoutMs`.
   */
  whenDone: (timeoutMs: number) => Promise<void>
  /** Stop listening; a wait still pending rejects. */
  dispose: () => void
}

type Waiter = { resolve: () => void; reject: (err: Error) => void; timer: ReturnType<typeof setTimeout> }

export function trackFirstCalculation(events: CalculationEvents): FirstCalculation {
  let state: 'idle' | 'running' | 'done' = 'idle'
  let waiters: Waiter[] = []

  const settle = (fn: (w: Waiter) => void) => {
    const current = waiters
    waiters = []
    for (const w of current) {
      clearTimeout(w.timer)
      fn(w)
    }
  }

  const starts = events.calculationStart(() => {
    if (state === 'idle') state = 'running'
  })
  const ends = events.calculationEnd((executed) => {
    if (state === 'done' || executed === STOP_EXECUTION) return
    state = 'done'
    settle((w) => w.resolve())
  })

  return {
    reset: () => {
      state = 'idle'
      // A wait for the previous workbook has nothing left to wait for.
      settle((w) => w.resolve())
    },
    pending: () => state === 'running',
    whenDone: (timeoutMs) => {
      if (state !== 'running') return Promise.resolve()
      return new Promise<void>((resolve, reject) => {
        const waiter: Waiter = {
          resolve,
          reject,
          timer: setTimeout(() => {
            waiters = waiters.filter((w) => w !== waiter)
            reject(new FirstCalculationTimeoutError())
          }, timeoutMs),
        }
        waiters.push(waiter)
      })
    },
    dispose: () => {
      starts.dispose()
      ends.dispose()
      settle((w) => w.reject(new Error('The spreadsheet was closed.')))
    },
  }
}
