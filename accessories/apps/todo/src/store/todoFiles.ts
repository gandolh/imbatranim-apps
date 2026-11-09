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
      const doc = JSON.parse(file.content) as Partial<ListFile>
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
      todos.push(...readTodos(JSON.parse(unfiled.content), null, UNFILED))
      contents.set(UNFILED, unfiled.content)
      versions.set(UNFILED, unfiled.version)
    } else {
      // No file reads as no tasks: the first write must still find none there.
      contents.set(UNFILED, text({ todos: [] }))
      versions.set(UNFILED, null)
    }

    // A move whose second write failed leaves a task in two files; show it once.
    const seen = new Set<number>()
    const unique = todos.filter((t) => !seen.has(t.id) && seen.add(t.id))
    return {
      state: { todos: unique.sort(byPosition), lists: lists.sort(byPosition) },
      contents,
      versions,
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
