import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FirstCalculationTimeoutError,
  STOP_EXECUTION,
  trackFirstCalculation,
  type CalculationEvents,
} from "./firstCalculation";

const SUCCESS = 3;
const NOT_EXECUTED = 2;
const INITIAL = 0;

/** Univer's two notifications, fired by hand. */
function events() {
  const starts = new Set<(force: boolean) => void>();
  const ends = new Set<(state: number) => void>();
  const hooks: CalculationEvents = {
    calculationStart: (cb) => {
      starts.add(cb);
      return { dispose: () => starts.delete(cb) };
    },
    calculationEnd: (cb) => {
      ends.add(cb);
      return { dispose: () => ends.delete(cb) };
    },
  };
  return {
    hooks,
    start: () => starts.forEach((cb) => cb(false)),
    end: (state: number) => ends.forEach((cb) => cb(state)),
    listening: () => starts.size + ends.size,
  };
}

const settled = async (p: Promise<unknown>) => {
  let done = false;
  void p.then(
    () => (done = true),
    () => (done = true),
  );
  await Promise.resolve();
  await Promise.resolve();
  return done;
};

afterEach(() => vi.useRealTimers());

describe("the first calculation", () => {
  it("is not pending before any calculation starts, so a save of a workbook with no formulas never waits", async () => {
    const e = events();
    const first = trackFirstCalculation(e.hooks);
    first.reset();
    expect(first.pending()).toBe(false);
    expect(await settled(first.whenDone(1000))).toBe(true);
  });

  it("waits through a stopped run, as an edit restarts it, and ends with the first run that is not stopped", async () => {
    const e = events();
    const first = trackFirstCalculation(e.hooks);
    first.reset();
    e.start();
    expect(first.pending()).toBe(true);
    const wait = first.whenDone(60_000);
    // An edit lands: Univer stops the run and starts it again with the edit added.
    e.end(STOP_EXECUTION);
    e.start();
    expect(await settled(wait)).toBe(false);
    e.end(SUCCESS);
    expect(await settled(wait)).toBe(true);
    expect(first.pending()).toBe(false);
  });

  it("counts a run with nothing to calculate, or one that ends unmarked, as done", () => {
    for (const state of [NOT_EXECUTED, INITIAL]) {
      const e = events();
      const first = trackFirstCalculation(e.hooks);
      first.reset();
      e.start();
      e.end(state);
      expect(first.pending()).toBe(false);
    }
  });

  it("does not wait for a later calculation once the first is done", async () => {
    const e = events();
    const first = trackFirstCalculation(e.hooks);
    first.reset();
    e.start();
    e.end(SUCCESS);
    e.start();
    expect(first.pending()).toBe(false);
    expect(await settled(first.whenDone(1000))).toBe(true);
  });

  it("starts over for each workbook loaded", () => {
    const e = events();
    const first = trackFirstCalculation(e.hooks);
    first.reset();
    e.start();
    e.end(SUCCESS);
    first.reset();
    e.start();
    expect(first.pending()).toBe(true);
  });

  it("gives up with a sentence after the limit", async () => {
    vi.useFakeTimers();
    const e = events();
    const first = trackFirstCalculation(e.hooks);
    first.reset();
    e.start();
    const wait = first.whenDone(1000);
    vi.advanceTimersByTime(1000);
    await expect(wait).rejects.toBeInstanceOf(FirstCalculationTimeoutError);
    expect(first.pending()).toBe(true);
  });

  it("stops listening when disposed, and a wait still pending rejects", async () => {
    const e = events();
    const first = trackFirstCalculation(e.hooks);
    first.reset();
    e.start();
    const wait = first.whenDone(60_000);
    first.dispose();
    await expect(wait).rejects.toThrow("closed");
    expect(e.listening()).toBe(0);
  });
});
