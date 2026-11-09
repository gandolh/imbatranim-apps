import type { SystemData } from '@imbatranim/ui'
import type { DataStoreFiles, Loaded } from '../../../../shared/src/dataStore'
import type { Todo, TodoList } from '../types'

/**
 * Todo's files, in its data folder (`~/.local/share/imbatranim/todo/`), one
 * per list:
 *
 * - `lists/<id>.json`: a list's name and place, and its tasks;
 * - `unfiled.json`: the tasks filed under no list.
 *
 * A task keeps its `position` across every file, so "All" keeps one manual
 * order across lists. The OS wrote these files once from the rows its
 * database held before Todo became installable, in this same shape.
 */

export type TodoState = { todos: Todo[]; lists: TodoList[] }

/** A task as a file holds it: its list is the file. */
type StoredTodo = Omit<Todo, 'listId'>
type ListFile = { id: number; name: string; position: number; todos: StoredTodo[] }
type UnfiledFile = { todos: StoredTodo[] }

export const UNFILED = 'unfiled.json'
export const LISTS_DIR = 'lists'
const LIST_FILE = /^([1-9][0-9]{0,15})\.json$/

export const listPath = (id: number) => `${LISTS_DIR}/${id}.json`

const byPosition = (a: { position: number; id: number }, b: { position: number; id: number }) =>
  a.position - b.position || a.id - b.id

function stored(todo: Todo): StoredTodo {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    position: todo.position,
    dueAt: todo.dueAt,
    priority: todo.priority,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }
}

/** A file's JSON, or an error that names the file. */
function parse(content: string, path: string): unknown {
  try {
    return JSON.parse(content)
  } catch (err) {
    throw new Error(
      `${path} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err }
    )
  }
}

const text = (doc: unknown) => `${JSON.stringify(doc, null, 2)}\n`

/** The tasks a file holds, checked field by field: a hand-edited file may hold anything. */
function readTodos(raw: unknown, listId: number | null, path: string): Todo[] {
  const todos = (raw as { todos?: unknown } | null)?.todos
  if (!Array.isArray(todos)) throw new Error(`${path} has no list of tasks`)
  return todos.map((t: Partial<StoredTodo>) => {
    if (typeof t?.id !== 'number' || typeof t.text !== 'string') {
      throw new Error(`${path} holds a task with no id or text`)
    }
    return {
      id: t.id,
      text: t.text,
      completed: t.completed === true,
      position: typeof t.position === 'number' ? t.position : 0,
      dueAt: typeof t.dueAt === 'number' ? t.dueAt : null,
      priority: t.priority === true,
      listId,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : '',
      updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : '',
    }
  })
}

/**
 * Every task once, under an id of its own. Two files can hold one id two ways:
 *
 * - the same task (same text, made at the same time), when a move between
 *   lists wrote the new list and failed on the old one: the newer copy stays;
 * - two tasks, when two tabs each added one to a different list at once and
 *   both took the next id: both stay, the second under a fresh id, which the
 *   next save writes.
 */
export function oneEach(todos: Todo[]): Todo[] {
  const out = new Map<number, Todo>()
  let fresh = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1
  for (const todo of todos) {
    const held = out.get(todo.id)
    if (!held) out.set(todo.id, todo)
    else if (held.text === todo.text && held.createdAt === todo.createdAt) {
      if (todo.updatedAt > held.updatedAt) out.set(todo.id, todo)
    } else {
      const id = fresh++
      out.set(id, { ...todo, id })
    }
  }
  return [...out.values()]
}

export const todoFiles: DataStoreFiles<TodoState> = {
  async load(data: SystemData): Promise<Loaded<TodoState>> {
    const contents = new Map<string, string>()
    const versions = new Map<string, string | null>()
    const lists: TodoList[] = []
    const todos: Todo[] = []

    const entries = await data.list(LISTS_DIR)
    const listFiles = entries.filter((e) => e.type === 'file' && LIST_FILE.test(e.name))
    const reads = await Promise.all(
      listFiles.map(async (e) => ({
        path: `${LISTS_DIR}/${e.name}`,
        file: await data.read(`${LISTS_DIR}/${e.name}`),
      }))
    )
    for (const { path, file } of reads) {
      if (!file) continue // removed since the listing
      const doc = parse(file.content, path) as Partial<ListFile>
      const id = Number(LIST_FILE.exec(path.slice(LISTS_DIR.length + 1))?.[1])
      lists.push({
        id,
        name: typeof doc.name === 'string' ? doc.name : `List ${id}`,
        position: typeof doc.position === 'number' ? doc.position : 0,
      })
      todos.push(...readTodos(doc, id, path))
      contents.set(path, file.content)
      versions.set(path, file.version)
    }

    const unfiled = await data.read(UNFILED)
    if (unfiled) {
      todos.push(...readTodos(parse(unfiled.content, UNFILED), null, UNFILED))
      contents.set(UNFILED, unfiled.content)
      versions.set(UNFILED, unfiled.version)
    } else {
      // No file reads as no tasks: the first write must still find none there.
      contents.set(UNFILED, text({ todos: [] }))
      versions.set(UNFILED, null)
    }

    const unique = oneEach(todos)
    const read = new Set(todos)
    return {
      state: { todos: unique.sort(byPosition), lists: lists.sort(byPosition) },
      contents,
      versions,
      // A renumbered task is written back at once, so no two tabs pick
      // different ids for it (and toast it twice).
      repaired: unique.some((t) => !read.has(t)),
    }
  },

  serialize(state: TodoState): Map<string, string> {
    const out = new Map<string, string>()
    const sorted = [...state.todos].sort(byPosition)
    for (const list of [...state.lists].sort(byPosition)) {
      const doc: ListFile = {
        id: list.id,
        name: list.name,
        position: list.position,
        todos: sorted.filter((t) => t.listId === list.id).map(stored),
      }
      out.set(listPath(list.id), text(doc))
    }
    const unfiled: UnfiledFile = { todos: sorted.filter((t) => t.listId === null).map(stored) }
    out.set(UNFILED, text(unfiled))
    return out
  },

  writeFirst(_path, before, after) {
    const ids = (s: string | undefined) => {
      if (s === undefined) return new Set<number>()
      try {
        return new Set(((JSON.parse(s) as UnfiledFile).todos ?? []).map((t) => t.id))
      } catch {
        return new Set<number>()
      }
    }
    const had = ids(before)
    return [...ids(after)].some((id) => !had.has(id))
  },

  keep: new Set([UNFILED]),
}
