/**
 * The page's tools beside it. While `Select / text` is current they rest as
 * a 56 px strip of Annotate, Sign and Organize, icon over label, so the page
 * keeps its width. Annotate opens the 232 px panel, docked beside the page in
 * a window of 1100 px or more and as a popover on its strip icon below that.
 * On a phone a labelled bottom bar (Pages, Annotate, Sign, Organize) opens
 * the kit's bottom sheet.
 *
 * The annotate panel and the side panel's tabs are lazy chunks: the strip and
 * the bar are on screen from the first page, disabled until the engine is in.
 */
import { Suspense } from "react";
import type { ReactElement, ReactNode, RefObject } from "react";
import { Grid3x3, Highlighter, LayoutGrid, Signature } from "lucide-react";
import { BottomSheet, Popover, Toggle, Tooltip, cn } from "@imbatranim/ui";
import { useReader } from "../app/context";
import { useEditor } from "../editor/context";
import { AnnotateToolbar } from "../lazy";

/** The ring every stop shows: 2 px of the accent, inside the control. */
const FOCUS_RING = "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset";

const STRIP_BUTTON = cn(
  "font-ui text-label text-on-surface flex h-[52px] w-[48px] flex-col items-center justify-center gap-[2px] rounded-control font-semibold outline-none",
  "hover:bg-surface-container-high active:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
  "[&_svg]:text-on-surface-variant",
  FOCUS_RING,
);
/** Open or in use: the soft accent with an accent edge. */
const STRIP_ON =
  "bg-primary-container text-on-primary-container ring-1 ring-primary ring-inset hover:bg-primary-container [&_svg]:text-on-primary-container";

const SIGN_TITLE = "Sign: capture a signature and stamp it on the page";
const ORGANIZE_TITLE = "Organize pages: rotate, reorder, merge and split";

function AnnotateContent(): ReactNode {
  return (
    <Suspense fallback={null}>
      <AnnotateToolbar />
    </Suspense>
  );
}

/** The docked annotate panel. */
export function AnnotatePanel(): ReactElement {
  return (
    <aside
      aria-label="Annotate"
      className="border-outline-variant bg-surface-container-low w-annotate flex shrink-0 flex-col overflow-y-auto border-l p-[12px]"
    >
      <AnnotateContent />
    </aside>
  );
}

/**
 * The idle strip. In a wide window Annotate docks the panel; in a narrow one
 * it opens the panel as a popover beside the strip.
 */
export function ToolsStrip({
  enabled,
  docks,
  popoverOpen,
  onPopoverChange,
  onDock,
}: {
  /** The engine is in, so the tools work. */
  enabled: boolean;
  /** The window is wide enough to dock the panel. */
  docks: boolean;
  popoverOpen: boolean;
  onPopoverChange: (open: boolean) => void;
  onDock: () => void;
}): ReactElement {
  const { mode, setMode } = useReader();
  const { openSignDialog } = useEditor();
  const annotateFace = (
    <>
      <Highlighter size={18} aria-hidden />
      Annotate
    </>
  );
  return (
    <aside
      aria-label="Tools"
      className="border-outline-variant bg-surface-container-low w-pdf-strip flex shrink-0 flex-col items-center gap-[4px] border-l py-[8px]"
    >
      {docks || !enabled ? (
        <button type="button" className={STRIP_BUTTON} onClick={onDock} disabled={!enabled}>
          {annotateFace}
        </button>
      ) : (
        <Popover
          open={popoverOpen}
          onOpenChange={onPopoverChange}
          side="left"
          align="start"
          sideOffset={4}
          label="Annotate"
          className="w-annotate bg-surface-container-lowest max-h-[70vh] overflow-y-auto p-[12px]"
          trigger={
            <button type="button" className={cn(STRIP_BUTTON, popoverOpen && STRIP_ON)}>
              {annotateFace}
            </button>
          }
        >
          <AnnotateContent />
        </Popover>
      )}
      <Tooltip content={SIGN_TITLE}>
        <button type="button" className={STRIP_BUTTON} onClick={openSignDialog} disabled={!enabled}>
          <Signature size={18} aria-hidden />
          Sign
        </button>
      </Tooltip>
      <Tooltip content={ORGANIZE_TITLE}>
        <Toggle
          pressed={mode === "organize"}
          onPressedChange={(on) => setMode(on ? "organize" : "read")}
          disabled={!enabled}
          className={({ pressed }) => cn(STRIP_BUTTON, pressed && STRIP_ON)}
        >
          <Grid3x3 size={18} aria-hidden />
          Organize
        </Toggle>
      </Tooltip>
    </aside>
  );
}

const BOTTOM_BUTTON = cn(
  "font-ui text-label text-on-surface flex h-full min-w-target flex-1 flex-col items-center justify-center gap-[2px] font-semibold outline-none",
  "active:bg-surface-container-highest disabled:opacity-50 [&_svg]:text-on-surface-variant",
  FOCUS_RING,
);

/** The phone's bottom bar: Pages and Annotate open the kit's bottom sheet; Sign and Organize act at once. */
export function ToolsBottomBar({
  enabled,
  pages,
  container,
}: {
  enabled: boolean;
  /** The side panel's tabs, shown in the Pages sheet. */
  pages: ReactNode;
  container: RefObject<HTMLElement | null>;
}): ReactElement {
  const { mode, setMode } = useReader();
  const { openSignDialog } = useEditor();
  return (
    <div
      role="toolbar"
      aria-label="PDF tools"
      className="border-outline-variant bg-surface-container-low h-bottombar flex shrink-0 border-t"
    >
      <BottomSheet
        title="Pages"
        container={container}
        className="h-[70%]"
        trigger={
          (
            <button type="button" className={BOTTOM_BUTTON}>
              <LayoutGrid size={18} aria-hidden />
              Pages
            </button>
          ) as ReactElement
        }
      >
        {pages}
      </BottomSheet>
      <BottomSheet
        title="Annotate"
        container={container}
        trigger={
          (
            <button type="button" className={BOTTOM_BUTTON} disabled={!enabled}>
              <Highlighter size={18} aria-hidden />
              Annotate
            </button>
          ) as ReactElement
        }
      >
        <AnnotateContent />
      </BottomSheet>
      <button type="button" className={BOTTOM_BUTTON} onClick={openSignDialog} disabled={!enabled}>
        <Signature size={18} aria-hidden />
        Sign
      </button>
      <Toggle
        pressed={mode === "organize"}
        onPressedChange={(on) => setMode(on ? "organize" : "read")}
        disabled={!enabled}
        className={({ pressed }) => cn(BOTTOM_BUTTON, pressed && STRIP_ON)}
      >
        <Grid3x3 size={18} aria-hidden />
        Organize
      </Toggle>
    </div>
  );
}
