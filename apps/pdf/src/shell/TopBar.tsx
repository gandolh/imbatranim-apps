/**
 * The app bar and the status band. The bar holds the side panel's toggle,
 * Open PDF, Save, Export a copy, the search field and the format panel's
 * toggle; the window's title band names the file. The status band at the
 * foot holds the page, the true zoom and both fit modes. Previous/next page
 * and the 25% zoom steps come from PDF Viewer.
 *
 * Paging and zoom work from the first page on; search and Save wait for the
 * engine, which loads right after it.
 */
import { useRef, useState } from "react";
import type { JSX, ReactNode } from "react";
import {
  FolderOpen,
  Download,
  Save as SaveIcon,
  Search,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Maximize,
  PanelLeft,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, RadioGroup, Tooltip, useSaveHotkey, useTopWindowKeydown } from "@imbatranim/ui";
import { useReader } from "../app/context";
import { ACTUAL } from "../app/useReaderController";
import type { FitMode } from "../app/types";
import { useEditor } from "../editor/context";
import { ToolButton, ToolRadio, ToolToggle } from "./ToolButton";

export interface TopBarProps {
  onOpenClick: () => void;
  /** The format panel's toggle, at the bar's right end on a desktop. */
  formatToggle?: ReactNode;
  /** The phone's More menu, at the bar's right end. */
  more?: ReactNode;
}

/** The labelled bar buttons (Save): 32 px, 44 on a phone, quiet until hovered. */
const LABELLED =
  "h-[32px] max-[600px]:h-target gap-[8px] px-[12px] rounded-control border-transparent text-control font-semibold text-on-surface hover:border-transparent hover:bg-surface-container-high active:bg-surface-container-highest focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset";

export function TopBar({ onOpenClick, formatToggle, more }: TopBarProps): JSX.Element {
  const { render, doc, panelOpen, togglePanel, dirty, search, runSearch, clearSearch, nextHit, prevHit } = useReader();
  const { saveToDisk, exportCopy, busy } = useEditor();
  const opened = render !== null;

  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync local input state from props during render (the React-endorsed
  // "adjust state on prop change" pattern) rather than in an effect: the page
  // box follows external navigation, and the search box clears when the
  // controller's query is reset.
  const [syncedQuery, setSyncedQuery] = useState(search.query);
  if (search.query !== syncedQuery) {
    setSyncedQuery(search.query);
    if (!search.query) setQuery("");
  }

  // Ctrl/Cmd+S writes the document back to its file (the save spine), and
  // Ctrl/Cmd+F focuses search — both scoped to the TOP window via the SDK
  // seams, so a background PDF window never fires them and they never steal
  // the keystroke from another app. Registered here (inside EditorProvider) so
  // Save can reach the editor's write-back-and-reload path. `ignoreTextEntry:
  // false` on Find so it still works while a field (the search box itself, the
  // page jump) is focused.
  useSaveHotkey(() => void saveToDisk());
  useTopWindowKeydown(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f" && doc) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    },
    { ignoreTextEntry: false },
  );

  const hasHits = search.hits.length > 0;

  return (
    <header
      role="toolbar"
      aria-label="File"
      className="border-outline-variant bg-surface-container-low h-appbar max-[600px]:h-appbar-phone flex shrink-0 items-center gap-[4px] border-b px-[4px]"
    >
      <div className="contents max-[600px]:hidden">
        <ToolToggle
          icon={PanelLeft}
          label={panelOpen ? "Hide side panel" : "Show side panel"}
          pressed={panelOpen}
          onPressedChange={() => togglePanel()}
          disabled={!opened}
        />
      </div>
      <ToolButton icon={FolderOpen} label="Open PDF" onClick={onOpenClick} />
      <Tooltip content="Save (Ctrl+S), write changes back to the file">
        <Button
          variant="ghost"
          size="sm"
          className={LABELLED}
          onClick={() => void saveToDisk()}
          disabled={!doc || busy || !dirty}
        >
          <SaveIcon size={16} />
          Save
        </Button>
      </Tooltip>
      {/* On a phone Export a copy sits in More. */}
      <Tooltip content="Export a copy (download)">
        <Button
          variant="ghost"
          size="sm"
          className={`${LABELLED} w-[32px] justify-center px-0 max-[600px]:hidden`}
          onClick={() => void exportCopy()}
          disabled={!doc}
          aria-label="Export a copy"
        >
          <Download size={16} />
        </Button>
      </Tooltip>

      <div className="min-w-0 flex-1" />

      {/* Search: a field on a desktop; on a phone an icon that opens into the field while focused. */}
      <div
        className={
          "border-outline bg-surface-container-lowest rounded-control focus-within:ring-primary flex h-[32px] w-[220px] min-w-0 shrink items-center gap-[6px] border px-[8px] focus-within:ring-2 " +
          "max-[600px]:h-target max-[600px]:w-target max-[600px]:focus-within:border-outline max-[600px]:focus-within:bg-surface-container-lowest max-[600px]:border-transparent max-[600px]:bg-transparent max-[600px]:px-[13px] max-[600px]:focus-within:w-auto max-[600px]:focus-within:flex-1"
        }
        onClick={() => searchRef.current?.focus()}
      >
        <Search size={16} className="text-on-surface-variant shrink-0" />
        <input
          ref={searchRef}
          className="text-on-surface placeholder:text-on-surface-variant font-ui text-control min-w-0 flex-1 bg-transparent outline-none"
          type="search"
          placeholder="Search document…"
          aria-label="Search document"
          value={query}
          disabled={!doc}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void runSearch(query);
            if (e.key === "Escape") {
              setQuery("");
              clearSearch();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        {search.busy && <span className="text-on-surface-variant text-label">…</span>}
        {!search.busy && search.ran && (
          <span className="text-on-surface-variant text-label tabular-nums">
            {hasHits ? `${search.activeIndex + 1}/${search.hits.length}` : "0"}
          </span>
        )}
        {hasHits && (
          <span className="flex items-center">
            <ToolButton icon={ChevronUp} label="Previous match" onClick={prevHit} />
            <ToolButton icon={ChevronDown} label="Next match" onClick={nextHit} />
          </span>
        )}
      </div>
      {formatToggle}
      {more}
    </header>
  );
}

/** The status band at the foot: the page, the true zoom and both fit modes. */
export function StatusBand(): JSX.Element {
  const { render, currentPage, pageCount, goToPage, scale, fitMode, zoomIn, zoomOut, setFitMode } = useReader();
  const opened = render !== null;
  const [pageInput, setPageInput] = useState(() => String(currentPage));
  // The page box follows navigation (the React-endorsed "adjust state on prop change" pattern).
  const [syncedPage, setSyncedPage] = useState(currentPage);
  if (currentPage !== syncedPage) {
    setSyncedPage(currentPage);
    setPageInput(String(currentPage));
  }
  const pct = Math.round((scale / ACTUAL) * 100);
  if (!opened) return <></>;
  return (
    <div
      role="toolbar"
      aria-label="Page and view"
      className="border-outline-variant bg-surface-container h-statusbar max-[600px]:h-statusbar-phone font-ui text-control text-on-surface flex shrink-0 items-center gap-[2px] border-t px-[8px]"
    >
      <ToolButton
        icon={ChevronLeft}
        label="Previous page"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      />
      <span className="flex items-center gap-[6px] px-[4px] whitespace-nowrap tabular-nums">
        <span className="max-[600px]:hidden">Page</span>
        <input
          className="border-outline bg-surface-container-lowest text-on-surface rounded-control focus-visible:ring-primary h-[24px] w-[40px] border px-[4px] text-center outline-none focus-visible:ring-2 max-[600px]:h-[36px] max-[600px]:w-[44px]"
          value={pageInput}
          inputMode="numeric"
          onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const n = parseInt(pageInput, 10);
              if (Number.isFinite(n)) goToPage(n);
              (e.target as HTMLInputElement).blur();
            }
          }}
          onFocus={(e) => e.target.select()}
          aria-label="Go to page"
        />
        <span>of {pageCount}</span>
      </span>
      <ToolButton
        icon={ChevronRight}
        label="Next page"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= pageCount}
      />
      <div className="min-w-0 flex-1" />
      <ToolButton icon={ZoomOut} label="Zoom out (−)" onClick={zoomOut} />
      <span className="min-w-[44px] text-center tabular-nums" aria-live="polite">
        {pct}%
      </span>
      <ToolButton icon={ZoomIn} label="Zoom in (+)" onClick={zoomIn} />
      <div className="contents max-[600px]:hidden">
        <div aria-hidden className="bg-outline-variant mx-[4px] h-[20px] w-px" />
        <RadioGroup<FitMode> className="contents" aria-label="Fit" value={fitMode} onValueChange={setFitMode}>
          <ToolRadio icon={MoveHorizontal} label="Fit width" value="width" checked={fitMode === "width"} />
          <ToolRadio icon={Maximize} label="Fit page" value="page" checked={fitMode === "page"} />
        </RadioGroup>
      </div>
    </div>
  );
}
