import { useEffect, useSyncExternalStore } from 'react'
import {
  FileConflictError,
  type DataKind,
  type SystemData,
  type SystemHandle,
} from '@imbatranim/ui'

/**
 * An app's state as files in its own folder (`system.data`), held once per
 * page: the module is imported once, so the app's windows and its background
 * service or command source share one copy.
 *
 * - **Every change is a pure function of the state.** It is applied at once
 *   (the window shows it before the files are written), then saved, each
 *   file written with the version it was read at.
 * - **Changes take turns.** A window that deletes ten tasks in a loop writes
 *   them one after the other, never two writes against one version.
 * - **Another tab's save wins the race, not the data.** A write refused as
 *   stale reloads the files and applies the change again to what is there
 *   now, up to three times.
 * - **A failure puts the files' state back** and rejects, so the caller can
 *   say the change was not saved.
 */

/** What was read: the state, and each file's text and version as read. */
export type Loaded<S> = {
  state: S
  /** Each file's text as read (or as last written), by path. */
  contents: Map<string, string>
  /** Each file's version, by path; null for a file that was not there. */
  versions: Map<string, string | null>
  /**
   * The state differs from the files in a way the files should catch up
   * with now, not at the next change (a renumbered duplicate id): the store
   * writes it back as soon as it has read it.
   */
  repaired?: boolean
}

export type DataStoreFiles<S> = {
  /** Read every file the state is made of. */
  load(data: SystemData): Promise<Loaded<S>>
  /** The files `state` is written as, by path: a path missing here is removed. */
  serialize(state: S): Map<string, string>
  /**
   * The order to write changed files in, given what each held before. A file
   * that gains an item goes first, so a move between files never leaves the
   * item in neither if the second write fails.
   */
  writeFirst?(path: string, before: string | undefined, after: string): boolean
  /** Paths that are never removed, even when `serialize` leaves them out. */
  keep?: ReadonlySet<string>
}

const ATTEMPTS = 3

export type DataStore<S> = {
  /** The state as this page knows it; undefined until the first load. */
  get(): S | undefined
  /** Whether the last load failed (and nothing was loaded before it). */
  failed(): boolean
  /** When the files were last read or written (`Date.now()`), 0 before. */
  loadedAt(): number
  subscribe(listener: () => void): () => void
  /** Read the files again. Resolves once read; rejects only if reading failed. */
  refresh(data: SystemData): Promise<S>
  /** Apply `op` and save. Resolves `op`'s result once the files are written. */
  change<R>(data: SystemData, op: (state: S) => { next: S; result: R }): Promise<R>
  /** Forget everything, for tests. */
  reset(): void
}

export function createDataStore<S>(files: DataStoreFiles<S>): DataStore<S> {
  let loaded: Loaded<S> | undefined
  /** What the windows see: `loaded`'s state, or a change not saved yet. */
  let shown: S | undefined
  let loadFailed = false
  let loadedAt = 0
  let turn: Promise<unknown> = Promise.resolve()
  const listeners = new Set<() => void>()

  const emit = () => listeners.forEach((l) => l())
  const show = (state: S | undefined) => {
    shown = state
    emit()
  }

  /** Run `work` after every earlier call; a failure doesn't stop the next. */
  function inTurn<T>(work: () => Promise<T>): Promise<T> {
    const run = turn.then(work, work)
    turn = run.catch(() => undefined)
    return run
  }

  async function load(data: SystemData): Promise<Loaded<S>> {
    try {
      let next = await files.load(data)
      if (next.repaired) {
        // Write the repair back at once, so every tab sees the same ids. A
        // tab that loses the race reads the winner's repair next time.
        next = await save(data, next, next.state).catch(() => next)
      }
      loaded = next
      loadFailed = false
      loadedAt = Date.now()
      show(next.state)
      return next
    } catch (err) {
      if (loaded === undefined) {
        loadFailed = true
        emit()
      }
      throw err
    }
  }

  async function save(data: SystemData, base: Loaded<S>, next: S): Promise<Loaded<S>> {
    const after = files.serialize(next)
    const contents = new Map(base.contents)
    const versions = new Map(base.versions)
    const changed = [...after].filter(([path, text]) => base.contents.get(path) !== text)
    const first = (path: string, text: string) =>
      files.writeFirst?.(path, base.contents.get(path), text) ?? false
    changed.sort(([a, at], [b, bt]) => Number(first(b, bt)) - Number(first(a, at)))
    for (const [path, text] of changed) {
      const { version } = await data.write(path, text, {
        expected: base.versions.get(path) ?? null,
      })
      contents.set(path, text)
      versions.set(path, version)
    }
    for (const path of base.contents.keys()) {
      if (after.has(path) || files.keep?.has(path)) continue
      // Only the file that was read: one another tab saved since stays (a 409).
      const version = base.versions.get(path)
      await data.remove(path, version ? { expected: version } : undefined)
      contents.delete(path)
      versions.delete(path)
    }
    return { state: next, contents, versions }
  }

  return {
    get: () => shown,
    failed: () => loadFailed,
    loadedAt: () => loadedAt,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    refresh(data) {
      return inTurn(async () => (await load(data)).state)
    },
    change(data, op) {
      return inTurn(async () => {
        let base = loaded ?? (await load(data))
        for (let attempt = 1; ; attempt++) {
          const { next, result } = op(base.state)
          show(next)
          try {
            loaded = await save(data, base, next)
            loadedAt = Date.now()
            return result
          } catch (err) {
            // Whatever was written stays written; the reload shows what is there.
            const fresh = await load(data).catch(() => undefined)
            if (!fresh) show(loaded?.state)
            if (!(err instanceof FileConflictError) || attempt >= ATTEMPTS || !fresh) throw err
            base = fresh
          }
        }
      })
    },
    reset() {
      loaded = undefined
      shown = undefined
      loadFailed = false
      loadedAt = 0
      turn = Promise.resolve()
      emit()
    },
  }
}

/** The app's own folders, or a sentence for a desktop from before they existed. */
export function dataOf(system: Pick<SystemHandle, 'data'>): SystemData {
  if (!system.data) {
    throw new Error('This desktop keeps no app data folders yet; update imbatranimOS.')
  }
  return system.data
}

/**
 * `data` kept to one of the app's folders: every call goes to `kind` (the
 * store's files live in `state`, say, rather than `data`).
 */
export function inFolder(data: SystemData, kind: DataKind): SystemData {
  return {
    read: (path, opts) => data.read(path, { ...opts, kind }),
    write: (path, content, opts) => data.write(path, content, { ...opts, kind }),
    list: (path, opts) => data.list(path, { ...opts, kind }),
    remove: (path, opts) => data.remove(path, { ...opts, kind }),
  }
}

/**
 * The store's state for a component, read again on mount and every
 * `refreshMs` if given (a background service keeping a list live).
 * `onLoadFailed` runs once when a read fails.
 */
export function useDataStore<S>(
  store: DataStore<S>,
  system: Pick<SystemHandle, 'data'>,
  options: { refreshMs?: number; onLoadFailed?: (err: unknown) => void } = {}
): { data: S | undefined; isPending: boolean } {
  const state = useSyncExternalStore(store.subscribe, store.get)
  const failed = useSyncExternalStore(store.subscribe, store.failed)
  const { refreshMs, onLoadFailed } = options
  useEffect(() => {
    let reported = false
    const read = () => {
      let data: SystemData
      try {
        data = dataOf(system)
      } catch (err) {
        if (!reported) onLoadFailed?.(err)
        reported = true
        return
      }
      store.refresh(data).catch((err: unknown) => {
        if (!reported) onLoadFailed?.(err)
        reported = true
      })
    }
    read()
    if (refreshMs === undefined) return
    const id = setInterval(read, refreshMs)
    return () => clearInterval(id)
    // `onLoadFailed` is a report, not an input: a new function each render
    // must not read the files again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, system, refreshMs])
  return { data: state, isPending: state === undefined && !failed }
}

/** A mutation as the windows call it: `mutate` reports its own failure. */
export type Action<V, R> = {
  mutate(vars: V, options?: { onSuccess?: (result: R) => void }): void
  mutateAsync(vars: V): Promise<R>
}

/** An {@link Action} running `run`, calling `onError` once when it fails. */
export function action<V, R>(
  run: (vars: V) => Promise<R>,
  onError: (err: unknown) => void
): Action<V, R> {
  return {
    mutate(vars, options) {
      Promise.resolve(vars)
        .then(run)
        .then((result) => options?.onSuccess?.(result), onError)
    },
    mutateAsync(vars) {
      return Promise.resolve(vars)
        .then(run)
        .catch((err: unknown) => {
          onError(err)
          throw err
        })
    },
  }
}
