// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TodoRow } from "./TodoRow";
import type { Todo } from "./types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const TODO: Todo = {
  id: 7,
  text: "Buy milk",
  completed: false,
  position: 1,
  dueAt: null,
  priority: false,
  listId: null,
  createdAt: "2026-11-01 08:00:00",
  updatedAt: "2026-11-01 08:00:00",
};
const LISTS = [
  { id: 1, name: "Home", position: 1 },
  { id: 2, name: "Work", position: 2 },
];

const tick = () => new Promise((r) => setTimeout(r, 20));
const click = (el: Element) =>
  act(async () => {
    (el as HTMLElement).click();
    await tick();
  });
const key = (el: Element, k: string) =>
  act(async () => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
    await tick();
  });
const byLabel = (label: string) => container.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;

function render(props: Partial<Parameters<typeof TodoRow>[0]> = {}) {
  const onPatch = vi.fn();
  act(() =>
    root.render(
      <TodoRow
        todo={TODO}
        index={0}
        total={1}
        onDragEnd={null}
        onPatch={onPatch}
        onDelete={vi.fn()}
        selection={null}
        lists={LISTS}
        now={Date.UTC(2026, 10, 12)}
        {...props}
      />,
    ),
  );
  return onPatch;
}

describe("a task row's kit controls", () => {
  it("the importance star is a Toggle: aria-pressed follows the task, a press patches it", async () => {
    const onPatch = render();
    const star = byLabel("Mark important");
    expect(star.getAttribute("aria-pressed")).toBe("false");
    await click(star);
    expect(onPatch).toHaveBeenCalledWith(7, { priority: true });
  });

  it("select mode shows a kit Checkbox that reports the toggle", async () => {
    const onToggle = vi.fn();
    render({ selection: { selected: false, onToggle } });
    const box = byLabel("Select Buy milk");
    expect(box.getAttribute("role")).toBe("checkbox");
    expect(container.querySelector('input[type="checkbox"]:not([aria-hidden])')).toBeNull();
    await click(box);
    expect(onToggle).toHaveBeenCalledWith(7);
  });

  it("the list picker moves focus with the arrow keys without picking, and a press files the task", async () => {
    const onPatch = render();
    await click(byLabel("Move Buy milk to a list"));
    const chips = [...container.querySelectorAll<HTMLElement>('[aria-label="Move to"] button')];
    expect(chips.map((c) => c.textContent)).toEqual(["No list", "Home", "Work"]);
    expect(chips[0].getAttribute("aria-pressed")).toBe("true");
    act(() => chips[0].focus());
    await key(chips[0], "ArrowRight");
    expect(document.activeElement).toBe(chips[1]);
    expect(onPatch).not.toHaveBeenCalled();
    await click(chips[2]);
    expect(onPatch).toHaveBeenCalledWith(7, { listId: 2 });
    expect(container.querySelector('[aria-label="Move to"]')).toBeNull();
  });

  it("pressing the chosen list again is a pick that closes the row without patching", async () => {
    const onPatch = render({ todo: { ...TODO, listId: 1 } });
    await click(byLabel("Move Buy milk to a list"));
    const chips = [...container.querySelectorAll<HTMLElement>('[aria-label="Move to"] button')];
    expect(chips[1].getAttribute("aria-pressed")).toBe("true");
    await click(chips[1]);
    expect(onPatch).not.toHaveBeenCalled();
    expect(container.querySelector('[aria-label="Move to"]')).toBeNull();
  });
});
