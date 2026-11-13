import { useEffect, useRef, useState } from "react";
import { cn, useElementSize } from "@imbatranim/ui";
import type { SlideModel } from "../engine/model";
import { SlideView } from "../view/SlideView";
import { BASE_WIDTH, slideHeight } from "../view/slideMetrics";

type Props = {
  /** A column beside the slide (a desktop), or two columns under it (a phone). */
  layout: "column" | "grid";
  /** The navigator's width in a column, which grows with the window's height. */
  width: number;
  count: number;
  current: number;
  model: (index: number) => SlideModel | null;
  /** Bumps whenever the deck changes, so thumbnails redraw. */
  version: number;
  onSelect: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
  onContextMenu: (x: number, y: number, index: number) => void;
};

/**
 * The slide rail: a live thumbnail per slide (the same renderer as the
 * stage, scaled down), drag to reorder, right-click for the slide menu.
 * Keys while a thumbnail has focus: arrows move between slides,
 * Ctrl+arrows move the slide, Delete removes it.
 */
export function Rail({
  layout,
  width,
  count,
  current,
  model,
  version,
  onSelect,
  onMove,
  onDelete,
  onContextMenu,
}: Props) {
  const grid = layout === "grid";
  /** A thumbnail fills its column, less the numeral's 16 px and the 4 px gap beside it. */
  const thumbWidth = grid ? 0 : Math.max(40, width - 33);
  const listRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ from: number; startY: number; active: boolean } | null>(null);
  /** The click that ends a drag is not a selection. */
  const justDragged = useRef(false);
  const [dropAt, setDropAt] = useState<number | null>(null);

  // Keep the current slide in view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${current}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [current]);

  const indexAt = (clientY: number): number => {
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? [])];
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return Number(el.dataset.index);
    }
    return items.length;
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Slides"
      style={grid ? undefined : { width }}
      className={cn(
        "bg-surface-container-low relative shrink-0 overflow-y-auto",
        grid
          ? "border-outline-variant min-h-0 flex-1 border-t [mask-image:linear-gradient(to_bottom,#000_calc(100%-24px),transparent)]"
          : "border-outline-variant border-r",
      )}
    >
      <div
        className={
          grid
            ? "grid grid-cols-2 gap-x-[24px] gap-y-[8px] px-[24px] pt-[8px] pb-[24px]"
            : "flex flex-col gap-[4px] px-[6px] py-[8px]"
        }
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="relative">
            {dropAt === i && <div className="bg-primary absolute -top-[5px] right-0 left-0 h-[2px]" />}
            <button
              type="button"
              role="option"
              data-index={i}
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              onClick={() => {
                if (justDragged.current) {
                  justDragged.current = false;
                  return;
                }
                onSelect(i);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onSelect(i);
                onContextMenu(e.clientX, e.clientY, i);
              }}
              onKeyDown={(e) => {
                const mod = e.ctrlKey || e.metaKey;
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const to = i + (e.key === "ArrowDown" ? 1 : -1);
                  if (to < 0 || to >= count) return;
                  if (mod) onMove(i, to);
                  onSelect(to);
                  requestAnimationFrame(() =>
                    listRef.current?.querySelector<HTMLElement>(`[data-index="${to}"]`)?.focus(),
                  );
                } else if (e.key === "Delete" || e.key === "Backspace") {
                  e.preventDefault();
                  onDelete(i);
                }
              }}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                drag.current = { from: i, startY: e.clientY, active: false };
                try {
                  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                } catch {
                  // An untracked pointer: the drag still works over the rail.
                }
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                if (!d.active && Math.abs(e.clientY - d.startY) < 6) return;
                d.active = true;
                setDropAt(indexAt(e.clientY));
              }}
              onPointerUp={(e) => {
                const d = drag.current;
                drag.current = null;
                setDropAt(null);
                if (!d?.active) return;
                justDragged.current = true;
                const at = indexAt(e.clientY);
                // Dropping below itself shifts the target by the slide's own slot.
                const to = at > d.from ? at - 1 : at;
                if (to !== d.from) onMove(d.from, Math.max(0, Math.min(count - 1, to)));
              }}
              onPointerCancel={() => {
                drag.current = null;
                setDropAt(null);
              }}
              className={cn(
                "group rounded-item flex w-full text-left outline-none",
                grid ? "flex-col items-center gap-[4px] p-[4px]" : "items-center gap-[4px] py-[6px]",
                "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "font-display text-subhead w-[16px] shrink-0 text-center leading-[18px] font-bold tabular-nums",
                  grid && "order-last",
                  i === current ? "text-primary" : "text-on-surface-variant",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "outline-primary block shrink-0 outline-offset-2",
                  grid ? "w-full" : "",
                  i === current ? "outline-2" : "ring-outline-variant group-hover:ring-on-surface-variant ring-1",
                )}
                style={grid ? undefined : { width: thumbWidth }}
              >
                <Thumb index={i} model={model} version={version} />
              </span>
            </button>
          </div>
        ))}
        {dropAt === count && <div className="bg-primary h-[2px]" />}
      </div>
    </div>
  );
}

/** One thumbnail, drawn only once it scrolls into view (a long deck stays cheap). */
function Thumb({ index, model, version }: { index: number; model: (i: number) => SlideModel | null; version: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, attachSize] = useElementSize();
  const [visible, setVisible] = useState(typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (!el || visible || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  const m = visible ? model(index) : null;
  void version;
  const aspect = m ? slideHeight(m) / BASE_WIDTH : 0.5625;
  const scale = size.width / BASE_WIDTH;
  return (
    <div
      ref={(el) => {
        ref.current = el;
        attachSize(el);
      }}
      aria-hidden="true"
      className="relative w-full overflow-hidden bg-white"
      style={{ aspectRatio: `1 / ${aspect}` }}
    >
      {m && size.width > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
          }}
        >
          <SlideView model={m} />
        </div>
      )}
      {m?.hidden && <div className="absolute inset-0 bg-white/60" />}
    </div>
  );
}
