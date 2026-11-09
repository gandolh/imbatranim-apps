import { describe, expect, it } from 'vitest'
import { createFakeSystem } from '@imbatranim-office/shared/testing'
import type { SystemData } from '@imbatranim/ui'
import { createDataStore } from '../../../../shared/src/dataStore'
import { oneEach, todoFiles, type TodoState } from './todoFiles'
import * as ops from './todoOps'
import type { Todo } from '../types'

const AT = new Date('2026-11-09T10:00:00Z')

function todo(id: number, listId: number | null, extra: Partial<Todo> = {}): Todo {
  return {
    id,
    text: `task ${id}`,
    completed: false,
    position: id,
    dueAt: null,
    priority: false,
    listId,
    createdAt: '2026-11-01 08:00:00',
    updatedAt: '2026-11-01 08:00:00',
    ...extra,
  }
}

const state = (todos: Todo[], lists = [{ id: 1, name: 'Work', position: 1 }]): TodoState => ({
  todos,
  lists,
})

describe("Todo's files", () => {
  it('reads one file per list and one of unfiled tasks, as the OS moved them', async () => {
    const { system } = createFakeSystem({
      appData: {
        'data:lists/1.json': JSON.stringify({
          id: 1,
          name: 'Work',
          position: 1,
          todos: [{ ...todo(2, 1), listId: undefined }],
        }),
        'data:unfiled.json': JSON.stringify({ todos: [todo(1, null)] }),
      },
    })
    const { state: read } = await todoFiles.load(system.data as SystemData)
    expect(read.lists).toEqual([{ id: 1, name: 'Work', position: 1 }])
    expect(read.todos.map((t) => [t.id, t.listId])).toEqual([
      [1, null],
      [2, 1],
    ])
  })

  it('reads an empty folder as no tasks and no lists', async () => {
    const { system } = createFakeSystem()
    const { state: read } = await todoFiles.load(system.data as SystemData)
    expect(read).toEqual({ todos: [], lists: [] })
  })

  it('writes a task moved between lists into both files, the new one first', async () => {
    const { system, appData } = createFakeSystem({
      appData: {
        'data:lists/1.json': JSON.stringify({ id: 1, name: 'Work', position: 1, todos: [] }),
        'data:unfiled.json': JSON.stringify({ todos: [todo(1, null)] }),
      },
    })
    const data = system.data as SystemData
    const writes: string[] = []
    const watched: SystemData = {
      ...data,
      write: (path, content, opts) => {
        writes.push(path)
        return data.write(path, content, opts)
      },
    }
    const store = createDataStore(todoFiles)
    await store.change(watched, (s) => ops.updateTodo(s, 1, { listId: 1 }, AT))
    expect(writes).toEqual(['lists/1.json', 'unfiled.json'])
    expect(JSON.parse(appData.get('data:unfiled.json') as string).todos).toEqual([])
    expect(JSON.parse(appData.get('data:lists/1.json') as string).todos[0].id).toBe(1)
  })

  it("removes a deleted list's file and keeps its tasks, unfiled", async () => {
    const { system, appData } = createFakeSystem({
      appData: {
        'data:lists/1.json': JSON.stringify({
          id: 1,
          name: 'Work',
          position: 1,
          todos: [todo(1, 1)],
        }),
      },
    })
    const store = createDataStore(todoFiles)
    const result = await store.change(system.data as SystemData, (s) => ops.deleteList(s, 1, AT))
    expect(result).toEqual({ unfiled: 1 })
    expect([...appData.keys()]).toEqual(['data:unfiled.json'])
    expect(JSON.parse(appData.get('data:unfiled.json') as string).todos[0].id).toBe(1)
  })
})

describe('one id per task', () => {
  it('keeps the newer copy of a task a stopped move left in two files', () => {
    const old = todo(1, null)
    const moved = todo(1, 1, { updatedAt: '2026-11-09 10:00:00' })
    expect(oneEach([old, moved])).toEqual([moved])
  })

  it('keeps both of two tasks two tabs gave one id, the second renumbered', () => {
    const first = todo(4, null, { text: 'from one tab' })
    const second = todo(4, 1, { text: 'from another', createdAt: '2026-11-09 10:00:01' })
    expect(oneEach([first, second]).map((t) => [t.id, t.text])).toEqual([
      [4, 'from one tab'],
      [5, 'from another'],
    ])
  })
})

describe('reading what a tab can trip over', () => {
  it('writes a renumbered task back as soon as it reads it, so every tab sees one id', async () => {
    const { system, appData } = createFakeSystem({
      appData: {
        'data:lists/1.json': JSON.stringify({
          id: 1,
          name: 'Work',
          position: 1,
          todos: [{ ...todo(4, 1, { text: 'from another' }), listId: undefined }],
        }),
        'data:unfiled.json': JSON.stringify({ todos: [todo(4, null, { text: 'from one tab' })] }),
      },
    })
    const store = createDataStore(todoFiles)
    await store.refresh(system.data as SystemData)
    const onDisk = await todoFiles.load(system.data as SystemData)
    expect(onDisk.repaired).toBe(false)
    expect(onDisk.state.todos.map((t) => t.id).sort()).toEqual([4, 5])
    // The list files are read first, so the unfiled copy is the one renumbered.
    expect(JSON.parse(appData.get('data:unfiled.json') as string).todos[0].id).toBe(5)
  })

  it('names the file that is not valid JSON', async () => {
    const { system } = createFakeSystem({ appData: { 'data:lists/2.json': '{ broken' } })
    await expect(todoFiles.load(system.data as SystemData)).rejects.toThrow(
      'lists/2.json is not valid JSON'
    )
  })
})

describe("Todo's rules", () => {
  it('numbers a new task after every other, in the list it was added to', () => {
    const { next, result } = ops.createTodo(state([todo(4, null)]), { text: 'new', listId: 1 }, AT)
    expect(result).toMatchObject({
      id: 5,
      position: 5,
      listId: 1,
      createdAt: '2026-11-09 10:00:00',
    })
    expect(next.todos).toHaveLength(2)
  })

  it('refuses a task for a list that is gone', () => {
    expect(() => ops.createTodo(state([]), { text: 'x', listId: 9 })).toThrow('List 9 not found')
  })

  it('reorders a filtered view in the slots it held, leaving hidden rows in place', () => {
    // 1 and 3 are visible (active); 2 is completed and hidden.
    const s = state([todo(1, null), todo(2, null, { completed: true }), todo(3, null)])
    const { next } = ops.reorderTodos(s, [3, 1])
    const order = ops.todosIn(next, { filter: 'all', listId: null }).map((t) => t.id)
    expect(order).toEqual([3, 2, 1])
  })

  it('clears completed tasks in one list only', () => {
    const s = state([
      todo(1, 1, { completed: true }),
      todo(2, null, { completed: true }),
      todo(3, 1),
    ])
    const { next, result } = ops.clearCompleted(s, 1)
    expect(result).toEqual({ deleted: 1 })
    expect(next.todos.map((t) => t.id)).toEqual([2, 3])
  })

  it('clears a due date with null and leaves it alone when the patch omits it', () => {
    const s = state([todo(1, null, { dueAt: 5 })])
    expect(ops.updateTodo(s, 1, { text: 'renamed' }).result.dueAt).toBe(5)
    expect(ops.updateTodo(s, 1, { dueAt: null }).result.dueAt).toBeNull()
  })
})
