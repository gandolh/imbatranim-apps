// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanupRendered,
  createFakeSystem,
  renderWithSystem,
  settle,
} from '@imbatranim-office/shared/testing'
import type { CommandSourceContext } from '@imbatranim/ui'
import { fencedSystem } from '../../../shared/src/testing/fencedSystem'
import { App, commandSources } from './App'
import { bookmarkStore } from './queries/bookmarksQueries'

const FILE = {
  groups: [
    {
      id: 1,
      name: 'Work',
      icon: null,
      parentId: null,
      position: 1,
      links: [{ id: 4, title: 'Tracker', url: 'https://tracker.example', icon: null, position: 1 }],
    },
  ],
}

beforeEach(() => bookmarkStore.reset())
afterEach(cleanupRendered)

describe('Bookmarks as a kit app', () => {
  it('shows the folders from its file, with only the capabilities its descriptor grants', async () => {
    const fake = createFakeSystem({
      appId: 'bookmarks',
      appData: { 'data:bookmarks.json': JSON.stringify(FILE) },
    })
    fake.system.http.get = (async () => ({
      data: { origin: null },
      status: 200,
      headers: {},
    })) as never
    const { container } = renderWithSystem(
      <App windowId="window-1" host={{ appId: 'bookmarks', assetBase: '/', server: null }} />,
      fencedSystem(fake.system, 'bookmarks')
    )
    await settle()
    expect(container.textContent).toContain('Work')
    expect(fake.notifications).toEqual([])
  })

  it('finds a bookmark in the palette with no window open, from its own folders', async () => {
    const fake = createFakeSystem({
      appId: 'bookmarks',
      windowId: null,
      appData: { 'data:bookmarks.json': JSON.stringify(FILE) },
    })
    const ctx = { http: fake.system.http, data: fake.system.data } as CommandSourceContext
    const results = await commandSources[0].search('work', ctx)
    expect(results.map((r) => r.label)).toEqual(['Tracker'])
    expect(results[0].subtitle).toBe('Work · https://tracker.example')
  })

  it('reads the file once for a burst of keystrokes', async () => {
    const fake = createFakeSystem({
      appId: 'bookmarks',
      windowId: null,
      appData: { 'data:bookmarks.json': JSON.stringify(FILE) },
    })
    const data = fake.system.data as NonNullable<typeof fake.system.data>
    let reads = 0
    const counted = {
      ...data,
      read: (path: string) => {
        reads += 1
        return data.read(path)
      },
    }
    const ctx = { http: fake.system.http, data: counted } as CommandSourceContext
    for (const query of ['t', 'tr', 'tra', 'trac']) await commandSources[0].search(query, ctx)
    expect(reads).toBe(1)
  })

  it('finds nothing on a desktop that gives a source no folders', async () => {
    const fake = createFakeSystem({ appId: 'bookmarks', windowId: null })
    expect(await commandSources[0].search('', { http: fake.system.http })).toEqual([])
  })
})
