import { useState, useSyncExternalStore } from "react";
import { ChevronUp } from "lucide-react";
import { ContextMenu, Select, Toggle, cn } from "@imbatranim/ui";
import type { Editor, EditorState } from "../engine/editor";
import { SNAP_LABEL, SNAP_MODES } from "../engine/input/snap";
import type { UnitSystem } from "../engine/model/types";

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: "decimal", label: "Decimal" },
  { value: "architectural", label: "Feet and inches" },
  { value: "metric", label: "Metric" },
];

function StatusToggle({
  label,
  title,
  on,
  onClick,
}: {
  label: string;
  title: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <Toggle
      pressed={on}
      onPressedChange={() => onClick()}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      className={({ pressed }) =>
        cn(
          "text-label rounded-item focus-visible:ring-primary h-[24px] border px-[6px] font-semibold tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-inset",
          pressed
            ? "border-primary bg-primary-container text-on-primary-container focus-visible:ring-on-primary-container!"
            : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
        )
      }
    >
      {label}
    </Toggle>
  );
}

export function StatusBar({ editor, state }: { editor: Editor; state: EditorState }) {
  const coords = useSyncExternalStore(
    (cb) => editor.subscribe((c) => c === "overlay" && cb()),
    () => editor.cursorText(),
  );
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const t = state.toggles;
  return (
    <div className="border-outline-variant bg-surface-container font-ui text-on-surface-variant text-label h-statusbar max-[600px]:h-statusbar-phone flex shrink-0 items-center gap-[4px] overflow-x-auto border-t px-[8px]">
      <span className="text-on-surface w-[220px] shrink-0 truncate tabular-nums" data-testid="cad-coordinates">
        {coords}
      </span>
      <StatusToggle
        label="ORTHO"
        title="Ortho (F8)"
        on={t.ortho}
        onClick={() => editor.setToggles({ ortho: !t.ortho })}
      />
      <StatusToggle
        label="POLAR"
        title={`Polar tracking every ${t.polarIncrement}° (F10)`}
        on={t.polar}
        onClick={() => editor.setToggles({ polar: !t.polar })}
      />
      <StatusToggle
        label="OSNAP"
        title="Object snaps (F3)"
        on={t.osnap}
        onClick={() => editor.setToggles({ osnap: !t.osnap })}
      />
      <button
        type="button"
        aria-label="Object snap settings"
        title="Object snap settings"
        className="border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus-visible:ring-primary rounded-item flex h-[24px] items-center border px-[2px] outline-none focus-visible:ring-2 focus-visible:ring-inset"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setMenu({ x: r.left, y: r.top - 4 });
        }}
      >
        <ChevronUp size={11} />
      </button>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          label="Object snaps"
          onClose={() => setMenu(null)}
          items={[
            ...SNAP_MODES.map((m) => ({
              label: SNAP_LABEL[m],
              checked: t.snapModes.includes(m),
              onSelect: () =>
                editor.setToggles({
                  snapModes: t.snapModes.includes(m) ? t.snapModes.filter((x) => x !== m) : [...t.snapModes, m],
                }),
            })),
            { type: "separator" as const },
            ...[15, 30, 45, 90].map((deg) => ({
              label: `Polar every ${deg}°`,
              checked: t.polarIncrement === deg,
              onSelect: () => editor.setToggles({ polarIncrement: deg }),
            })),
          ]}
        />
      )}
      <div className="flex-1" />
      {state.selectionCount > 0 && <span className="mr-2">{state.selectionCount} selected</span>}
      <span>Units</span>
      <div className="w-[130px]">
        <Select
          value={state.units.system}
          options={UNIT_OPTIONS}
          onValueChange={(v) => {
            if (typeof v === "string") editor.doc.setUnits({ ...state.units, system: v as UnitSystem });
          }}
          className="text-label h-[24px] py-0"
          aria-label="Units"
        />
      </div>
    </div>
  );
}
