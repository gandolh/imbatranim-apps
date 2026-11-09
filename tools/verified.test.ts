import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * verified.json: the apps from a URL the OS installs with no warning. Each
 * entry names a public GitHub repository, the app's folder in it when it isn't
 * at the top, the one commit that was reviewed, and a short note. The OS copies
 * the file at a pinned commit of this repository (its `npm run verified:sync`)
 * and refuses a copy that breaks these rules, so they are checked here first.
 */
type Entry = Record<string, unknown>

const file = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'verified.json'), 'utf8')
) as unknown

const REPO = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/
const COMMIT = /^[0-9a-f]{40}$/
const KEYS = new Set(['repo', 'subdir', 'commit', 'note'])

function key(e: Entry): string {
  const repo = String(e.repo)
    .toLowerCase()
    .replace(/\.git$/, '')
  return `${repo}#${typeof e.subdir === 'string' ? e.subdir.replace(/\/+$/, '') : ''}`
}

describe('verified.json', () => {
  it('is an object holding only an apps list', () => {
    expect(file).toBeTypeOf('object')
    expect(Object.keys(file as object)).toEqual(['apps'])
    expect(Array.isArray((file as { apps: unknown }).apps)).toBe(true)
  })

  const apps = ((file as { apps?: unknown }).apps ?? []) as Entry[]

  it('names a GitHub repository and a full commit in every entry, and nothing else', () => {
    for (const e of apps) {
      expect(Object.keys(e).every((k) => KEYS.has(k))).toBe(true)
      expect(String(e.repo)).toMatch(REPO)
      expect(String(e.commit)).toMatch(COMMIT)
      if (e.note !== undefined) {
        expect(e.note).toBeTypeOf('string')
        expect((e.note as string).length).toBeLessThanOrEqual(300)
      }
    }
  })

  it('names a folder inside the repository, when it names one', () => {
    for (const e of apps.filter((a) => a.subdir !== undefined)) {
      const subdir = String(e.subdir)
      expect(subdir.length).toBeGreaterThan(0)
      expect(subdir.startsWith('/')).toBe(false)
      expect(subdir.includes('\\')).toBe(false)
      expect(subdir.split('/')).not.toContain('..')
    }
  })

  it('lists each app once', () => {
    const keys = apps.map(key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
