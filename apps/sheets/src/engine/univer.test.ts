// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CALCULATION_WAIT_MS, PROGRESS_STRINGS, createSheetEngine } from './univer'

/**
 * Univer, at the module boundary: what is under test is how Sheets wires the
 * formula worker into the preset, waits for a calculation before a save and
 * tells edits from recalculation. jsdom has no Worker, so a fake records how it
 * was started.
 */
const u = vi.hoisted(() => ({
  presetConfig: null as null | Record<string, unknown>,
  commandListener: null as null | ((c: { type: number; id: string }) => void),
  waits: [] as (number | undefined)[],
  calculation: Promise.resolve() as Promise<void>,
  saved: 0,
  univerDisposed: false,
  order: [] as string[],
  /** What the model holds; a save writes it. */
  values: undefined as string | undefined,
  starts: [] as ((force: boolean) => void)[],
  ends: [] as ((state: number) => void)[],
  options: null as null | { locales: Record<string, unknown> },
}))

const STOPPED = 1
const SUCCESS = 3

vi.mock('@univerjs/presets', () => ({
  LocaleType: { EN_US: 'enUS' },
  defaultTheme: {},
  merge: (...objects: object[]) => Object.assign({}, ...objects),
  createUniver: (options: { locales: Record<string, unknown> }) => {
    u.options = options
    return {
    univer: {
      dispose: () => {
        u.univerDisposed = true
        u.order.push('univer.dispose')
      },
    },
    univerAPI: {
      createWorkbook: () => ({
        dispose: () => {},
        save: () => {
          u.saved++
          u.order.push('save')
          return u.values === undefined
            ? { id: 'wb', sheetOrder: [] }
            : { id: 'wb', sheetOrder: [], values: u.values }
        },
      }),
      onCommandExecuted: (cb: (c: { type: number; id: string }) => void) => {
        u.commandListener = cb
        return { dispose: () => {} }
      },
      getFormula: () => ({
        onCalculationResultApplied: (timeout?: number) => {
          u.waits.push(timeout)
          u.order.push('wait')
          return u.calculation
        },
        calculationStart: (cb: (force: boolean) => void) => {
          u.starts.push(cb)
          return { dispose: () => {} }
        },
        calculationEnd: (cb: (state: number) => void) => {
          u.ends.push(cb)
          return { dispose: () => {} }
        },
      }),
    },
    }
  },
}))

const start = () => u.starts.forEach((cb) => cb(false))
const end = (state: number) => u.ends.forEach((cb) => cb(state))

vi.mock('@univerjs/preset-sheets-core', () => ({
  UniverSheetsCorePreset: (config: Record<string, unknown>) => {
    u.presetConfig = config
    return { plugins: [] }
  },
}))
vi.mock('@univerjs/preset-sheets-core/locales/en-US', () => ({ default: {} }))

class FakeWorker {
  static started: FakeWorker[] = []
  terminated = false
  readonly url: URL | string
  readonly options?: WorkerOptions
  constructor(url: URL | string, options?: WorkerOptions) {
    this.url = url
    this.options = options
    FakeWorker.started.push(this)
  }
  terminate() {
    this.terminated = true
    u.order.push('worker.terminate')
  }
}

beforeEach(() => {
  FakeWorker.started = []
  vi.stubGlobal('Worker', FakeWorker)
  Object.assign(u, {
    presetConfig: null,
    commandListener: null,
    waits: [],
    calculation: Promise.resolve(),
    saved: 0,
    univerDisposed: false,
    order: [],
    values: undefined,
    starts: [],
    ends: [],
    options: null,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the Sheets engine', () => {
  it("starts this window's formula worker as a module file and hands it to the preset", async () => {
    const container = document.createElement('div')
    const engine = await createSheetEngine(container)
    expect(FakeWorker.started).toHaveLength(1)
    const [worker] = FakeWorker.started
    expect(new URL(String(worker.url)).pathname).toMatch(/\/formulaWorker\.ts$/)
    expect(worker.options).toEqual({ type: 'module' })
    // A Worker, not a URL: Univer would start a URL as a classic worker.
    expect(u.presetConfig).toMatchObject({ container, workerURL: worker })
    engine.destroy()
  })

  it('terminates the worker after Univer is disposed: Univer does not own a worker it was handed', async () => {
    const engine = await createSheetEngine(document.createElement('div'))
    engine.destroy()
    expect(FakeWorker.started[0].terminated).toBe(true)
    expect(u.order).toEqual(['univer.dispose', 'worker.terminate'])
  })

  it('waits for the latest calculation before it snapshots the workbook for a save', async () => {
    const engine = await createSheetEngine(document.createElement('div'))
    expect(await engine.snapshot()).toBeNull()
    expect(u.waits).toEqual([])

    engine.loadWorkbook({ id: 'wb' })
    let finish = () => {}
    u.calculation = new Promise<void>((resolve) => {
      finish = resolve
    })
    const pending = engine.snapshot()
    await Promise.resolve()
    expect(u.waits).toEqual([CALCULATION_WAIT_MS])
    expect(u.saved).toBe(0)
    finish()
    expect(await pending).toEqual({ id: 'wb', sheetOrder: [] })
    expect(u.order).toEqual(['wait', 'save'])
  })

  it('fails the snapshot, writing nothing, when formulas are still calculating at the limit', async () => {
    const engine = await createSheetEngine(document.createElement('div'))
    engine.loadWorkbook({ id: 'wb' })
    u.calculation = Promise.reject(new Error('Calculation end timeout'))
    await expect(engine.snapshot()).rejects.toThrow('Calculation end timeout')
    expect(u.saved).toBe(0)
  })

  it('makes a save during the first calculation wait for it, through an edit that restarts it, and write the values it computed', async () => {
    const engine = await createSheetEngine(document.createElement('div'))
    engine.loadWorkbook({ id: 'wb' })
    start()
    expect(engine.firstCalculationPending()).toBe(true)
    const pending = engine.snapshot()
    // An edit lands: Univer stops the first run, Univer's own "latest
    // calculation" wait resolves, and the run starts again with the edit.
    end(STOPPED)
    start()
    for (let i = 0; i < 5; i++) await Promise.resolve()
    expect(u.saved).toBe(0)
    u.values = 'computed'
    end(SUCCESS)
    expect(await pending).toEqual({ id: 'wb', sheetOrder: [], values: 'computed' })
    expect(engine.firstCalculationPending()).toBe(false)
  })

  it('does not wait for the first calculation once it is done, only for the latest one', async () => {
    const engine = await createSheetEngine(document.createElement('div'))
    engine.loadWorkbook({ id: 'wb' })
    start()
    end(SUCCESS)
    start()
    expect(engine.firstCalculationPending()).toBe(false)
    await engine.snapshot()
    expect(u.waits).toEqual([CALCULATION_WAIT_MS])
  })

  it('gives the formula bar words for its progress', async () => {
    await createSheetEngine(document.createElement('div'))
    const enUS = u.options!.locales.enUS as typeof PROGRESS_STRINGS
    expect(enUS['sheets-formula'].progress).toEqual({
      analyzing: 'Analyzing formulas',
      calculating: 'Calculating',
      'array-analysis': 'Analyzing array formulas',
      'array-calculation': 'Calculating array formulas',
      done: 'Done',
    })
  })

  it('counts commands as edits, and never the mutations recalculation sends back', async () => {
    vi.useFakeTimers()
    try {
      const engine = await createSheetEngine(document.createElement('div'))
      const edits: number[] = []
      engine.onEdit(() => edits.push(engine.editCount()))
      engine.loadWorkbook({ id: 'wb' })
      // Mutations while the workbook loads and after: formula results from the worker.
      u.commandListener!({ type: 2, id: 'sheet.command.set-range-values' })
      vi.runAllTimers()
      u.commandListener!({ type: 2, id: 'sheet.mutation.set-formula-calculation-result' })
      u.commandListener!({ type: 2, id: 'sheet.mutation.set-range-values' })
      expect(edits).toEqual([])
      u.commandListener!({ type: 1, id: 'sheet.command.set-range-values' })
      expect(edits).toEqual([1])
    } finally {
      vi.useRealTimers()
    }
  })
})
