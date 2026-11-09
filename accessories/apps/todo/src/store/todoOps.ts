import type { Filter, Todo, TodoInput, TodoList, TodoPatch } from '../types'
import type { TodoState } from './todoFiles'

/**
 * What Todo does to its state, as pure functions: the rules the OS's
 * `todos` module kept when the rows lived in its database, now applied in
 * the app before its files are written.
 */

/** Bounded so a task cannot become a document. */
export const MAX_TEXT = 500
export const MAX_LIST_NAME = 100

/** `listId: null` means "All lists". */
export type Scope = { filter: Filter; listId: number | null }

type Change<R> = { next: TodoState; result: R }

const byPosition = (a: Todo | TodoList, b: Todo | TodoList) =>
  a.position - b.position || a.id - b.id

/** The time as the database wrote it (`YYYY-MM-DD HH:MM:SS`, UTC), so old and new tasks sort alike. */
export function timestamp(now = new Date()): string {
  return now.toISOString().slice(0, 19).replace('T', ' ')
}

function checkText(text: string): string {
  const trimmed = text.trim()
  if (trimmed === '') throw new Error('A task needs some text')
  if (text.length > MAX_TEXT) throw new Error(`A task is at most ${MAX_TEXT} characters`)
  return text
}

function checkListName(name: string): string {
  if (name.trim() === '') throw new Error('A list needs a name')
  if (name.length > MAX_LIST_NAME)
    throw new Error(`A list name is at most ${MAX_LIST_NAME} characters`)
  return name
}

function assertList(state: TodoState, id: number): void {
  if (!state.lists.some((l) => l.id === id)) throw new Error(`List ${id} not found`)
}

const nextId = (rows: { id: number }[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
const nextPosition = (rows: { position: number }[]) =>
  rows.reduce((max, r) => Math.max(max, r.position), 0) + 1

/**
 * Todos in one scope, by their manual position. Sorting by due date or
 * creation is the window's job (`sort.ts`).
 */
export function todosIn(state: TodoState, scope: Scope): Todo[] {
  return state.todos
    .filter((t) =>
      scope.filter === 'active' ? !t.completed : scope.filter === 'completed' ? t.completed : true
    )
    .filter((t) => scope.listId === null || t.listId === scope.listId)
    .sort(byPosition)
}

export function createTodo(state: TodoState, input: TodoInput, now = new Date()): Change<Todo> {
  const listId = input.listId ?? null
  if (listId !== null) assertList(state, listId)
  const at = timestamp(now)
  const todo: Todo = {
    id: nextId(state.todos),
    text: checkText(input.text),
    completed: false,
    position: nextPosition(state.todos),
    dueAt: input.dueAt ?? null,
    priority: input.priority ?? false,
    listId,
    createdAt: at,
    updatedAt: at,
  }
  return { next: { ...state, todos: [...state.todos, todo] }, result: todo }
}

/**
 * Apply a patch. `dueAt` and `listId` may be `null`, which clears them: "no
 * due date" and "not filed" are values, not absences.
 */
export function updateTodo(
  state: TodoState,
  id: number,
  patch: TodoPatch,
  now = new Date()
): Change<Todo> {
  const existing = state.todos.find((t) => t.id === id)
  if (!existing) throw new Error(`Todo ${id} not found`)
  if (patch.listId !== undefined && patch.listId !== null) assertList(state, patch.listId)
  const updated: Todo = {
    ...existing,
    ...(patch.text !== undefined ? { text: checkText(patch.text) } : {}),
    ...(patch.completed !== undefined ? { completed: patch.completed } : {}),
    ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
    ...(patch.dueAt !== undefined ? { dueAt: patch.dueAt } : {}),
    ...(patch.listId !== undefined ? { listId: patch.listId } : {}),
    updatedAt: timestamp(now),
  }
  return {
    next: { ...state, todos: state.todos.map((t) => (t.id === id ? updated : t)) },
    result: updated,
  }
}

/**
 * Reorder, treating `ids` as a **relative** reordering of a subset: the
 * Active tab or one list hands over only its own rows. Every task is
 * numbered 1..N first, then the given ones take the slots they already
 * held, in their new order; rows the window cannot see keep their places.
 */
export function reorderTodos(state: TodoState, ids: number[]): Change<void> {
  const all = [...state.todos].sort(byPosition)
  const known = new Set(all.map((t) => t.id))
  const requested = ids.filter((id) => known.has(id))
  const requestedSet = new Set(requested)
  const slots = all.flatMap((t, index) => (requestedSet.has(t.id) ? [index + 1] : []))
  const position = new Map(all.map((t, index) => [t.id, index + 1]))
  requested.forEach((id, index) => position.set(id, slots[index]))
  return {
    next: {
      ...state,
      todos: state.todos.map((t) => ({ ...t, position: position.get(t.id) ?? t.position })),
    },
    result: undefined,
  }
}

export function deleteTodo(state: TodoState, id: number): Change<void> {
  if (!state.todos.some((t) => t.id === id)) throw new Error(`Todo ${id} not found`)
  return { next: { ...state, todos: state.todos.filter((t) => t.id !== id) }, result: undefined }
}

/** Delete every completed task, in one list or all of them. */
export function clearCompleted(
  state: TodoState,
  listId: number | null
): Change<{ deleted: number }> {
  const gone = (t: Todo) => t.completed && (listId === null || t.listId === listId)
  const deleted = state.todos.filter(gone).length
  return { next: { ...state, todos: state.todos.filter((t) => !gone(t)) }, result: { deleted } }
}

export function createList(state: TodoState, name: string): Change<TodoList> {
  const list: TodoList = {
    id: nextId(state.lists),
    name: checkListName(name),
    position: nextPosition(state.lists),
  }
  return { next: { ...state, lists: [...state.lists, list] }, result: list }
}

export function renameList(state: TodoState, id: number, name: string): Change<TodoList> {
  assertList(state, id)
  const checked = checkListName(name)
  const lists = state.lists.map((l) => (l.id === id ? { ...l, name: checked } : l))
  return { next: { ...state, lists }, result: lists.find((l) => l.id === id) as TodoList }
}

/** Delete a list and keep its tasks, unfiled: deleting a list never deletes the work in it. */
export function deleteList(
  state: TodoState,
  id: number,
  now = new Date()
): Change<{ unfiled: number }> {
  assertList(state, id)
  let unfiled = 0
  const at = timestamp(now)
  const todos = state.todos.map((t) => {
    if (t.listId !== id) return t
    unfiled += 1
    return { ...t, listId: null, updatedAt: at }
  })
  return { next: { todos, lists: state.lists.filter((l) => l.id !== id) }, result: { unfiled } }
}
