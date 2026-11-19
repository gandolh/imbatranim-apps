// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Sidebar } from "./Sidebar";
import type { RestClientData } from "../types";

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

const long = "https://example.test/" + "a-very-long-path/".repeat(12);

const data = {
  collections: [{ id: "r1", name: long, method: "GET", url: long }],
  history: [{ id: "h1", method: "GET", url: long, status: 200 }],
} as unknown as RestClientData;

describe("Sidebar", () => {
  it("lists the collections and the history", () => {
    act(() =>
      root.render(
        <Sidebar
          data={data}
          current={{ method: "GET", url: "" }}
          onOpenRequest={vi.fn()}
          onOpenSaved={vi.fn()}
          onDeleteSaved={vi.fn()}
          onOpenHistory={vi.fn()}
          onClearHistory={vi.fn()}
        />,
      ),
    );
    expect(container.textContent).toContain("Collections");
    expect(container.textContent).toContain("History");
  });
});
