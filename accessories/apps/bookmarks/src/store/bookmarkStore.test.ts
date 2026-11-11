import { describe, expect, it } from "vitest";
import { createFakeSystem } from "@imbatranim-office/shared/testing";
import type { SystemData } from "@imbatranim/ui";
import { BOOKMARKS_FILE, bookmarkFiles, readGroups } from "./bookmarkFiles";
import * as ops from "./bookmarkOps";
import type { BookmarkGroup } from "../types";

function group(id: number, parentId: number | null, links: [number, string][] = []): BookmarkGroup {
  return {
    id,
    name: `Folder ${id}`,
    icon: null,
    parentId,
    position: id,
    links: links.map(([linkId, url], index) => ({
      id: linkId,
      groupId: id,
      title: url,
      url,
      icon: null,
      position: index + 1,
    })),
  };
}

describe("Bookmarks' file", () => {
  it("reads the folders and their links as the OS moved them", async () => {
    const file = {
      groups: [
        {
          id: 1,
          name: "Work",
          icon: null,
          parentId: null,
          position: 1,
          links: [{ id: 7, title: "Docs", url: "https://example.com", icon: null, position: 1 }],
        },
      ],
    };
    const { system } = createFakeSystem({
      appData: { [`data:${BOOKMARKS_FILE}`]: JSON.stringify(file) },
    });
    const { state } = await bookmarkFiles.load(system.data as SystemData);
    expect(state[0].links[0]).toEqual({
      id: 7,
      groupId: 1,
      title: "Docs",
      url: "https://example.com",
      icon: null,
      position: 1,
    });
  });

  it("leaves out a link the app could never have stored, so it is never rendered", () => {
    const content = JSON.stringify({
      groups: [
        {
          id: 1,
          name: "Edited by hand",
          parentId: null,
          position: 1,
          links: [
            { id: 1, title: "bad", url: "javascript:alert(1)", position: 1 },
            { id: 2, title: "good", url: "http://localhost:3000", position: 2 },
          ],
        },
      ],
    });
    expect(readGroups(content)[0].links.map((l) => l.id)).toEqual([2]);
  });

  it("writes the same shape it reads", async () => {
    const groups = [group(1, null, [[3, "https://a.example"]])];
    const text = bookmarkFiles.serialize(groups).get(BOOKMARKS_FILE) as string;
    expect(readGroups(text)).toEqual(groups);
  });
});

describe("Bookmarks' rules", () => {
  it("refuses to move a folder inside its own subfolder", () => {
    const groups = [group(1, null), group(2, 1), group(3, 2)];
    expect(() => ops.updateGroup(groups, 1, { parentId: 3 })).toThrow("inside itself");
  });

  it("deletes a folder with its subfolders and their links", () => {
    const groups = [group(1, null), group(2, 1, [[5, "https://a.example"]]), group(3, null)];
    expect(ops.deleteGroup(groups, 1).next.map((g) => g.id)).toEqual([3]);
  });

  it("refuses a URL that is not http or https", () => {
    const groups = [group(1, null)];
    expect(() => ops.createLink(groups, { groupId: 1, title: "x", url: "data:text/html,hi" })).toThrow(
      "http:// or https://",
    );
  });

  it("moves a link to the end of its new folder", () => {
    const groups = [group(1, null, [[1, "https://a.example"]]), group(2, null, [[2, "https://b.example"]])];
    const { next, result } = ops.updateLink(groups, 1, { groupId: 2 });
    expect(result).toMatchObject({ groupId: 2, position: 2 });
    expect(next[0].links).toEqual([]);
    expect(next[1].links.map((l) => l.id)).toEqual([2, 1]);
  });

  it("imports a tree whole, or nothing when one URL is refused", () => {
    const groups = [group(1, null)];
    const tree = [
      {
        name: "Imported",
        links: [{ title: "A", url: "https://a.example" }],
        folders: [{ name: "Sub", links: [{ title: "B", url: "https://b.example" }], folders: [] }],
      },
    ];
    const { next, result } = ops.importTree(groups, tree);
    expect(result).toEqual({ folders: 2, links: 2 });
    const sub = next.find((g) => g.name === "Sub");
    expect(next.find((g) => g.id === sub?.parentId)?.name).toBe("Imported");

    const bad = [{ ...tree[0], links: [{ title: "evil", url: "javascript:void 0" }] }];
    expect(() => ops.importTree(groups, bad)).toThrow();
  });
});
