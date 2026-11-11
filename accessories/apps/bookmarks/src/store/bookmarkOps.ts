import type { ParsedFolder } from "../netscape";
import type {
  BookmarkGroup,
  BookmarkLink,
  CreateGroupInput,
  CreateLinkInput,
  UpdateGroupInput,
  UpdateLinkInput,
} from "../types";
import { isBookmarkUrl, MAX_URL_LENGTH } from "./bookmarkUrl";

/**
 * What Bookmarks does to its folders, as pure functions: the rules the OS's
 * `bookmarks` module kept when they lived in its database, now applied in
 * the app before its file is written. The state is every folder, flat, each
 * with its own links, in position order.
 */

export const MAX_NAME = 200;
export const MAX_TITLE = 300;
/** Breadth cap for one import: far above any real browser's export. */
export const MAX_SIBLINGS = 500;

type Groups = BookmarkGroup[];
type Change<R> = { next: Groups; result: R };

const byPosition = (a: { position: number; id: number }, b: { position: number; id: number }) =>
  a.position - b.position || a.id - b.id;

/** Folders and their links in position order, as the window reads them. */
export function ordered(groups: Groups): Groups {
  return [...groups].sort(byPosition).map((g) => ({ ...g, links: [...g.links].sort(byPosition) }));
}

function checkName(name: string): string {
  if (name.trim() === "") throw new Error("A folder needs a name");
  if (name.length > MAX_NAME) throw new Error(`A folder name is at most ${MAX_NAME} characters`);
  return name;
}

function checkTitle(title: string): string {
  if (title.trim() === "") throw new Error("A bookmark needs a title");
  if (title.length > MAX_TITLE) throw new Error(`A title is at most ${MAX_TITLE} characters`);
  return title;
}

function checkUrl(url: string): string {
  if (url.length > MAX_URL_LENGTH || !isBookmarkUrl(url)) {
    throw new Error("A bookmark is an http:// or https:// URL");
  }
  return url;
}

function requireGroup(groups: Groups, id: number): BookmarkGroup {
  const group = groups.find((g) => g.id === id);
  if (!group) throw new Error(`Bookmark group ${id} not found`);
  return group;
}

const allLinks = (groups: Groups) => groups.flatMap((g) => g.links);
const nextId = (rows: { id: number }[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
const nextPosition = (rows: { position: number }[]) => rows.reduce((max, r) => Math.max(max, r.position), 0) + 1;
const childrenOf = (groups: Groups, parentId: number | null) => groups.filter((g) => g.parentId === parentId);

/**
 * A folder and every descendant. Bounded by a seen-set: the cycle guard
 * makes a loop impossible, but a hand-edited file must not spin the app.
 */
function subtreeIds(groups: Groups, rootId: number): Set<number> {
  const ids = new Set<number>();
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift() as number;
    if (ids.has(id)) continue;
    ids.add(id);
    for (const child of childrenOf(groups, id)) queue.push(child.id);
  }
  return ids;
}

/** Refuse a move that would make a folder its own ancestor: walk up from the new parent. */
function refuseCycle(groups: Groups, id: number, parentId: number): void {
  let cursor: number | null = parentId;
  const seen = new Set<number>();
  while (cursor !== null) {
    if (cursor === id) {
      throw new Error("A folder cannot be moved inside itself or one of its own subfolders");
    }
    if (seen.has(cursor)) break;
    seen.add(cursor);
    cursor = groups.find((g) => g.id === cursor)?.parentId ?? null;
  }
}

export function createGroup(groups: Groups, input: CreateGroupInput): Change<BookmarkGroup> {
  const parentId = input.parentId ?? null;
  if (parentId !== null) requireGroup(groups, parentId);
  const group: BookmarkGroup = {
    id: nextId(groups),
    name: checkName(input.name),
    icon: null,
    parentId,
    position: nextPosition(childrenOf(groups, parentId)),
    links: [],
  };
  return { next: [...groups, group], result: group };
}

export function updateGroup(groups: Groups, id: number, input: UpdateGroupInput): Change<BookmarkGroup> {
  const existing = requireGroup(groups, id);
  const updated: BookmarkGroup = { ...existing };
  if (input.name !== undefined) updated.name = checkName(input.name);
  if (input.parentId !== undefined) {
    const parentId = input.parentId ?? null;
    if (parentId !== null) {
      requireGroup(groups, parentId);
      refuseCycle(groups, id, parentId);
    }
    // A new parent means a place among its children; the old siblings' gap
    // changes no order.
    updated.parentId = parentId;
    updated.position = nextPosition(childrenOf(groups, parentId).filter((g) => g.id !== id));
  }
  return { next: groups.map((g) => (g.id === id ? updated : g)), result: updated };
}

/** Delete a folder, its subfolders and every link in them. */
export function deleteGroup(groups: Groups, id: number): Change<void> {
  requireGroup(groups, id);
  const gone = subtreeIds(groups, id);
  return { next: groups.filter((g) => !gone.has(g.id)), result: undefined };
}

export function createLink(groups: Groups, input: CreateLinkInput): Change<BookmarkLink> {
  const group = requireGroup(groups, input.groupId);
  const link: BookmarkLink = {
    id: nextId(allLinks(groups)),
    groupId: group.id,
    title: checkTitle(input.title),
    url: checkUrl(input.url),
    icon: null,
    position: nextPosition(group.links),
  };
  return {
    next: groups.map((g) => (g.id === group.id ? { ...g, links: [...g.links, link] } : g)),
    result: link,
  };
}

export function updateLink(groups: Groups, id: number, input: UpdateLinkInput): Change<BookmarkLink> {
  const existing = allLinks(groups).find((l) => l.id === id);
  if (!existing) throw new Error(`Bookmark link ${id} not found`);
  const updated: BookmarkLink = { ...existing };
  if (input.title !== undefined) updated.title = checkTitle(input.title);
  if (input.url !== undefined) updated.url = checkUrl(input.url);
  if (input.groupId !== undefined && input.groupId !== existing.groupId) {
    const target = requireGroup(groups, input.groupId);
    updated.groupId = target.id;
    updated.position = nextPosition(target.links);
  }
  const next = groups.map((g) => {
    const links = g.links.filter((l) => l.id !== id);
    return { ...g, links: g.id === updated.groupId ? [...links, updated] : links };
  });
  return { next, result: updated };
}

export function deleteLink(groups: Groups, id: number): Change<void> {
  if (!allLinks(groups).some((l) => l.id === id)) throw new Error(`Bookmark link ${id} not found`);
  return {
    next: groups.map((g) => ({ ...g, links: g.links.filter((l) => l.id !== id) })),
    result: undefined,
  };
}

/**
 * Add a parsed Netscape tree under `parentId` (the top level when absent),
 * all of it or none: one rejected URL refuses the whole import.
 */
export function importTree(
  groups: Groups,
  folders: ParsedFolder[],
  parentId?: number | null,
): Change<{ folders: number; links: number }> {
  const parent = parentId ?? null;
  if (parent !== null) requireGroup(groups, parent);
  if (folders.length > MAX_SIBLINGS) throw new Error(`An import holds at most ${MAX_SIBLINGS} folders at one level`);
  const added: BookmarkGroup[] = [];
  let groupId = nextId(groups);
  let linkId = nextId(allLinks(groups));
  const counts = { folders: 0, links: 0 };

  const walk = (folder: ParsedFolder, under: number | null, position: number): void => {
    if (folder.links.length > MAX_SIBLINGS || folder.folders.length > MAX_SIBLINGS) {
      throw new Error(`An import holds at most ${MAX_SIBLINGS} items in one folder`);
    }
    const id = groupId++;
    added.push({
      id,
      name: checkName(folder.name),
      icon: null,
      parentId: under,
      position,
      links: folder.links.map((link, index) => ({
        id: linkId++,
        groupId: id,
        title: checkTitle(link.title),
        url: checkUrl(link.url),
        icon: null,
        position: index + 1,
      })),
    });
    counts.folders += 1;
    counts.links += folder.links.length;
    folder.folders.forEach((child, index) => walk(child, id, index + 1));
  };

  const start = nextPosition(childrenOf(groups, parent));
  folders.forEach((folder, index) => walk(folder, parent, start + index));
  return { next: [...groups, ...added], result: counts };
}
