import { useMemo } from "react";
import { useSystem, type SystemHandle } from "@imbatranim/ui";
import {
  action,
  createDataStore,
  dataOf,
  useDataStore,
  type Action,
} from "../../../../../packages/shared/src/dataStore";
import { todoFiles, type TodoState } from "../store/todoFiles";
import * as ops from "../store/todoOps";
import type { Scope } from "../store/todoOps";
import type { Todo, TodoInput, TodoList, TodoPatch } from "../types";

/**
 * Todo's state, read from its files and shared by its window and its
 * background service. The hooks keep the names and shapes the window has
 * always called (`data`, `isPending`, `mutate`), so the window is unchanged.
 */
export const todoStore = createDataStore<TodoState>(todoFiles);

/** Todos as this page holds them, for the reminder watcher (no subscription). */
export function peekTodos(): Todo[] {
  return todoStore.get()?.todos ?? [];
}

/**
 * Report a failed write. The window already shows the files as they are
 * again, so the sentence says the change is gone rather than leaving the row
 * to spring back unexplained.
 */
function reportFailure(system: SystemHandle, actionName: string): void {
  system.notify({
    title: `Could not ${actionName}`,
    body: "The change was not saved. Your list has been put back the way it was.",
    level: "error",
  });
}

/** Said once when the files can't be read at all. */
function reportUnreadable(system: SystemHandle, err: unknown): void {
  system.notify({
    title: "Could not read your tasks",
    body: err instanceof Error ? err.message : String(err),
    level: "error",
  });
}

export function useTodosQuery(
  scope: Scope,
  options?: { refetchIntervalMs?: number; quiet?: boolean },
): { data: Todo[] | undefined; isPending: boolean } {
  const system = useSystem();
  const { data, isPending } = useDataStore(todoStore, system, {
    refreshMs: options?.refetchIntervalMs,
    onLoadFailed: options?.quiet ? undefined : (err) => reportUnreadable(system, err),
  });
  const { filter, listId } = scope;
  const todos = useMemo(() => (data ? ops.todosIn(data, { filter, listId }) : undefined), [data, filter, listId]);
  return { data: todos, isPending };
}

export function useListsQuery(): { data: TodoList[] | undefined } {
  const system = useSystem();
  const { data } = useDataStore(todoStore, system);
  return { data: data?.lists };
}

/** One change as a window calls it, reporting its own failure. */
function useChange<V, R>(
  change: (state: TodoState, vars: V) => { next: TodoState; result: R },
  failure: string,
): Action<V, R> {
  const system = useSystem();
  return useMemo(
    () =>
      action(
        (vars: V) => todoStore.change(dataOf(system), (state) => change(state, vars)),
        () => reportFailure(system, failure),
      ),
    // `change` and `failure` are fixed per hook below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [system],
  );
}

export function useCreateTodoMutation() {
  return useChange((s, input: TodoInput) => ops.createTodo(s, input), "add that task");
}

export function useUpdateTodoMutation() {
  return useChange(
    (s, { id, patch }: { id: number; patch: TodoPatch }) => ops.updateTodo(s, id, patch),
    "save that change",
  );
}

export function useDeleteTodoMutation() {
  return useChange((s, id: number) => ops.deleteTodo(s, id), "delete that task");
}

export function useReorderTodosMutation() {
  return useChange((s, ids: number[]) => ops.reorderTodos(s, ids), "save the new order");
}

export function useClearCompletedMutation() {
  return useChange((s, listId: number | null) => ops.clearCompleted(s, listId), "clear the completed tasks");
}

export function useCreateListMutation() {
  return useChange((s, name: string) => ops.createList(s, name), "create that list");
}

export function useRenameListMutation() {
  return useChange((s, { id, name }: { id: number; name: string }) => ops.renameList(s, id, name), "rename that list");
}

export function useDeleteListMutation() {
  return useChange((s, id: number) => ops.deleteList(s, id), "delete that list");
}

export type { TodoList };
