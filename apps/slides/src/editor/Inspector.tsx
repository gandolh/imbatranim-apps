import type { ReactElement, ReactNode, RefObject } from "react";
import {
  AArrowDown,
  AArrowUp,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Copy,
  Image as ImageIcon,
  Italic,
  Layers,
  PaintBucket,
  Plus,
  Shapes,
  SquareDashed,
  Trash2,
  Type,
  Underline,
} from "lucide-react";
import { BottomSheet, Button, Popover, Tooltip, cn } from "@imbatranim/ui";
import { Tool } from "./controls.tsx";
import { FOCUS_RING, anchorOf } from "./controlStyles.ts";
import { GROUPS, HINT, groupEnabled, type Group } from "./inspectorGroups.ts";
import type { ToolbarActions, ToolbarState } from "./Toolbar.tsx";

const Row = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap gap-[6px]">{children}</div>;

/** Two or more tools joined into one edged group (bold, italic, underline; the alignments). */
const Segment = ({ label, children }: { label: string; children: ReactNode }) => (
  <div
    role="group"
    aria-label={label}
    className="border-outline-variant bg-surface-container-lowest rounded-control flex overflow-hidden border [&>*]:rounded-none [&>*]:border-0"
  >
    {children}
  </div>
);

/** One group's tools, as the docked panel, a popover and a phone sheet show them. */
function GroupTools({ group, state: s, actions: a }: { group: Group; state: ToolbarState; actions: ToolbarActions }) {
  const none = s.slideCount === 0;
  switch (group) {
    case "insert":
      return (
        <Row>
          <Tool label="Text box" icon={<Type size={16} />} onClick={a.insertTextBox} disabled={none} />
          <Tool label="Picture" icon={<ImageIcon size={16} />} onClick={a.insertPicture} disabled={none} />
          <Tool
            label="Shape"
            icon={<Shapes size={16} />}
            menu
            onClick={(e) => a.shapeMenu(anchorOf(e))}
            disabled={none}
          />
        </Row>
      );
    case "slide":
      return (
        <Row>
          <Tool
            label="New slide"
            shortcut="Ctrl+M"
            icon={<Plus size={16} />}
            menu
            onClick={(e) => a.newSlideMenu(anchorOf(e))}
          />
          <Tool label="Duplicate slide" icon={<Copy size={16} />} onClick={a.duplicateSlide} disabled={none} />
          <Tool label="Delete slide" icon={<Trash2 size={16} />} onClick={a.deleteSlide} disabled={none} />
        </Row>
      );
    case "text": {
      const off = !s.hasText;
      return (
        <div className="flex flex-col gap-[6px]">
          <Row>
            <Tool
              label="Font size"
              icon={<span className="min-w-[24px] text-left tabular-nums">{s.sizeLabel}</span>}
              iconOnly
              menu
              keep
              className="w-auto min-w-[64px] justify-between px-[8px]"
              disabled={off}
              onClick={(e) => a.sizeMenu(anchorOf(e))}
            />
            <Tool
              label="Increase font size"
              shortcut="Ctrl+]"
              iconOnly
              keep
              icon={<AArrowUp size={16} />}
              disabled={off}
              onClick={() => a.sizeStep(1)}
            />
            <Tool
              label="Decrease font size"
              shortcut="Ctrl+["
              iconOnly
              keep
              icon={<AArrowDown size={16} />}
              disabled={off}
              onClick={() => a.sizeStep(-1)}
            />
            <Tool
              label="Font colour"
              iconOnly
              menu
              keep
              icon={<Baseline size={16} />}
              className="w-auto gap-[2px] px-[8px]"
              disabled={off}
              onClick={(e) => a.colorMenu(anchorOf(e))}
            />
          </Row>
          <Row>
            <Segment label="Style">
              <Tool
                label="Bold"
                shortcut="Ctrl+B"
                iconOnly
                keep
                pressed={s.bold}
                icon={<Bold size={16} />}
                disabled={off}
                onClick={() => a.toggle("bold")}
              />
              <Tool
                label="Italic"
                shortcut="Ctrl+I"
                iconOnly
                keep
                pressed={s.italic}
                icon={<Italic size={16} />}
                disabled={off}
                onClick={() => a.toggle("italic")}
              />
              <Tool
                label="Underline"
                shortcut="Ctrl+U"
                iconOnly
                keep
                pressed={s.underline}
                icon={<Underline size={16} />}
                disabled={off}
                onClick={() => a.toggle("underline")}
              />
            </Segment>
            <Segment label="Alignment">
              <Tool
                label="Align left"
                shortcut="Ctrl+L"
                iconOnly
                keep
                icon={<AlignLeft size={16} />}
                disabled={off}
                onClick={() => a.align("l")}
              />
              <Tool
                label="Centre"
                shortcut="Ctrl+E"
                iconOnly
                keep
                icon={<AlignCenter size={16} />}
                disabled={off}
                onClick={() => a.align("ctr")}
              />
              <Tool
                label="Align right"
                shortcut="Ctrl+R"
                iconOnly
                keep
                icon={<AlignRight size={16} />}
                disabled={off}
                onClick={() => a.align("r")}
              />
              <Tool
                label="Justify"
                shortcut="Ctrl+J"
                iconOnly
                keep
                icon={<AlignJustify size={16} />}
                disabled={off}
                onClick={() => a.align("just")}
              />
            </Segment>
          </Row>
        </div>
      );
    }
    case "shape": {
      const off = !s.hasSelection;
      return (
        <Row>
          <Tool
            label="Shape fill"
            icon={<PaintBucket size={16} />}
            menu
            disabled={off}
            onClick={(e) => a.fillMenu(anchorOf(e))}
          />
          <Tool
            label="Shape outline"
            icon={<SquareDashed size={16} />}
            menu
            disabled={off}
            onClick={(e) => a.outlineMenu(anchorOf(e))}
          />
          <Tool
            label="Arrange"
            icon={<Layers size={16} />}
            menu
            disabled={off}
            onClick={(e) => a.arrangeMenu(anchorOf(e))}
          />
          <Tool
            label="Delete"
            shortcut="Delete"
            icon={<Trash2 size={16} />}
            danger
            disabled={off}
            onClick={a.deleteShapes}
          />
        </Row>
      );
    }
  }
}

const Head = ({ children }: { children: ReactNode }) => (
  <h3 className="font-ui text-on-surface-variant text-control m-0 mb-[8px] font-semibold">{children}</h3>
);

/** The docked panel: every group, with the hint while nothing is selected. */
export function InspectorPanel({ state, actions }: { state: ToolbarState; actions: ToolbarActions }) {
  return (
    <aside
      aria-label="Format"
      className="border-outline-variant bg-surface-container-low w-inspector flex shrink-0 flex-col overflow-y-auto border-l px-[8px] max-[600px]:hidden"
    >
      {GROUPS.map((g, i) => (
        <section key={g.id} className={cn("py-[12px]", i > 0 && "border-outline-variant border-t")}>
          {g.id === "text" && !state.hasText && !state.hasSelection && (
            <p className="font-ui text-on-surface-variant text-control m-0 mb-[8px]">{HINT}</p>
          )}
          <Head>{g.title}</Head>
          <GroupTools group={g.id} state={state} actions={actions} />
        </section>
      ))}
    </aside>
  );
}

const STRIP_BUTTON = cn(
  "font-ui text-label text-on-surface flex h-[52px] w-[40px] flex-col items-center justify-center gap-[2px] rounded-control font-semibold outline-none",
  "hover:bg-surface-container-high active:bg-surface-container-highest data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent",
  "[&_svg]:text-on-surface-variant data-[popup-open]:[&_svg]:text-on-primary-container",
  "data-[popup-open]:bg-primary-container data-[popup-open]:text-on-primary-container data-[popup-open]:ring-1 data-[popup-open]:ring-primary data-[popup-open]:ring-inset data-[popup-open]:focus-visible:ring-on-primary-container",
  FOCUS_RING,
);

/**
 * The idle inspector: a 48 px strip of the four groups, icon over label. In
 * a narrow window each opens its group as a popover beside the strip; in a
 * wide one a press docks the panel. Text and Shape wait for a selection,
 * with the hint as their tooltip.
 */
export function InspectorStrip({
  state,
  actions,
  docks,
  open,
  autoOpened,
  onOpen,
  onDock,
}: {
  state: ToolbarState;
  actions: ToolbarActions;
  /** The window is wide enough to dock the panel. */
  docks: boolean;
  /** The group whose popover is open. */
  open: Group | null;
  /** The popover opened on a selection, so it leaves focus on the slide. */
  autoOpened: boolean;
  onOpen: (g: Group | null) => void;
  onDock: () => void;
}) {
  return (
    <aside
      aria-label="Format"
      className="border-outline-variant bg-surface-container-low w-inspector-strip flex shrink-0 flex-col items-center gap-[4px] border-l py-[8px] max-[600px]:hidden"
    >
      {GROUPS.map((g) => {
        const enabled = groupEnabled(g.id, state);
        const face = (
          <>
            <g.icon size={18} aria-hidden />
            {g.title}
          </>
        );
        if (!enabled) {
          return (
            <Tooltip key={g.id} content={g.id === "text" || g.id === "shape" ? HINT : g.title}>
              <Button variant="ghost" size="sm" focusableWhenDisabled disabled className={cn(STRIP_BUTTON, "p-0")}>
                {face}
              </Button>
            </Tooltip>
          );
        }
        if (docks) {
          return (
            <button key={g.id} type="button" className={STRIP_BUTTON} onClick={onDock}>
              {face}
            </button>
          );
        }
        return (
          <Popover
            key={g.id}
            open={open === g.id}
            onOpenChange={(next) => onOpen(next ? g.id : null)}
            side="left"
            align="start"
            sideOffset={4}
            initialFocus={autoOpened ? false : undefined}
            label={g.title}
            className="w-popover bg-surface-container-lowest p-[12px]"
            trigger={
              <button type="button" className={STRIP_BUTTON}>
                {face}
              </button>
            }
          >
            <Head>{g.title}</Head>
            <GroupTools group={g.id} state={state} actions={actions} />
          </Popover>
        );
      })}
    </aside>
  );
}

const BOTTOM_BUTTON = cn(
  "font-ui text-label text-on-surface flex h-full min-w-target flex-1 flex-col items-center justify-center gap-[2px] font-semibold outline-none",
  "active:bg-surface-container-highest [&_svg]:text-on-surface-variant",
  FOCUS_RING,
);

/** The phone's bottom bar: the four groups, labelled, each opening the kit's bottom sheet. */
export function InspectorBottomBar({
  state,
  actions,
  container,
}: {
  state: ToolbarState;
  actions: ToolbarActions;
  container: RefObject<HTMLElement | null>;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Format"
      className="border-outline-variant bg-surface-container-low h-bottombar hidden shrink-0 border-t max-[600px]:flex"
    >
      {GROUPS.map((g) => (
        <BottomSheet
          key={g.id}
          title={g.title}
          container={container}
          trigger={
            (
              <button type="button" className={BOTTOM_BUTTON}>
                <g.icon size={18} aria-hidden />
                {g.title}
              </button>
            ) as ReactElement
          }
        >
          {(g.id === "text" || g.id === "shape") && !groupEnabled(g.id, state) && (
            <p className="font-ui text-on-surface-variant text-control m-0 mb-[8px]">{HINT}</p>
          )}
          <GroupTools group={g.id} state={state} actions={actions} />
        </BottomSheet>
      ))}
    </div>
  );
}
