/**
 * What counts as a bookmarkable URL: `http:` or `https:` with a host, parsed
 * with the platform's own `URL`.
 *
 * A scheme allow-list rather than a URL validator, which would refuse
 * `http://localhost:3000` (the OS itself) and accept `ftp:`. The strictness
 * is load-bearing: an imported Netscape file is untrusted input, and the app
 * renders bookmarks as `<a href>`, so a `javascript:` or `data:` URL in the
 * file would be stored XSS. The file is checked on every write and every read.
 */
export const ALLOWED_SCHEMES = ['http:', 'https:'] as const

/** Longest URL accepted. Chrome's own limit is ~2MB; 2048 is the practical one. */
export const MAX_URL_LENGTH = 2048

export function isBookmarkUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed === '' || trimmed.length > MAX_URL_LENGTH) return false
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return false
  }
  if (!(ALLOWED_SCHEMES as readonly string[]).includes(parsed.protocol)) return false
  // An empty host is never a bookmark, whatever a runtime's parser allows.
  return parsed.hostname !== ''
}
