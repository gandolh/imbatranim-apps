---
summary: How the Docs app is built, moved in from the OS on 2026-10-22. SuperDoc and its docx normalizer, the capabilities it asks for, why several windows need data-editor-ui-surface, how find-as-you-type keeps focus in the box, and where SuperDoc paints a caret in windows that aren't focused (a known gap the owner lives with).
updated: 2026-11-02
---

# Docs

`apps/docs/` was copied from the OS's built-in at imbatranimOS `56e23b7` and
replaced it on 2026-10-28 ([status.md](status.md)). The code wins where this
page and it disagree.

## Engine

`@harbour-enterprises/superdoc` 1.46.3 and fflate, exact pins. SuperDoc's
stylesheet ships as a checked vendor stylesheet ([stylesheets.md](stylesheets.md)).
`engine/docxNormalize.ts` adds the three parts SuperDoc's exporter reads
without a guard (`word/styles.xml`, `word/_rels/document.xml.rels`,
`docProps/custom.xml`) before a file is opened: when one is missing, export
throws and SuperDoc silently saves the original bytes, losing every edit.

Capabilities are `fs`, `intents` and `notify`. Ctrl+S and Ctrl+F are window
listeners, so `shortcuts` isn't needed.

## Several windows

SuperDoc's input bridge listens on `window` in the capture phase and takes
focus from every other instance, so with three windows open typing reached
none of them (the built-in had the same bug). Since 2026-10-22 each
instance's active editor surface, header and footer sessions included, carries
`data-editor-ui-surface` (`engine/superdoc.ts`), and each window types and
saves its own file.

## Find as you type

SuperDoc's `goToSearchResult` calls `editor.view.focus()` before selecting the
match, so the find box kept only the first character, and typing after Enter
went into the document. `goToMatch` notes the focused element, calls SuperDoc
and focuses it again in the same task, so no key event runs in between; the
match is still selected and scrolled to on every key. The find bar carries
`data-editor-ui-surface` too, because SuperDoc paints the selection only while
the editor or such a surface has focus. `stepMatch` keeps the index in a ref,
outside a state updater React may run twice. SuperDoc emits `update` only on
`docChanged`, so finding leaves the document clean.

## A caret in every window

Known and lived with (the owner's call, 2026-10-28). SuperDoc 1.46.3 has no
option for it:

- `PresentationEditor#updateSelection` keeps the local caret layer while
  `document.activeElement` is inside any `[data-editor-ui-surface]` on the
  page, not just this instance's. So any repaint of a background window while
  another window's editor or a find bar has focus paints its caret.
- `#updateHeaderFooterSelection`, used while a header or footer session is
  open, paints the caret with no focus test: every window with a header
  session open shows a caret, focused or not.

Typing, the header and find all go to the focused window; only the carets
show. The one documented call that clears the layer is
`setDocumentMode('viewing')`, a whole read-only mode switch, not tried. The
other options are a CSS rule or an upstream issue.
