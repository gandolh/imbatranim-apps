import { describe, expect, it } from 'vitest'
import { createFakeSystem } from '@imbatranim-office/shared/testing'
import type { SystemData } from '@imbatranim/ui'
import { createDataStore, type DataStoreFiles } from './dataStore'

/** A counter kept in one file, `n.json`. */
const counterFiles: DataStoreFiles<number> = {
  async load(data) {
    const file = await data.read('n.json')
    const content = file?.content ?? '0'
    return {
      state: Number(content),
      contents: new Map([['n.json', content]]),
      versions: new Map([['n.json', file?.version ?? null]]),
    }
  },
  serialize: (n) => new Map([['n.json', String(n)]]),
}

const add = (by: number) => (n: number) => ({ next: n + by, result: n + by })

describe('a data store', () => {
  it('shows a change at once and writes it', async () => {
    const { system, appData } = createFakeSystem({ appData: { 'data:n.json': '1' } })
    const store = createDataStore(counterFiles)
    const data = system.data as SystemData
    const saved = store.change(data, add(1))
    expect(store.get()).toBeUndefined() // the first change reads the files first
    expect(await saved).toBe(2)
    expect(store.get()).toBe(2)
    expect(appData.get('data:n.json')).toBe('2')
  })

  it('takes changes in turn, so a loop of them never writes against one version', async () => {
    const { system, appData } = createFakeSystem()
    const store = createDataStore(counterFiles)
    const data = system.data as SystemData
    await Promise.all([1, 2, 3, 4].map(() => store.change(data, add(1))))
    expect(appData.get('data:n.json')).toBe('4')
  })

  it("applies a change again to another tab's save rather than writing over it", async () => {
    const { system, appData } = createFakeSystem({ appData: { 'data:n.json': '1' } })
    const store = createDataStore(counterFiles)
    const data = system.data as SystemData
    await store.refresh(data)
    // Another tab saves after this one read.
    await data.write('n.json', '10')
    expect(await store.change(data, add(1))).toBe(11)
    expect(appData.get('data:n.json')).toBe('11')
  })

  it('puts back what the files hold when a write fails, and rejects', async () => {
    const { system } = createFakeSystem({ appData: { 'data:n.json': '1' } })
    const data = system.data as SystemData
    const failing: SystemData = {
      ...data,
      write: () => Promise.reject(new Error('disk full')),
    }
    const store = createDataStore(counterFiles)
    await store.refresh(data)
    await expect(store.change(failing, add(5))).rejects.toThrow('disk full')
    expect(store.get()).toBe(1)
  })

  it('removes a file the state no longer has', async () => {
    const files: DataStoreFiles<string[]> = {
      async load(data) {
        const entries = await data.list('')
        const contents = new Map<string, string>()
        const versions = new Map<string, string | null>()
        for (const e of entries) {
          const file = await data.read(e.path)
          if (!file) continue
          contents.set(e.path, file.content)
          versions.set(e.path, file.version)
        }
        return { state: [...contents.keys()], contents, versions }
      },
      serialize: (names) => new Map(names.map((n) => [n, 'x'])),
    }
    const { system, appData } = createFakeSystem({
      appData: { 'data:a': 'x', 'data:b': 'x' },
    })
    const data = system.data as SystemData
    const store = createDataStore(files)
    await store.change(data, (names) => ({ next: names.filter((n) => n !== 'a'), result: null }))
    expect([...appData.keys()]).toEqual(['data:b'])
  })
})
