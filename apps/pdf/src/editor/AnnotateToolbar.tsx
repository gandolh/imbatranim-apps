/**
 * The annotate toolbar — the console's second row (TopBar `toolbarSlot`). Picks
 * the active drawing tool, the mark colour + stroke width, opens the signature
 * pad, and toggles the Organize view. Drives the shared {@link EditorController}.
 *
 * Rebuilt in the OS design language: `ToolButton` (OS Button + Tooltip) for the
 * tool rail, `Button`/`Separator` from core, Tailwind token utilities for the
 * swatches and width chips. No AtelierPDF chrome.
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
import { Button, Radio, RadioGroup, Separator } from "@imbatranim/ui";
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

export function AnnotateToolbar(): JSX.Element {
  const { mode, setMode } = useReader();
  const editor = useEditor();
  const { tool, setTool, color, setColor, strokeWidth, setStrokeWidth, openSignDialog, busy } = editor;

  const sameColor = (a: typeof color, b: typeof color) =>
    Math.abs(a.r - b.r) < 0.02 && Math.abs(a.g - b.g) < 0.02 && Math.abs(a.b - b.b) < 0.02;

  return (
    <div className="flex w-full flex-wrap items-center gap-1">
      {/* Tools */}
      <RadioGroup<AnnotateTool>
        className="flex items-center gap-0.5"
        aria-label="Annotation tools"
        value={tool}
        onValueChange={setTool}
      >
        {TOOLS.map((td) => (
          <ToolRadio
            key={td.tool}
            icon={td.icon}
            iconSize={16}
            label={td.label}
            value={td.tool}
            checked={tool === td.tool}
          />
        ))}
      </RadioGroup>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Sign */}
      <Button
        variant={tool === "sign" ? "primary" : "ghost"}
        size="sm"
        className="flex items-center gap-1"
        onClick={openSignDialog}
        title="Sign — capture a signature and stamp it on the page"
      >
        <Signature size={15} />
        Sign
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Colour */}
      <div className="flex items-center gap-1">
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
                "block h-5 w-5 border-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)] transition-transform hover:scale-110 " +
                (checked ? "border-on-surface ring-primary ring-2" : "border-transparent")
              }
              style={{ background: `rgb(${s.color.r * 255} ${s.color.g * 255} ${s.color.b * 255})` }}
              title={s.name}
              aria-label={s.name}
            />
          ))}
        </RadioGroup>
        <label
          className="border-outline-variant relative inline-flex h-[22px] w-[22px] cursor-pointer overflow-hidden border"
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

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Stroke width */}
      <RadioGroup
        className="flex items-center gap-1"
        aria-label="Stroke width"
        value={String(strokeWidth)}
        onValueChange={(next) => setStrokeWidth(Number(next))}
      >
        {WIDTHS.map((wv) => (
          <Radio
            key={wv}
            value={String(wv)}
            className={({ checked }) =>
              "flex h-6 w-[30px] items-center justify-center border " +
              (checked
                ? "border-primary bg-primary-container text-primary"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high")
            }
            title={`${wv} pt`}
            aria-label={`${wv} point stroke`}
          >
            <span className="block w-[18px] bg-current" style={{ height: Math.max(2, wv) }} />
          </Radio>
        ))}
      </RadioGroup>

      <div className="flex-1" />

      {busy && <span className="text-primary font-ui text-label">Saving…</span>}

      {/* Organize toggle */}
      <Button
        variant={mode === "organize" ? "primary" : "default"}
        size="sm"
        className="flex items-center gap-1"
        onClick={() => setMode(mode === "organize" ? "read" : "organize")}
        title="Organize pages — rotate, reorder, merge & split"
      >
        <Grid3x3 size={15} />
        {mode === "organize" ? "Done" : "Organize"}
      </Button>
    </div>
  );
}
