import { useEffect, useMemo, useState } from 'react'
import { useSystem, type SystemHandle } from '@imbatranim/ui'
import {
  action,
  createDataStore,
  dataOf,
  useDataStore,
  type Action,
} from '../../../../../packages/shared/src/dataStore'
import { bookmarkFiles } from '../store/bookmarkFiles'
import * as ops from '../store/bookmarkOps'
import type {
  BookmarkGroup,
  CreateGroupInput,
  CreateLinkInput,
  UpdateGroupInput,
  UpdateLinkInput,
} from '../types'
import type { ParsedFolder } from '../netscape'

/**
 * Bookmarks' folders, read from its file and shared by its window and its
 * command source. The hooks keep the names and shapes the window has always
 * called (`data`, `isPending`, `mutate`), so the window is unchanged.
 */
export const bookmarkStore = createDataStore<BookmarkGroup[]>(bookmarkFiles)

/**
 * Report a failed write. Every change says so when it fails: a refused move
 * that did nothing visible would read as the app ignoring the click.
 */
function reportFailure(system: SystemHandle, actionName: string): void {
  system.notify({
    title: `Could not ${actionName}`,
    body: 'The change was not saved.',
    level: 'error',
  })
}

/** Read the state without subscribing — for duplicate checks and export. */
export function peekGroups(): BookmarkGroup[] {
  return bookmarkStore.get() ?? []
}

export function useBookmarkGroupsQuery(): {
  data: BookmarkGroup[] | undefined
  isPending: boolean
} {
  const system = useSystem()
  const { data, isPending } = useDataStore(bookmarkStore, system, {
    onLoadFailed: (err) =>
      system.notify({
        title: 'Could not read your bookmarks',
        body: err instanceof Error ? err.message : String(err),
        level: 'error',
      }),
  })
  const groups = useMemo(() => (data ? ops.ordered(data) : undefined), [data])
  return { data: groups, isPending }
}

/**
 * Whether this machine's Browser app is set up: its proxy origin,
 * or null. Asked once per window; a machine does not grow a port mid-visit.
 */
export function useBrowserAvailable(): boolean {
  const system = useSystem()
  const [origin, setOrigin] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    system.http
      .get<{ origin: string | null }>('/browser/config')
      .then((r) => {
        if (live) setOrigin(r.data.origin)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [system])
  return Boolean(origin)
}

/** One change as a window calls it, reporting its own failure. */
function useChange<V, R>(
  change: (groups: BookmarkGroup[], vars: V) => { next: BookmarkGroup[]; result: R },
  onError: (system: SystemHandle) => void
): Action<V, R> {
  const system = useSystem()
  return useMemo(
    () =>
      action(
        (vars: V) => bookmarkStore.change(dataOf(system), (groups) => change(groups, vars)),
        () => onError(system)
      ),
    // `change` and `onError` are fixed per hook below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [system]
  )
}

const failed = (actionName: string) => (system: SystemHandle) => reportFailure(system, actionName)

export function useCreateGroupMutation() {
  return useChange(
    (g, input: CreateGroupInput) => ops.createGroup(g, input),
    failed('create that folder')
  )
}

export function useUpdateGroupMutation() {
  return useChange(
    (g, { id, data }: { id: number; data: UpdateGroupInput }) => ops.updateGroup(g, id, data),
    failed('save that folder')
  )
}

export function useDeleteGroupMutation() {
  return useChange((g, id: number) => ops.deleteGroup(g, id), failed('delete that folder'))
}

export function useCreateLinkMutation() {
  return useChange(
    (g, input: CreateLinkInput) => ops.createLink(g, input),
    failed('add that bookmark')
  )
}

export function useUpdateLinkMutation() {
  return useChange(
    (g, { id, data }: { id: number; data: UpdateLinkInput }) => ops.updateLink(g, id, data),
    failed('save that bookmark')
  )
}

export function useDeleteLinkMutation() {
  return useChange((g, id: number) => ops.deleteLink(g, id), failed('delete that bookmark'))
}

export function useImportMutation() {
  return useChange(
    (g, { folders, parentId }: { folders: ParsedFolder[]; parentId?: number }) =>
      ops.importTree(g, folders, parentId),
    // The import is one write, so a failure means nothing was added — say so,
    // because "nothing happened" is otherwise indistinguishable from "nothing to do".
    (system) =>
      system.notify({
        title: 'Import failed',
        body: 'No bookmarks were added.',
        level: 'error',
      })
  )
}
