import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp, FileText, FileWarning, Loader2, Save, Search, X } from "lucide-react";
import {
  Button,
  Tooltip,
  fileName,
  reportFileFailure,
  reportFileRefusal,
  saveOverRead,
  useFileConflict,
  useFileDialog,
  useOpenIntent,
  useSaveHotkey,
  useSystem,
  Toggle,
  useTopWindowKeydown,
  useUnsavedGuard,
} from "@imbatranim/ui";
import { usePhone } from "@imbatranim-office/shared";
import { createDocEngine, type DocEngine } from "./engine/superdoc";
import { normalizeDocx } from "./engine/docxNormalize";
import { unsupportedReason } from "./lib/formats";
import { shouldClearDirty } from "./lib/saveOutcome";
import { countText, htmlToText } from "./lib/wordCount";
import type { DocMatch } from "./engine/superdoc";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** The bars' controls: 32 px on a desktop, the 44 px target on a phone, with the accent ring. */
const BAR =
  "h-[32px] max-[600px]:h-target rounded-control border-transparent text-control text-on-surface hover:border-transparent hover:bg-surface-container-high active:bg-surface-container-highest focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset";
/** Pressed: the soft accent with an accent edge. */
const PRESSED =
  "data-[pressed]:border-primary data-[pressed]:bg-primary-container data-[pressed]:text-on-primary-container";

/**
 * SuperDoc's toolbar reads these custom properties (its stylesheet's own
 * names), so it takes the desktop's surfaces, ink and accent in both modes.
 * Every one it reads for the bar and its dropdowns is set, so no default
 * white or grey is left beside a dark one.
 */
const SUPERDOC_TOOLBAR = {
  "--sd-ui-font-family": "var(--k-font-ui)",
  "--sd-ui-bg": "var(--k-surface-container-low)",
  "--sd-ui-toolbar-bg": "var(--k-surface-container-low)",
  "--sd-ui-text": "var(--k-on-surface)",
  "--sd-ui-text-muted": "var(--k-on-surface-variant)",
  "--sd-ui-text-disabled": "var(--k-outline)",
  "--sd-ui-border": "var(--k-outline-variant)",
  "--sd-ui-toolbar-button-text": "var(--k-on-surface)",
  "--sd-ui-toolbar-button-hover-bg": "var(--k-surface-container-high)",
  "--sd-ui-toolbar-button-active-bg": "var(--k-surface-container-highest)",
  "--sd-ui-active-bg": "var(--k-surface-container-highest)",
  "--sd-ui-action": "var(--accent)",
  "--sd-ui-action-hover": "var(--accent)",
  "--sd-ui-action-text": "var(--accent-on)",
  "--sd-ui-dropdown-bg": "var(--k-surface-container-lowest)",
  "--sd-ui-dropdown-text": "var(--k-on-surface)",
  "--sd-ui-dropdown-border": "var(--k-outline-variant)",
  "--sd-ui-dropdown-hover-bg": "var(--k-surface-container-high)",
  "--sd-ui-dropdown-hover-text": "var(--k-on-surface)",
  "--sd-ui-dropdown-active-bg": "var(--accent-soft)",
  "--sd-ui-dropdown-selected-text": "var(--accent-soft-on)",
} as CSSProperties;

export function Docs({ windowId }: { windowId: string }) {
  const system = useSystem();
  // One-shot open intent, drained by the shared hook (StrictMode-safe).
  const source = useOpenIntent();

  // Lets the app open a file on its own instead of dead-ending on
  // "open one from Files". The pick latches into the same store
  // useOpenIntent reads, so the existing load path runs unchanged.
  const { openFile } = useFileDialog();
  const pickFile = () => void openFile({ extensions: ["docx"] });
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const toolbarWrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DocEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  // The version of the file this document was read from: a save
  // sends it, so a file changed on disk since asks instead of being overwritten.
  const diskVersionRef = useRef<string | null>(null);
  // Bumped by "Reload from disk" to run the load again on the same file.
  const [reloadKey, setReloadKey] = useState(0);
  const { ask: askConflict, dialog: conflictDialog } = useFileConflict();
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState("");
  // Matches are opaque engine tokens; kept in a ref because they are not rendered
  // and a new search replaces them wholesale.
  const matchesRef = useRef<DocMatch[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  // The 1-based index stepMatch moves from. A ref beside the state, because
  // going to a match is a side effect, and a state updater may run twice.
  const matchIndexRef = useRef(0);
  const [counts, setCounts] = useState({ words: 0, characters: 0, charactersNoSpaces: 0 });
  const phone = usePhone();
  const [zoom, setZoom] = useState(100);

  const docName = source ? fileName(source.path, "document.docx") : "";
  // Refuse what the engine cannot read, before it is asked to try. Computed from
  // the path alone, so it is known before a single byte is fetched.
  const refusal = source ? unsupportedReason(source.path) : null;

  // Say so once, in the notification centre as well as in the window — the same
  // reason every other failure here does. `notify` writes to an external store
  // rather than this component's state, which is what an effect is for.
  useEffect(() => {
    if (!refusal || !source) return;
    reportFileRefusal(system, refusal, { name: docName });
  }, [system, refusal, source, docName]);

  // Boot SuperDoc and load the docx. Each run mounts into FRESH host nodes
  // (not the persistent wrappers) so React StrictMode's mount→cleanup→mount and
  // any future remount never leave two SuperDoc instances fighting over the same
  // DOM — the discarded instance's nodes are removed whole on cleanup, and the
  // surviving instance owns its own untouched nodes (so export reads live edits).
  useEffect(() => {
    if (!source || refusal) return;
    const editorWrap = editorWrapRef.current;
    const toolbarWrap = toolbarWrapRef.current;
    if (!editorWrap || !toolbarWrap) return;

    const editorHost = document.createElement("div");
    editorHost.style.minHeight = "100%";
    editorWrap.appendChild(editorHost);

    const toolbarHost = document.createElement("div");
    const toolbarId = `docs-toolbar-${windowId}-${Math.random().toString(36).slice(2)}`;
    toolbarHost.id = toolbarId;
    toolbarWrap.appendChild(toolbarHost);

    let cancelled = false;
    let engine: DocEngine | null = null;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const { bytes, version } = await system.fs.readWithVersion(source.root, source.path);
        if (cancelled) return;
        diskVersionRef.current = version;
        // Guarantee the parts SuperDoc's exporter needs, so Save actually
        // re-serializes edits instead of silently re-emitting the original.
        const normalized = await normalizeDocx(bytes);
        if (cancelled) return;
        if (!normalized.readable) {
          // Not a zip at all — a renamed file, or a truncated download. Refuse
          // it here rather than letting the engine fail like a broken app.
          setError(
            reportFileRefusal(system, "This file is not a readable .docx package.", {
              name: docName,
            }),
          );
          setLoading(false);
          return;
        }
        if (normalized.repaired.length > 0) {
          // Worth knowing when a save is investigated later, not worth a toast:
          // the repair is exactly what makes the save correct.
          // eslint-disable-next-line no-console -- the only trace of a repair, kept out of the user's way on purpose
          console.info("[docs] repaired missing docx parts", normalized.repaired);
        }
        const file = new File([normalized.bytes as BlobPart], docName, {
          type: DOCX_MIME,
        });
        engine = await createDocEngine({
          editor: editorHost,
          toolbar: `#${toolbarId}`,
          file,
          onReady: () => {
            if (cancelled) return;
            setLoading(false);
            setDirty(false);
            // Count once the document is actually loaded. Doing it when the
            // engine object is constructed is too early — `getHTML()` has
            // nothing to give yet, and the toolbar read "0 words" over a
            // document with nineteen, which is worse than no counter at all.
            const ready = engineRef.current;
            if (ready) setCounts(countText(htmlToText(ready.html())));
          },
          onEdit: () => {
            if (!cancelled) setDirty(true);
          },
          fitWidth: window.matchMedia?.("(max-width: 600px)").matches ?? false,
          onZoom: setZoom,
          onError: (err) => {
            if (!cancelled) {
              setError(reportFileFailure(system, "open", err, { noun: "document", name: docName }));
              setLoading(false);
            }
          },
        });
        if (cancelled) {
          engine.destroy();
          return;
        }
        engineRef.current = engine;
      } catch (err) {
        if (!cancelled) {
          setError(reportFileFailure(system, "open", err, { noun: "document", name: docName }));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      engineRef.current = null;
      engine?.destroy();
      editorHost.remove();
      toolbarHost.remove();
    };
  }, [system, source, refusal, windowId, docName, reloadKey]);

  // ── Word count ──────────────────────────────────────────────────────────────
  // Recomputed on demand rather than on every keystroke: reading the whole
  // document's HTML is cheap but not free, and a live counter that re-serializes
  // the document per character typed is the kind of thing that makes an editor
  // feel heavy for a number nobody is watching that closely.
  const refreshCounts = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setCounts(countText(htmlToText(engine.html())));
  }, []);

  // ── Find ────────────────────────────────────────────────────────────────────
  const runSearch = useCallback((text: string) => {
    const engine = engineRef.current;
    setFindText(text);
    if (!engine || text.trim() === "") {
      matchesRef.current = [];
      matchIndexRef.current = 0;
      setMatchCount(0);
      setMatchIndex(0);
      return;
    }
    const matches = engine.search(text);
    matchesRef.current = matches;
    matchIndexRef.current = matches.length > 0 ? 1 : 0;
    setMatchCount(matches.length);
    setMatchIndex(matchIndexRef.current);
    // Selects the first match and scrolls to it; the engine keeps focus in
    // this box, so the next key typed lands here, not in the document.
    if (matches.length > 0) engine.goToMatch(matches[0]);
  }, []);

  const stepMatch = useCallback((direction: 1 | -1) => {
    const engine = engineRef.current;
    const matches = matchesRef.current;
    if (!engine || matches.length === 0) return;
    // 1-based, wrapping — a find bar that stops at the last hit makes the user
    // retype the query to go round again.
    const next = ((matchIndexRef.current - 1 + direction + matches.length) % matches.length) + 1;
    matchIndexRef.current = next;
    engine.goToMatch(matches[next - 1]);
    setMatchIndex(next);
  }, []);

  const openFind = useCallback(() => {
    setFindOpen(true);
    refreshCounts();
  }, [refreshCounts]);

  // Ctrl/Cmd+F opens the find bar. Scoped to the TOP window via the SDK seam so
  // it never fires for a background Docs window or steals the keystroke from
  // another app; preventDefault so the browser's own find does not take it — the
  // OS's find is the one that can reach inside the editor's document model.
  // `ignoreTextEntry: false` because the document surface is contentEditable, so
  // the user is always "typing" — dropping the key there would kill the shortcut.
  useTopWindowKeydown(
    (e) => {
      if (!source || refusal) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openFind();
      }
    },
    { ignoreTextEntry: false },
  );

  const handleSave = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || !source || saving) return;
    // Record the edit counter before exporting. If the user edits while the
    // export+upload is in flight the counter advances, so we must NOT clear
    // dirty on resolve — those edits aren't in the bytes we uploaded.
    const savedAtEditCount = engine.editCount();
    setSaving(true);
    setError(null);
    try {
      const bytes = await engine.exportDocx();
      const result = await saveOverRead(
        system.fs,
        { root: source.root, path: source.path, name: docName },
        bytes,
        diskVersionRef.current,
        askConflict,
      );
      // Cancel writes nothing and leaves `dirty` armed. Reload discards these
      // edits and reads the disk copy again; SuperDoc can't undo a reload.
      if (result.outcome === "cancel") return;
      if (result.outcome === "reload") {
        setReloadKey((k) => k + 1);
        return;
      }
      diskVersionRef.current = result.version;
      if (
        shouldClearDirty({
          uploaded: true,
          editCountBefore: savedAtEditCount,
          editCountAfter: engine.editCount(),
        })
      ) {
        setDirty(false);
      }
    } catch (err) {
      // `dirty` is deliberately untouched: the bytes did not land, so the
      // document still differs from disk and the close guard must stay armed.
      setError(reportFileFailure(system, "save", err, { noun: "document", name: docName }));
    } finally {
      setSaving(false);
    }
  }, [system, source, saving, docName, askConflict]);

  // Ctrl/Cmd+S saves — but only for the top-most window.
  useSaveHotkey(handleSave);

  // Reflect filename + dirty marker in the window title; closing with unsaved
  // changes asks Save / Don't Save / Cancel through the themed dialog.
  const unsavedDialog = useUnsavedGuard(dirty, docName, handleSave);

  if (source && refusal) {
    return (
      <div className="bg-surface-container-low text-on-surface-variant flex h-full flex-col items-center justify-center gap-[8px] p-[24px] text-center">
        <FileWarning size={40} strokeWidth={1} className="text-error" />
        <span className="font-ui text-on-surface text-control font-semibold">{docName}</span>
        <span className="font-ui text-control max-w-[320px]">{refusal}</span>
        <Button
          size="sm"
          variant="primary"
          className="text-control h-[32px] gap-[8px] px-[12px] font-semibold"
          onClick={pickFile}
        >
          Open a .docx instead
        </Button>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="bg-surface-container-low text-on-surface-variant flex h-full flex-col items-center justify-center gap-[8px] p-[24px] text-center">
        <FileText size={40} strokeWidth={1} />
        <h3 className="font-display text-headline text-on-surface m-0 font-bold">Nothing open</h3>
        <Button
          size="sm"
          variant="primary"
          className="text-control h-[32px] gap-[8px] px-[12px] font-semibold"
          onClick={pickFile}
        >
          Open a document
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low flex h-full flex-col">
      {/* The app bar: Save and Find. The title band names the file. */}
      <div
        role="toolbar"
        aria-label="File"
        className="border-outline-variant bg-surface-container-low h-appbar max-[600px]:h-appbar-phone flex shrink-0 items-center gap-[4px] border-b px-[4px]"
      >
        <Tooltip content="Save (Ctrl+S)">
          <Button
            variant="ghost"
            size="sm"
            className={`${BAR} gap-[8px] px-[12px] font-semibold`}
            onClick={() => void handleSave()}
            disabled={saving || loading || !dirty}
          >
            {saving ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <Save size={16} />}
            Save
          </Button>
        </Tooltip>

        <Tooltip content="Find (Ctrl+F)">
          <Toggle
            pressed={findOpen}
            aria-label="Find in document"
            onClick={openFind}
            render={
              <Button
                variant="ghost"
                size="sm"
                className={`${BAR} max-[600px]:w-target w-[32px] justify-center p-0 ${PRESSED}`}
              />
            }
          >
            <Search size={16} />
          </Toggle>
        </Tooltip>

        <div className="min-w-0 flex-1" />

        {error && <span className="text-error font-ui text-label mr-[8px] max-w-[280px] truncate">{error}</span>}
      </div>

      {findOpen && (
        // `data-editor-ui-surface` is SuperDoc's declarative "this is editor UI":
        // its selection overlay keeps painting the selected match while focus
        // sits in this bar (it clears it once neither the editor nor such a
        // surface has focus), and its input bridge leaves the bar's keys alone.
        <div
          data-editor-ui-surface=""
          className="border-outline-variant bg-surface-container h-appbar max-[600px]:h-appbar-phone flex shrink-0 items-center gap-[4px] border-b px-[8px]"
        >
          <Search size={16} className="text-on-surface-variant shrink-0" />
          <input
            autoFocus
            value={findText}
            placeholder="Find in document"
            aria-label="Find in document"
            onChange={(e) => runSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") stepMatch(e.shiftKey ? -1 : 1);
              if (e.key === "Escape") setFindOpen(false);
            }}
            className="border-outline bg-surface-container-lowest font-ui text-on-surface text-control rounded-control focus-visible:ring-primary max-[600px]:h-target h-[32px] w-[220px] min-w-0 border px-[8px] outline-none focus-visible:ring-2 max-[600px]:flex-1"
          />
          <span className="font-ui text-on-surface-variant text-label min-w-[64px] tabular-nums">
            {findText.trim() === "" ? "" : matchCount === 0 ? "No matches" : `${matchIndex} of ${matchCount}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`${BAR} max-[600px]:w-target w-[32px] justify-center p-0`}
            aria-label="Previous match"
            disabled={matchCount === 0}
            onClick={() => stepMatch(-1)}
          >
            <ChevronUp size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${BAR} max-[600px]:w-target w-[32px] justify-center p-0`}
            aria-label="Next match"
            disabled={matchCount === 0}
            onClick={() => stepMatch(1)}
          >
            <ChevronDown size={16} />
          </Button>
          <div className="flex-1" />
          <span className="font-ui text-on-surface-variant text-label tabular-nums max-[600px]:hidden">
            {counts.words} words · {counts.charactersNoSpaces} characters
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`${BAR} max-[600px]:w-target w-[32px] justify-center p-0`}
            aria-label="Close find"
            onClick={() => setFindOpen(false)}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* SuperDoc's own formatting toolbar mounts into a fresh child here. */}
      {/* SuperDoc reads its toolbar's colours from its own --sd-ui-* properties, so the desktop's tokens reach it. */}
      <div
        ref={toolbarWrapRef}
        style={SUPERDOC_TOOLBAR}
        className="border-outline-variant bg-surface-container-low shrink-0 border-b"
      />

      {/* Document surface — SuperDoc mounts into a fresh child of this wrapper: a true sheet, centred on the desk. */}
      <div className="bg-desk relative min-h-0 flex-1 overflow-auto pt-[12px]">
        <div ref={editorWrapRef} className="min-h-full [&_.superdoc\_\_layers]:mx-auto" />
        {loading && (
          <div className="bg-desk text-on-surface-variant font-ui text-control absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 size={16} className="motion-safe:animate-spin" />
            Loading document…
          </div>
        )}
      </div>

      {/* The status band: the word count, and on a phone the page's true scale. */}
      <div
        role="status"
        className="border-outline-variant bg-surface-container h-statusbar max-[600px]:h-statusbar-phone flex shrink-0 items-center gap-[8px] border-t px-[8px]"
      >
        <Tooltip content="Word count">
          <button
            type="button"
            onClick={refreshCounts}
            className="font-ui text-on-surface text-control hover:bg-surface-container-high rounded-item focus-visible:ring-primary max-[600px]:h-target h-[28px] px-[8px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            {counts.words} words
          </button>
        </Tooltip>
        <div className="min-w-0 flex-1" />
        {phone && (
          <span className="font-ui text-on-surface text-control px-[8px] tabular-nums">{Math.round(zoom)}%</span>
        )}
      </div>

      {unsavedDialog}

      {conflictDialog}
    </div>
  );
}
