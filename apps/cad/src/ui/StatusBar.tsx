import { useState, useSyncExternalStore } from "react";
import { ChevronUp, EllipsisVertical } from "lucide-react";
import { ContextMenu, Select, Toggle, cn, type ContextMenuItem } from "@imbatranim/ui";
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
  const [menu, setMenu] = useState<{ x: number; y: number; more: boolean } | null>(null);
  const t = state.toggles;
  const snapItems: ContextMenuItem[] = [
    ...SNAP_MODES.map((m) => ({
      label: SNAP_LABEL[m],
      checked: t.snapModes.includes(m),
      onSelect: () =>
        editor.setToggles({
          snapModes: t.snapModes.includes(m) ? t.snapModes.filter((x) => x !== m) : [...t.snapModes, m],
        }),
    })),
    { type: "separator" },
    ...[15, 30, 45, 90].map((deg) => ({
      label: `Polar every ${deg}°`,
      checked: t.polarIncrement === deg,
      onSelect: () => editor.setToggles({ polarIncrement: deg }),
    })),
  ];
  // A phone's bar keeps the coordinates; the toggles, the snaps and the units sit in More.
  const moreItems: ContextMenuItem[] = [
    { label: "Ortho", checked: t.ortho, onSelect: () => editor.setToggles({ ortho: !t.ortho }) },
    { label: "Polar tracking", checked: t.polar, onSelect: () => editor.setToggles({ polar: !t.polar }) },
    { label: "Object snaps", checked: t.osnap, onSelect: () => editor.setToggles({ osnap: !t.osnap }) },
    { type: "separator" },
    ...snapItems,
    { type: "separator" },
    ...UNIT_OPTIONS.map((o) => ({
      label: `Units: ${o.label}`,
      checked: state.units.system === o.value,
      onSelect: () => editor.doc.setUnits({ ...state.units, system: o.value }),
    })),
  ];
  return (
    <div className="border-outline-variant bg-surface-container font-ui text-on-surface-variant text-label h-statusbar max-[600px]:h-statusbar-phone flex shrink-0 items-center gap-[4px] overflow-x-auto border-t px-[8px]">
      <span
        className="text-on-surface w-[220px] shrink-0 truncate tabular-nums max-[600px]:w-auto max-[600px]:min-w-0 max-[600px]:shrink"
        data-testid="cad-coordinates"
      >
        {coords}
      </span>
      <div className="contents max-[600px]:hidden">
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
            setMenu({ x: r.left, y: r.top - 4, more: false });
          }}
        >
          <ChevronUp size={11} />
        </button>
      </div>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          label={menu.more ? "More" : "Object snaps"}
          onClose={() => setMenu(null)}
          items={menu.more ? moreItems : snapItems}
        />
      )}
      <div className="flex-1" />
      {state.selectionCount > 0 && <span className="mr-2">{state.selectionCount} selected</span>}
      <span className="max-[600px]:hidden">Units</span>
      <div className="w-[130px] max-[600px]:hidden">
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
      <button
        type="button"
        aria-label="More"
        aria-haspopup="menu"
        title="More"
        className="text-on-surface-variant hover:bg-surface-container-high focus-visible:ring-primary rounded-item h-target w-target hidden shrink-0 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset max-[600px]:flex"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setMenu({ x: r.left, y: r.top - 4, more: true });
        }}
      >
        <EllipsisVertical size={18} />
      </button>
    </div>
  );
}
