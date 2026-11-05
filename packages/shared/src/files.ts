import type { FileChoice } from '@imbatranim/ui'

/**
 * The folder holding `file`, for a file dialog's `startIn`: Save as opens
 * beside the document instead of at the home root. A file at the top of its
 * root gives the root itself (an empty path).
 */
export function folderOf(file: FileChoice): FileChoice {
  const cut = file.path.lastIndexOf('/')
  return { root: file.root, path: cut < 0 ? '' : file.path.slice(0, cut) }
}
