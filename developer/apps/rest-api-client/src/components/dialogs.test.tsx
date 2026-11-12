// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { cleanupRendered, createFakeSystem, renderWithSystem } from "@imbatranim-office/shared/testing";
import { AuthDialog } from "./AuthDialog";
import { CurlDialog } from "./CurlDialog";
import { EnvironmentDialog } from "./EnvironmentDialog";
import type { Environment } from "../types";

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
  document.body.innerHTML = "";
});

const settle = () => act(async () => void (await new Promise((r) => setTimeout(r, 50))));

const pressEscape = () =>
  act(() => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
  });

const pressOutside = () =>
  act(() => {
    const backdrop = document.querySelector(".z-scrim") ?? document.body;
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      backdrop.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
    }
  });

const ENV: Environment = {
  id: "e1",
  name: "Local",
  vars: [{ id: "v1", name: "token", value: "abc", secret: false }],
};

describe("dialogs that hold a form", () => {
  it("the authorization dialog stays open on an outside press and closes on Esc", async () => {
    const onClose = vi.fn();
    act(() => root.render(<AuthDialog environment={null} onApply={vi.fn()} onClose={onClose} />));
    await settle();
    pressOutside();
    await settle();
    expect(onClose).not.toHaveBeenCalled();
    pressEscape();
    await settle();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("the environments dialog stays open on an outside press and closes on Esc", async () => {
    const onClose = vi.fn();
    act(() =>
      root.render(<EnvironmentDialog environments={[ENV]} activeEnvId="e1" onChange={vi.fn()} onClose={onClose} />),
    );
    await settle();
    pressOutside();
    await settle();
    expect(onClose).not.toHaveBeenCalled();
    pressEscape();
    await settle();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("the environments dialog's secret flag is a kit Checkbox", async () => {
    const onChange = vi.fn();
    act(() =>
      root.render(<EnvironmentDialog environments={[ENV]} activeEnvId="e1" onChange={onChange} onClose={vi.fn()} />),
    );
    await settle();
    const secret = [...document.querySelectorAll<HTMLElement>('[role="checkbox"]')].find((el) =>
      el.closest("label")?.textContent?.includes("secret"),
    )!;
    expect(secret.getAttribute("aria-checked")).toBe("false");
    await act(async () => {
      secret.click();
      await new Promise((r) => setTimeout(r, 20));
    });
    const next = onChange.mock.calls.at(-1)![0] as Environment[];
    expect(next[0].vars[0].secret).toBe(true);
  });

  it("the curl dialog keeps outside-press dismissal when it only shows a command, and holds when it imports", async () => {
    const request = { method: "GET" as const, url: "https://example.com", headers: [], body: "" };
    const { system } = createFakeSystem({ appId: "rest-api-client" });
    const onClose = vi.fn();
    renderWithSystem(<CurlDialog mode="export" request={request} onImport={vi.fn()} onClose={onClose} />, system);
    await settle();
    pressOutside();
    await settle();
    expect(onClose).toHaveBeenCalledTimes(1);
    cleanupRendered();

    const onClose2 = vi.fn();
    renderWithSystem(<CurlDialog mode="import" request={request} onImport={vi.fn()} onClose={onClose2} />, system);
    await settle();
    pressOutside();
    await settle();
    expect(onClose2).not.toHaveBeenCalled();
    cleanupRendered();
  });
});
