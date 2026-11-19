import { useRef, useState, useSyncExternalStore } from "react";
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

type MenuView = "more" | "snaps" | "units";

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
  const [menu, setMenu] = useState<{ x: number; y: number; view: MenuView } | null>(null);
  // A row that opens another list keeps the menu open: the kit closes a menu
  // on every row, so the close that follows a row's press is let through.
  const navigatedAt = useRef(0);
  const go = (view: MenuView) => {
    navigatedAt.current = Date.now();
    setMenu((m) => (m ? { ...m, view } : m));
  };
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
  // A phone's bar keeps the coordinates; the toggles sit in More, and the snaps
  // and the units each open as a list of their own, so no menu is taller than
  // a phone's screen at 44 px a row.
  const unitItems: ContextMenuItem[] = UNIT_OPTIONS.map((o) => ({
    label: o.label,
    checked: state.units.system === o.value,
    onSelect: () => editor.doc.setUnits({ ...state.units, system: o.value }),
  }));
  const unitLabel = UNIT_OPTIONS.find((o) => o.value === state.units.system)?.label ?? "";
  const moreItems: ContextMenuItem[] = [
    { label: "Ortho", checked: t.ortho, onSelect: () => editor.setToggles({ ortho: !t.ortho }) },
    { label: "Polar tracking", checked: t.polar, onSelect: () => editor.setToggles({ polar: !t.polar }) },
    { label: "Object snaps", checked: t.osnap, onSelect: () => editor.setToggles({ osnap: !t.osnap }) },
    { type: "separator" },
    { label: "Object snap settings…", onSelect: () => go("snaps") },
    { label: `Units: ${unitLabel}…`, onSelect: () => go("units") },
  ];
  const items = menu?.view === "more" ? moreItems : menu?.view === "units" ? unitItems : snapItems;
  const label = menu?.view === "more" ? "More" : menu?.view === "units" ? "Units" : "Object snaps";
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
            setMenu({ x: r.left, y: r.top - 4, view: "snaps" });
          }}
        >
          <ChevronUp size={11} />
        </button>
      </div>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          label={label}
          onClose={() => {
            if (Date.now() - navigatedAt.current > 300) setMenu(null);
          }}
          items={items}
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
          setMenu({ x: r.left, y: r.top - 4, view: "more" });
        }}
      >
        <EllipsisVertical size={18} />
      </button>
    </div>
  );
}
