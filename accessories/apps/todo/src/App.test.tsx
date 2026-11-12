// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanupRendered, createFakeSystem, renderWithSystem, settle } from "@imbatranim-office/shared/testing";
import { fencedSystem } from "../../../shared/src/testing/fencedSystem";
import { App, Background } from "./App";
import { todoStore } from "./queries/todosQueries";

const UNFILED = {
  todos: [
    {
      id: 1,
      text: "Walk the dog",
      completed: false,
      position: 1,
      dueAt: null,
      priority: false,
      createdAt: "2026-11-01 08:00:00",
      updatedAt: "2026-11-01 08:00:00",
    },
  ],
};

beforeEach(() => todoStore.reset());
afterEach(cleanupRendered);

const host = { appId: "todo", assetBase: "/", server: null };

describe("Todo as a kit app", () => {
  it("shows the tasks from its files, with only the capabilities its descriptor grants", async () => {
    const fake = createFakeSystem({
      appId: "todo",
      appData: { "data:unfiled.json": JSON.stringify(UNFILED) },
    });
    const { container } = renderWithSystem(<App windowId="window-1" host={host} />, fencedSystem(fake.system, "todo"));
    await settle();
    expect(container.textContent).toContain("Walk the dog");
    expect(fake.notifications).toEqual([]);
  });

  it("writes a new task into its files", async () => {
    const fake = createFakeSystem({ appId: "todo" });
    const { container } = renderWithSystem(<App windowId="window-1" host={host} />, fencedSystem(fake.system, "todo"));
    await settle();
    const input = container.querySelector('input[placeholder^="Add a task"]') as HTMLInputElement;
    act(() => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setValue?.call(input, "Buy milk");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    await settle();
    const saved = JSON.parse(fake.appData.get("data:unfiled.json") as string);
    expect(saved.todos.map((t: { text: string }) => t.text)).toEqual(["Buy milk"]);
  });

  it("reads the tasks from its background service, with no window open", async () => {
    const dueAt = Date.now() - 1000;
    const fake = createFakeSystem({
      appId: "todo",
      windowId: null,
      appData: {
        "data:unfiled.json": JSON.stringify({ todos: [{ ...UNFILED.todos[0], dueAt }] }),
      },
    });
    renderWithSystem(<Background host={host} />, fencedSystem(fake.system, "todo"));
    await settle();
    await settle();
    // The due-date watcher reads what the service keeps read.
    expect(todoStore.get()?.todos).toHaveLength(1);
  });
});
