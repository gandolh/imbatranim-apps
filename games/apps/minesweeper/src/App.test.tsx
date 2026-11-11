// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanupRendered, clickButton, createFakeSystem, renderWithSystem } from "@imbatranim-office/shared/testing";
import { fencedSystem } from "../../../shared/src/testing/fencedSystem";
import { App } from "./App";

afterEach(cleanupRendered);

describe("Minesweeper as a kit app", () => {
  it("opens a beginner board with only the capabilities its descriptor grants", () => {
    const { system } = createFakeSystem({ appId: "minesweeper" });
    const { container } = renderWithSystem(<App />, fencedSystem(system, "minesweeper"));
    const board = container.querySelector('[aria-label="Minesweeper board"]');
    expect(board?.querySelectorAll('[aria-label^="Cell "]')).toHaveLength(81);
    clickButton("☺");
    expect(container.querySelectorAll('[aria-label^="Cell "]')).toHaveLength(81);
  });
});
