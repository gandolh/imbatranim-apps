import type { SystemData } from '@imbatranim/ui'
import type { DataStoreFiles, Loaded } from '../../../../shared/src/dataStore'
import type { BookmarkGroup, BookmarkLink } from '../types'
import { isBookmarkUrl } from './bookmarkUrl'

/**
 * Bookmarks' one file, `bookmarks.json` in its data folder
 * (`~/.local/share/imbatranim/bookmarks/`): every folder, flat with its
 * `parentId`, each with its own links. The tree is assembled from it
 * (`tree.ts`), as it always was from the OS's rows; the OS wrote this file
 * once from those rows when Bookmarks became installable.
 */

export const BOOKMARKS_FILE = 'bookmarks.json'

/** A link as the file holds it: its folder is the one it is listed in. */
type StoredLink = Omit<BookmarkLink, 'groupId'>
type StoredGroup = Omit<BookmarkGroup, 'links'> & { links: StoredLink[] }
type BookmarksFile = { groups: StoredGroup[] }

const text = (doc: BookmarksFile) => `${JSON.stringify(doc, null, 2)}\n`
const nullableString = (v: unknown) => (typeof v === 'string' ? v : null)

/** The folders a file holds, checked: a hand-edited file may hold anything. */
export function readGroups(content: string): BookmarkGroup[] {
  const groups = (JSON.parse(content) as { groups?: unknown }).groups
  if (!Array.isArray(groups)) throw new Error(`${BOOKMARKS_FILE} has no list of folders`)
  return groups.map((g: Partial<StoredGroup>) => {
    if (typeof g?.id !== 'number' || typeof g.name !== 'string') {
      throw new Error(`${BOOKMARKS_FILE} holds a folder with no id or name`)
    }
    const links = Array.isArray(g.links) ? g.links : []
    return {
      id: g.id,
      name: g.name,
      icon: nullableString(g.icon),
      parentId: typeof g.parentId === 'number' ? g.parentId : null,
      position: typeof g.position === 'number' ? g.position : 0,
      links: links
        // Only a URL the app could have stored: the file is rendered as links.
        .filter((l) => typeof l?.id === 'number' && isBookmarkUrl(l.url))
        .map((l) => ({
          id: l.id,
          groupId: g.id as number,
          title: typeof l.title === 'string' ? l.title : l.url,
          url: l.url as string,
          icon: nullableString(l.icon),
          position: typeof l.position === 'number' ? l.position : 0,
        })),
    }
  })
}

export const bookmarkFiles: DataStoreFiles<BookmarkGroup[]> = {
  async load(data: SystemData): Promise<Loaded<BookmarkGroup[]>> {
    const file = await data.read(BOOKMARKS_FILE)
    const content = file?.content ?? text({ groups: [] })
    return {
      state: file ? readGroups(content) : [],
      contents: new Map([[BOOKMARKS_FILE, content]]),
      versions: new Map([[BOOKMARKS_FILE, file?.version ?? null]]),
    }
  },

  serialize(groups) {
    const doc: BookmarksFile = {
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        parentId: g.parentId,
        position: g.position,
        links: g.links.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          icon: l.icon,
          position: l.position,
        })),
      })),
    }
    return new Map([[BOOKMARKS_FILE, text(doc)]])
  },

  keep: new Set([BOOKMARKS_FILE]),
}
