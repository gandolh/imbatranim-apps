/**
 * PDF — the merged reader and editor (the OS's PDF Viewer and norPDF
 * as one app). Top-level composition of the shell: owns the shared
 * {@link ReaderController} (via context) and lays out the console, side panel
 * and main area. File I/O (OS open-intent + the OS picker + drag-drop) lives
 * here.
 *
 * The first page comes first. Everything this module imports statically is on
 * the way to it: the shell, the reader and the controller, which reaches pdf.js
 * with a dynamic import. The rail's panels, the annotate toolbar and overlay,
 * the forms panel, the organise view, the signature pad and the engine itself
 * are separate chunks (lazy.ts, app/engine.ts) that load once a page is on
 * screen, or when first opened. eslint.config.js keeps it that way.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  PART B MOUNT POINTS
 * ═══════════════════════════════════════════════════════════════════════════
 *  1. Annotate panel    → beside the page (shell/Tools.tsx): a strip at rest,
 *                         the panel docked or a popover when open, the
 *                         bottom sheet on a phone.
 *  2. Forms panel       → a tab via `<SidePanel extraTabs={[…]} />`.
 *  3. Organize view     → the `mode === 'organize'` branch of the main area.
 *  4. Sign / dialogs    → mounted alongside the shell, driving `doc.sign` then
 *                         a raster sync.
 *  5. Per-page overlay  → PageView mounts the annotation overlay keyed to the
 *                         page's `vp` (PageViewport).
 *
 *  After a mutating edit (both actions are on the controller from useReader()):
 *   • in-place annotation add/update/delete → `bumpRenderEpoch()`
 *   • structural change (reorder/insert/delete) or `await doc.save()` →
 *     `await reloadDocument()`
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import {
  Button,
  ContextMenu,
  useElementSize,
  useFileDialog,
  useOpenIntent,
  useUnsavedGuard,
  type OpenedFile,
} from "@imbatranim/ui";
import { usePhone } from "@imbatranim-office/shared";
import { Download, Ellipsis, FileText, PanelRight } from "lucide-react";
import { ReaderContext, useReader } from "./app/context";
import { useEditor } from "./editor/context";
import { useReaderController } from "./app/useReaderController";
import { useReplaceGate, type ReplaceLoad } from "./app/useReplaceGate";
import { EmptyState } from "./app/EmptyState";
import { StatusBand, TopBar } from "./shell/TopBar";
import { SidePanel } from "./shell/SidePanel";
import type { SidePanelTab } from "./shell/SidePanel";
import { ToolToggle } from "./shell/ToolButton";
import { AnnotatePanel, ToolsBottomBar, ToolsStrip } from "./shell/Tools";
import { Reader } from "./reader/Reader";
import { EditorProvider } from "./editor/EditorProvider";
import { FormsPanel, OrganizeView, SignatureDialog } from "./lazy";

/** The window's width from which the annotate panel docks beside the page; below it Annotate opens as a popover. */
const DOCK_WIDTH = 1100;

/**
 * The unsaved-close guard, as a component INSIDE both providers: the dialog's
 * Save-and-close button needs the editor's `saveToDisk` (write-back, or a
 * download for a homeless document — either clears dirty), which
 * `useReaderController` itself cannot reach from outside `EditorProvider`.
 */
function UnsavedCloseGuard(): JSX.Element {
  const { dirty, docName } = useReader();
  const { saveToDisk } = useEditor();
  const unsavedDialog = useUnsavedGuard(dirty, docName, saveToDisk);
  return <>{unsavedDialog}</>;
}

export function Pdf({ windowId: _windowId }: { windowId: string }): JSX.Element {
  const ctrl = useReaderController();
  return (
    <ReaderContext.Provider value={ctrl}>
      <EditorProvider>
        <UnsavedCloseGuard />
        <PdfShell />
      </EditorProvider>
    </ReaderContext.Provider>
  );
}

/** The forms tab, appended to the rail. Its panel is a lazy chunk. */
const FORMS_TAB: SidePanelTab = {
  id: "forms",
  label: "Forms",
  icon: FileText,
  render: () => <FormsPanel />,
};

/**
 * The shell, INSIDE both providers: every path that replaces the open document
 * goes through `requestReplace`, whose Save button needs the editor's
 * `saveToDisk` — the same reason `UnsavedCloseGuard` lives here.
 */
function PdfShell(): JSX.Element {
  const ctrl = useReader();
  const { saveToDisk, signDialogOpen, tool, exportCopy } = useEditor();
  const [root, attachRootSize] = useElementSize();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const attachRoot = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      attachRootSize(el);
    },
    [attachRootSize],
  );
  const phone = usePhone();
  /** The annotate panel's state set by its toggle; null follows the tool (a markup tool opens it). */
  const [panel, setPanel] = useState<boolean | null>(null);
  const [popover, setPopover] = useState(false);
  const [more, setMore] = useState<{ x: number; y: number } | null>(null);
  const { requestReplace, dialog: replaceDialog } = useReplaceGate(ctrl.dirty, ctrl.docName, saveToDisk);
  // One-shot open intent, drained by the shared hook (StrictMode-safe).
  const source = useOpenIntent();
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  // Ctrl/Cmd+S (write-back Save) is registered in TopBar, which lives inside
  // EditorProvider and can reach the editor's save-and-reload path.

  /* ── Open an OS-provided file ──────────────────────────────────────────── */
  const openFromOs = ctrl.openFromOs;
  const loadSource = useCallback((file: OpenedFile) => openFromOs(file), [openFromOs]);

  // Each latched intent is handled once, whatever the answer: Cancel keeps the
  // current document, and the same intent must not ask again on the next render
  // (`requestReplace` changes identity as nothing else here does, but `dirty`
  // flipping re-runs this effect).
  const handledSource = useRef<OpenedFile | null>(null);
  const latestSource = useRef<OpenedFile | null>(null);
  useEffect(() => {
    latestSource.current = source;
    if (!source || handledSource.current === source) return;
    handledSource.current = source;
    requestReplace(() => loadSource(source));
  }, [source, requestReplace, loadSource]);

  /* ── Manual open (OS picker + drag-drop) ───────────────────────────────── */
  // The OS's own Open dialog, browsing the CONTAINER's filesystem. It used to be
  // a native `<input type="file">`, which reads the *host* machine — the one
  // thing the OS rules out by name, because "the computer is the container"
  // and a dialog that browses the user's laptop instead of their home directory
  // is actively wrong here. The pick latches into the same store `useOpenIntent`
  // reads, so it runs the identical load path a File Manager double-click does.
  const { openFile: pickFromOs } = useFileDialog();
  const pickFile = useCallback(() => {
    void (async () => {
      const before = latestSource.current;
      const choice = await pickFromOs({ extensions: ["pdf"] });
      // Picking the file that is already latched (the open one, or one whose
      // replace was cancelled) does not change the latch, so the effect above
      // never sees it. Ask directly instead.
      if (choice && before && choice.root === before.root && choice.path === before.path) {
        requestReplace(() => loadSource(choice));
      }
    })();
  }, [pickFromOs, requestReplace, loadSource]);

  const takeFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const load: ReplaceLoad = () => ctrl.openFile(file);
      requestReplace(load);
    },
    [ctrl, requestReplace],
  );

  const onDragEnter = useCallback((e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }, []);
  const onDragOver = useCallback((e: React.DragEvent) => {
    if (Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = Array.from(e.dataTransfer.files).find((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
      takeFile(file);
    },
    [takeFile],
  );

  // Mounted from the first time it is asked for, so it can animate closed.
  const [signMounted, setSignMounted] = useState(false);
  if (signDialogOpen && !signMounted) setSignMounted(true);

  const opened = ctrl.render !== null;
  // The editing tools arrive with the engine, after the first page.
  const tools = ctrl.doc !== null;
  // An unmeasured root (a test's DOM) docks: every tool is on the page.
  const docks = root.width === 0 || root.width >= DOCK_WIDTH;
  const markup = tool !== "select" && tool !== "sign";
  const docked = docks && tools && (panel ?? markup);
  const formatOpen = docks ? docked : popover;

  const formatToggle =
    opened && !phone ? (
      <ToolToggle
        icon={PanelRight}
        label={formatOpen ? "Hide format panel" : "Show format panel"}
        pressed={formatOpen}
        disabled={!tools}
        onPressedChange={(on) => (docks ? setPanel(on) : setPopover(on))}
      />
    ) : null;
  const moreButton =
    opened && phone ? (
      <Button
        variant="ghost"
        size="sm"
        className="h-target w-target rounded-control text-on-surface hover:bg-surface-container-high focus-visible:ring-primary justify-center border-transparent p-0 focus-visible:ring-2 focus-visible:ring-inset"
        aria-label="More"
        aria-haspopup="menu"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setMore({ x: r.left, y: r.bottom });
        }}
      >
        <Ellipsis size={18} />
      </Button>
    ) : null;

  return (
    <>
      {replaceDialog}
      <div
        ref={attachRoot}
        className="bg-surface-container-low relative flex h-full min-h-0 flex-col overflow-hidden"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <TopBar onOpenClick={pickFile} formatToggle={formatToggle} more={moreButton} />

        <div className="flex min-h-0 flex-1">
          {/* 2. The forms tab appends to the side panel via `extraTabs`. */}
          {opened && !phone && ctrl.panelOpen && <SidePanel extraTabs={[FORMS_TAB]} />}

          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            {!opened ? (
              <EmptyState onOpenClick={pickFile} error={ctrl.error} loading={ctrl.loading} />
            ) : ctrl.mode === "organize" && tools ? (
              /* 3. The organize view replaces the reader here. */
              <div className="min-h-0 flex-1" data-slot="organize-view">
                <Suspense fallback={null}>
                  <OrganizeView />
                </Suspense>
              </div>
            ) : (
              <Reader />
            )}
          </main>

          {/* 1. The page's tools: the strip at rest, the panel docked or a popover when open. */}
          {opened &&
            !phone &&
            (docked ? (
              <AnnotatePanel />
            ) : (
              <ToolsStrip
                enabled={tools}
                docks={docks}
                popoverOpen={popover}
                onPopoverChange={setPopover}
                onDock={() => setPanel(true)}
              />
            ))}
        </div>

        <StatusBand />
        {opened && phone && (
          <ToolsBottomBar enabled={tools} container={rootRef} pages={<SidePanel extraTabs={[FORMS_TAB]} inSheet />} />
        )}
        {more && (
          <ContextMenu
            x={more.x}
            y={more.y}
            label="More"
            onClose={() => setMore(null)}
            items={[
              { label: "Export a copy", onSelect: () => void exportCopy(), disabled: !tools },
              { type: "separator" },
              { label: "Fit width", onSelect: () => ctrl.setFitMode("width"), checked: ctrl.fitMode === "width" },
              { label: "Fit page", onSelect: () => ctrl.setFitMode("page"), checked: ctrl.fitMode === "page" },
            ]}
          />
        )}

        {/* 4. The signature pad (Sign tool + form signature fields), loaded when first asked for. */}
        {signMounted && (
          <Suspense fallback={null}>
            <SignatureDialog />
          </Suspense>
        )}

        {dragging && (
          <div
            className="border-primary bg-surface/80 pointer-events-none absolute inset-2 z-50 grid place-items-center border-2 border-dashed backdrop-blur-sm"
            aria-hidden="true"
          >
            <div className="text-on-surface flex flex-col items-center gap-2">
              <Download size={34} strokeWidth={1.5} />
              <p className="font-ui text-body">Drop a PDF to open</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
