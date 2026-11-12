// @vitest-environment jsdom
// The kit controls the PDF chrome is built from: tool and fit radios, the side panel's tabs, and the signature dialog.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ReaderContext } from "./app/context";
import type { ReaderController } from "./app/types";
import { EditorContext, useEditor } from "./editor/context";
import type { EditorController } from "./editor/types";
import { AnnotateToolbar } from "./editor/AnnotateToolbar";
import { SignatureDialog } from "./editor/SignatureDialog";
import { SidePanel } from "./shell/SidePanel";
import { ToolToggle } from "./shell/ToolButton";
import { PanelLeft } from "lucide-react";

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

const tick = () => new Promise((r) => setTimeout(r, 30));
const settle = () => act(async () => void (await tick()));
const render = (node: ReactNode) => act(() => root.render(node));
const click = (el: Element) =>
  act(async () => {
    (el as HTMLElement).click();
    await tick();
  });
/** An arrow key moves focus, and focus on a radio or an automatic tab chooses it a tick later. */
const key = (el: Element, k: string) =>
  act(async () => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
    await tick();
  });
const pressOutside = () =>
  act(() => {
    const backdrop = document.querySelector(".z-scrim") ?? document.body;
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      backdrop.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
    }
  });

function editorFor(over: Partial<EditorController>): EditorController {
  // The context's own no-op default, then what the test names.
  let base: EditorController | undefined;
  function Grab() {
    base = useEditor();
    return null;
  }
  render(<Grab />);
  return { ...(base as EditorController), ...over };
}

describe("annotate toolbar", () => {
  it("the tools are a radio group: the arrow keys move and choose", async () => {
    const setTool = vi.fn();
    const editor = editorFor({ tool: "select", setTool });
    const reader = { mode: "read", setMode: vi.fn() } as unknown as ReaderController;
    render(
      <ReaderContext.Provider value={reader}>
        <EditorContext.Provider value={editor}>
          <AnnotateToolbar />
        </EditorContext.Provider>
      </ReaderContext.Provider>,
    );
    const group = container.querySelector('[role="radiogroup"][aria-label="Annotation tools"]')!;
    const radios = [...group.querySelectorAll<HTMLElement>('[role="radio"]')];
    expect(radios).toHaveLength(10);
    expect(radios[0].getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector("[aria-pressed]")).toBeNull();
    act(() => radios[0].focus());
    await key(radios[0], "ArrowRight");
    expect(setTool).toHaveBeenCalledWith("highlight");
  });

  it("the stroke widths and the mark colours are radio groups too", async () => {
    const setStrokeWidth = vi.fn();
    const setColor = vi.fn();
    const editor = editorFor({ strokeWidth: 2, setStrokeWidth, setColor });
    const reader = { mode: "read", setMode: vi.fn() } as unknown as ReaderController;
    render(
      <ReaderContext.Provider value={reader}>
        <EditorContext.Provider value={editor}>
          <AnnotateToolbar />
        </EditorContext.Provider>
      </ReaderContext.Provider>,
    );
    const widths = [...container.querySelectorAll<HTMLElement>('[aria-label="Stroke width"] [role="radio"]')];
    expect(widths.map((w) => w.getAttribute("aria-checked"))).toEqual(["false", "true", "false", "false"]);
    act(() => widths[1].focus());
    await key(widths[1], "ArrowRight");
    expect(setStrokeWidth).toHaveBeenCalledWith(4);

    const colours = [...container.querySelectorAll<HTMLElement>('[aria-label="Mark colour"] [role="radio"]')];
    expect(colours.map((c) => c.getAttribute("aria-label"))).toEqual(["Saffron", "Rose", "Leaf", "Sky", "Ink"]);
    expect(colours[0].getAttribute("aria-checked")).toBe("true");
    await click(colours[3]);
    expect(setColor).toHaveBeenCalledWith(expect.objectContaining({ r: 0.24 }));
  });
});

describe("ToolToggle", () => {
  it("is an on/off button: aria-pressed follows the prop and a press reports the change", async () => {
    const onPressedChange = vi.fn();
    render(<ToolToggle icon={PanelLeft} label="Side panel" pressed={false} onPressedChange={onPressedChange} />);
    const button = container.querySelector<HTMLButtonElement>('button[aria-label="Side panel"]')!;
    expect(button.getAttribute("aria-pressed")).toBe("false");
    await click(button);
    expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
  });
});

describe("side panel", () => {
  it("is a tab set: the arrow keys move and choose, and the panel is a tabpanel", async () => {
    const setPanelTab = vi.fn();
    const reader = { panelTab: "thumbnails", setPanelTab, painted: false } as unknown as ReaderController;
    render(
      <ReaderContext.Provider value={reader}>
        <SidePanel />
      </ReaderContext.Provider>,
    );
    const tabs = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
    expect(tabs.map((t) => t.textContent)).toEqual(["Thumbnails", "Outline"]);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(container.querySelector('[role="tabpanel"][data-panel-scroll]')).not.toBeNull();
    act(() => tabs[0].focus());
    await key(tabs[0], "ArrowRight");
    expect(setPanelTab).toHaveBeenCalledWith("outline");
  });
});

describe("signature dialog", () => {
  const open = (closeSignDialog: () => void) =>
    render(
      <EditorContext.Provider value={editorFor({ signDialogOpen: true, closeSignDialog })}>
        <SignatureDialog />
      </EditorContext.Provider>,
    );

  it("stays open on an outside press and closes on Esc", async () => {
    const closeSignDialog = vi.fn();
    open(closeSignDialog);
    await settle();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    pressOutside();
    await settle();
    expect(closeSignDialog).not.toHaveBeenCalled();
    act(() => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      );
    });
    await settle();
    expect(closeSignDialog).toHaveBeenCalledTimes(1);
  });

  it("switches between Draw and Type with the arrow keys", async () => {
    open(vi.fn());
    await settle();
    const tabs = [...document.querySelectorAll<HTMLElement>('[role="tab"]')];
    expect(tabs.map((t) => t.textContent)).toEqual(["Draw", "Type"]);
    expect(document.querySelector("canvas")).not.toBeNull();
    act(() => tabs[0].focus());
    await key(tabs[0], "ArrowRight");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector("canvas")).toBeNull();
    expect(document.querySelector('input[placeholder="Type your name"]')).not.toBeNull();
  });
});
