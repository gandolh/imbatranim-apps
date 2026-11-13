import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  EllipsisVertical,
  FilePlus2,
  FolderOpen,
  ImageDown,
  Info,
  Loader2,
  Minus,
  NotebookText,
  PanelLeft,
  PanelRight,
  Play,
  Plus,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { Tooltip } from "@imbatranim/ui";
import { BarButton, BarSeparator } from "./controls.tsx";
import { FOCUS_RING, anchorOf, type MenuAnchor } from "./controlStyles.ts";

export type { MenuAnchor } from "./controlStyles.ts";

export type ToolbarState = {
  name: string;
  dirty: boolean;
  saving: boolean;
  exporting: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
  slideCount: number;
  current: number;
  zoomLabel: string;
  showRail: boolean;
  showNotes: boolean;
  /** The format panel is docked or its popover is open. */
  showInspector: boolean;
  /** Shapes are selected (or text is being edited): formatting applies. */
  hasSelection: boolean;
  hasText: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  sizeLabel: string;
  canDownload: boolean;
};

export type ToolbarActions = {
  newDeck: () => void;
  open: () => void;
  save: () => void;
  saveAs: () => void;
  undo: () => void;
  redo: () => void;
  toggleRail: () => void;
  toggleInspector: () => void;
  prev: () => void;
  next: () => void;
  zoomOut: () => void;
  zoomIn: () => void;
  toggleFit: () => void;
  toggleNotes: () => void;
  present: () => void;
  exportPng: () => void;
  download: () => void;
  moreMenu: (at: MenuAnchor) => void;
  newSlideMenu: (at: MenuAnchor) => void;
  duplicateSlide: () => void;
  deleteSlide: () => void;
  insertTextBox: () => void;
  insertPicture: () => void;
  shapeMenu: (at: MenuAnchor) => void;
  toggle: (what: "bold" | "italic" | "underline") => void;
  sizeMenu: (at: MenuAnchor) => void;
  sizeStep: (direction: 1 | -1) => void;
  colorMenu: (at: MenuAnchor) => void;
  align: (a: "l" | "ctr" | "r" | "just") => void;
  fillMenu: (at: MenuAnchor) => void;
  outlineMenu: (at: MenuAnchor) => void;
  arrangeMenu: (at: MenuAnchor) => void;
  deleteShapes: () => void;
};

const DESKTOP = "max-[600px]:hidden";
const PHONE = "hidden max-[600px]:flex";

/**
 * The app bar: the file and its history at the left, Download and Present
 * labelled at the right. On a phone it keeps Save, the history and Present,
 * and the rest sits in More.
 */
export function Toolbar({ state, actions }: { state: ToolbarState; actions: ToolbarActions }) {
  const s = state;
  const a = actions;
  const save = (
    <BarButton label="Save" shortcut="Ctrl+S" labelled onClick={a.save} disabled={s.saving || !s.dirty}>
      {s.saving ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <Save size={16} />}
    </BarButton>
  );
  const history = (
    <>
      <BarButton
        label={s.undoLabel ? `Undo ${s.undoLabel.toLowerCase()}` : "Undo"}
        shortcut="Ctrl+Z"
        onClick={a.undo}
        disabled={!s.canUndo}
      >
        <Undo2 size={16} />
      </BarButton>
      <BarButton
        label={s.redoLabel ? `Redo ${s.redoLabel.toLowerCase()}` : "Redo"}
        shortcut="Ctrl+Y"
        onClick={a.redo}
        disabled={!s.canRedo}
      >
        <Redo2 size={16} />
      </BarButton>
    </>
  );
  const present = (
    <BarButton label="Present" shortcut="F5" labelled edged onClick={a.present} disabled={s.slideCount === 0}>
      <Play size={16} />
    </BarButton>
  );
  return (
    <div
      role="toolbar"
      aria-label="File"
      className="border-outline-variant bg-surface-container-low h-appbar max-[600px]:h-appbar-phone flex shrink-0 items-center gap-[4px] border-b px-[4px]"
    >
      <div className={`${DESKTOP} contents`}>
        <BarButton label="Slide thumbnails" onClick={a.toggleRail} pressed={s.showRail}>
          <PanelLeft size={16} />
        </BarButton>
        <BarButton label="New presentation" onClick={a.newDeck}>
          <FilePlus2 size={16} />
        </BarButton>
        <BarButton label="Open" shortcut="Ctrl+O" onClick={a.open}>
          <FolderOpen size={16} />
        </BarButton>
      </div>
      {save}
      <div className={`${DESKTOP} contents`}>
        <BarButton label="Save as…" labelled onClick={a.saveAs} disabled={s.saving}>
          <Copy size={16} />
        </BarButton>
        <BarSeparator />
      </div>
      {history}
      <div className="min-w-0 flex-1" />
      <div className={`${DESKTOP} contents`}>
        <Tooltip content="Drawn by this app, layout may differ from PowerPoint">
          <span
            tabIndex={0}
            aria-label="Drawn by this app, layout may differ from PowerPoint"
            className={`text-on-surface-variant rounded-control flex h-[32px] w-[32px] shrink-0 items-center justify-center outline-none ${FOCUS_RING}`}
          >
            <Info size={16} />
          </span>
        </Tooltip>
        <BarButton
          label="Export this slide as a PNG"
          onClick={a.exportPng}
          disabled={s.slideCount === 0 || s.exporting}
        >
          {s.exporting ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <ImageDown size={16} />}
        </BarButton>
        <BarButton label="Download" labelled edged onClick={a.download} disabled={!s.canDownload}>
          <Download size={16} />
        </BarButton>
      </div>
      {present}
      <div className={`${DESKTOP} contents`}>
        <BarButton
          label={s.showInspector ? "Hide format panel" : "Show format panel"}
          onClick={a.toggleInspector}
          pressed={s.showInspector}
        >
          <PanelRight size={16} />
        </BarButton>
      </div>
      <div className={PHONE}>
        <BarButton label="More" menu={false} aria-haspopup="menu" onClick={(e) => a.moreMenu(anchorOf(e))}>
          <EllipsisVertical size={18} />
        </BarButton>
      </div>
    </div>
  );
}

/** The status band at the foot: the position, the notes and the zoom. */
export function StatusBand({ state, actions }: { state: ToolbarState; actions: ToolbarActions }) {
  const s = state;
  const a = actions;
  const canNavigate = s.slideCount > 1;
  return (
    <div
      role="toolbar"
      aria-label="Slide and view"
      className="border-outline-variant bg-surface-container h-statusbar max-[600px]:h-statusbar-phone flex shrink-0 items-center gap-[2px] border-t px-[8px]"
    >
      <BarButton
        label="Previous slide"
        shortcut="Page Up"
        className="h-[28px] w-[28px]"
        onClick={a.prev}
        disabled={!canNavigate || s.current === 0}
      >
        <ChevronLeft size={16} />
      </BarButton>
      <span className="font-ui text-on-surface text-control min-w-[84px] px-[4px] text-center whitespace-nowrap tabular-nums">
        {s.slideCount === 0 ? "No slides" : `Slide ${s.current + 1} of ${s.slideCount}`}
      </span>
      <BarButton
        label="Next slide"
        shortcut="Page Down"
        className="h-[28px] w-[28px]"
        onClick={a.next}
        disabled={!canNavigate || s.current >= s.slideCount - 1}
      >
        <ChevronRight size={16} />
      </BarButton>
      <div className="min-w-0 flex-1" />
      <BarButton
        label="Speaker notes"
        className="max-[600px]:w-target h-[28px] w-auto gap-[4px] px-[8px] font-normal max-[600px]:px-0"
        onClick={a.toggleNotes}
        pressed={s.showNotes}
      >
        <NotebookText size={16} />
        <span className="text-control max-[600px]:hidden" aria-hidden>
          Notes
        </span>
      </BarButton>
      <BarSeparator />
      <BarButton label="Zoom out" className="h-[28px] w-[28px]" onClick={a.zoomOut}>
        <Minus size={16} />
      </BarButton>
      <Tooltip content="Switch between fit width and fit page">
        <button
          type="button"
          onClick={a.toggleFit}
          className={`font-ui text-on-surface text-control hover:bg-surface-container-high rounded-item max-[600px]:h-target h-[28px] min-w-[64px] px-[8px] text-center whitespace-nowrap tabular-nums outline-none ${FOCUS_RING}`}
        >
          {s.zoomLabel}
        </button>
      </Tooltip>
      <BarButton label="Zoom in" className="h-[28px] w-[28px]" onClick={a.zoomIn}>
        <Plus size={16} />
      </BarButton>
    </div>
  );
}
