/**
 * The annotate panel's content (shell/Tools.tsx places it: docked, a popover
 * or the phone's bottom sheet). Picks the active drawing tool, the mark
 * colour + stroke width, opens the signature pad, and toggles the Organize
 * view. Drives the shared {@link EditorController}.
 *
 * Built from the kit's controls: `ToolRadio` rows for the tools, radio groups
 * for the swatches and width chips. No AtelierPDF chrome.
 */
import type { ComponentType, JSX } from "react";
import {
  MousePointer2,
  Highlighter,
  Underline,
  Strikethrough,
  PenLine,
  Square,
  Minus,
  MoveUpRight,
  Type,
  StickyNote,
  Signature,
  Grid3x3,
} from "lucide-react";
import { Button, Radio, RadioGroup } from "@imbatranim/ui";
import { useReader } from "../app/context";
import { ToolRadio } from "../shell/ToolButton";
import { useEditor } from "./context";
import type { AnnotateTool, Swatch } from "./types";
import { colorToHex, hexToColor } from "./util";

interface ToolDef {
  tool: AnnotateTool;
  icon: ComponentType<{ size?: number }>;
  label: string;
}

const TOOLS: ToolDef[] = [
  { tool: "select", icon: MousePointer2, label: "Select / text (V)" },
  { tool: "highlight", icon: Highlighter, label: "Highlight" },
  { tool: "underline", icon: Underline, label: "Underline" },
  { tool: "strikeout", icon: Strikethrough, label: "Strikeout" },
  { tool: "ink", icon: PenLine, label: "Freehand ink" },
  { tool: "rect", icon: Square, label: "Rectangle" },
  { tool: "line", icon: Minus, label: "Line" },
  { tool: "arrow", icon: MoveUpRight, label: "Arrow" },
  { tool: "freeText", icon: Type, label: "Text box" },
  { tool: "note", icon: StickyNote, label: "Sticky note" },
];

const SWATCHES: Swatch[] = [
  { name: "Saffron", color: { r: 0.95, g: 0.72, b: 0.2 } },
  { name: "Rose", color: { r: 0.9, g: 0.28, b: 0.35 } },
  { name: "Leaf", color: { r: 0.3, g: 0.62, b: 0.32 } },
  { name: "Sky", color: { r: 0.24, g: 0.5, b: 0.86 } },
  { name: "Ink", color: { r: 0.12, g: 0.12, b: 0.14 } },
];

const WIDTHS = [1, 2, 4, 6];

const Head = ({ children }: { children: string }) => (
  <h3 className="font-ui text-on-surface-variant text-control m-0 mb-[6px] font-semibold">{children}</h3>
);

/** A labelled panel button (Sign, Organize): the lowest surface with its edge, full width. */
const PANEL_BUTTON =
  "h-[32px] max-[600px]:h-target w-full justify-center gap-[8px] rounded-control border-outline bg-surface-container-lowest text-control font-semibold text-on-surface hover:border-outline hover:bg-surface-container-high focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset";
const PANEL_BUTTON_ON = "border-primary bg-primary-container text-on-primary-container hover:bg-primary-container";

/**
 * The annotate panel: the ten tools as labelled rows (the current one soft),
 * the mark colours, the stroke widths, then Sign and Organize. It docks
 * beside the page in a wide window, opens as a popover in a narrow one and in
 * the bottom sheet on a phone.
 */
export function AnnotateToolbar(): JSX.Element {
  const { mode, setMode } = useReader();
  const editor = useEditor();
  const { tool, setTool, color, setColor, strokeWidth, setStrokeWidth, openSignDialog, busy } = editor;

  const sameColor = (a: typeof color, b: typeof color) =>
    Math.abs(a.r - b.r) < 0.02 && Math.abs(a.g - b.g) < 0.02 && Math.abs(a.b - b.b) < 0.02;

  return (
    <div className="flex flex-col gap-[12px]">
      <section>
        <Head>Tools</Head>
        <RadioGroup<AnnotateTool>
          className="flex flex-col gap-[2px]"
          aria-label="Annotation tools"
          value={tool}
          onValueChange={setTool}
        >
          {TOOLS.map((td) => (
            <ToolRadio
              key={td.tool}
              icon={td.icon}
              label={td.label}
              text={td.label.replace(/ \(V\)$/, "")}
              value={td.tool}
              checked={tool === td.tool}
            />
          ))}
        </RadioGroup>
      </section>

      <section>
        <Head>Colour</Head>
        <div className="flex flex-wrap items-center gap-[6px]">
          <RadioGroup
            className="contents"
            aria-label="Mark colour"
            value={SWATCHES.find((s) => sameColor(color, s.color))?.name ?? ""}
            onValueChange={(name) => {
              const swatch = SWATCHES.find((s) => s.name === name);
              if (swatch) setColor(swatch.color);
            }}
          >
            {SWATCHES.map((s) => (
              <Radio
                key={s.name}
                value={s.name}
                className={({ checked }) =>
                  "rounded-small focus-visible:ring-primary block h-[24px] w-[24px] border-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 max-[600px]:h-[36px] max-[600px]:w-[36px] " +
                  (checked ? "border-on-surface ring-primary ring-2" : "border-transparent")
                }
                style={{ background: `rgb(${s.color.r * 255} ${s.color.g * 255} ${s.color.b * 255})` }}
                title={s.name}
                aria-label={s.name}
              />
            ))}
          </RadioGroup>
          <label
            className="border-outline-variant rounded-small focus-within:ring-primary relative inline-flex h-[24px] w-[24px] cursor-pointer overflow-hidden border focus-within:ring-2 max-[600px]:h-[36px] max-[600px]:w-[36px]"
            title="Custom colour"
          >
            <input
              type="color"
              className="absolute -m-[20%] h-[140%] w-[140%] cursor-pointer border-none bg-none p-0"
              value={colorToHex(color)}
              onChange={(e) => setColor(hexToColor(e.target.value))}
              aria-label="Custom colour"
            />
          </label>
        </div>
      </section>

      <section>
        <Head>Width</Head>
        <RadioGroup
          className="flex items-center gap-[6px]"
          aria-label="Stroke width"
          value={String(strokeWidth)}
          onValueChange={(next) => setStrokeWidth(Number(next))}
        >
          {WIDTHS.map((wv) => (
            <Radio
              key={wv}
              value={String(wv)}
              className={({ checked }) =>
                "rounded-control focus-visible:ring-primary max-[600px]:h-target flex h-[32px] w-[40px] items-center justify-center border outline-none focus-visible:ring-2 focus-visible:ring-inset " +
                (checked
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high")
              }
              title={`${wv} pt`}
              aria-label={`${wv} point stroke`}
            >
              <span className="block w-[18px] bg-current" style={{ height: Math.max(2, wv) }} />
            </Radio>
          ))}
        </RadioGroup>
      </section>

      {busy && <span className="text-on-surface-variant font-ui text-label">Saving…</span>}

      <section className="border-outline-variant flex flex-col gap-[6px] border-t pt-[12px]">
        <Button
          variant="ghost"
          size="sm"
          className={`${PANEL_BUTTON} ${tool === "sign" ? PANEL_BUTTON_ON : ""}`}
          onClick={openSignDialog}
          title="Sign: capture a signature and stamp it on the page"
        >
          <Signature size={16} />
          Sign
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`${PANEL_BUTTON} ${mode === "organize" ? PANEL_BUTTON_ON : ""}`}
          onClick={() => setMode(mode === "organize" ? "read" : "organize")}
          title="Organize pages: rotate, reorder, merge and split"
        >
          <Grid3x3 size={16} />
          {mode === "organize" ? "Done" : "Organize"}
        </Button>
      </section>
    </div>
  );
}
