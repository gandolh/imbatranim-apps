/**
 * CAD's file spine, the way the OS's built-in editors do it, in one place so
 * it can be shared with the other office apps later:
 *
 * - the window's file comes from `useOpenIntent` (File Manager, recents, Open)
 * - it is read with `readWithVersion`; the version goes back with a save
 *   (`saveOverRead`), so a file changed on disk since asks first
 *   (`useFileConflict`: Overwrite, Reload from disk, Cancel)
 * - Save as goes through the OS's save dialog, opened in the drawing's folder,
 *   and the window then edits the new file
 * - Ctrl+S saves the top window (`useSaveHotkey`); the title carries the
 *   dirty mark and closing asks Save / Don't Save / Cancel (`useUnsavedGuard`)
 * - a `.dwg` is converted to DXF by the suite's server (./dwg.ts) and is
 *   never written: Save offers the `.dxf` of the same name in its folder,
 *   through the save dialog, and the window then edits that file
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  fileName,
  reportFileFailure,
  reportFileRefusal,
  saveOverRead,
  useConfirm,
  useFileConflict,
  useFileDialog,
  useOpenIntent,
  useSaveHotkey,
  useSystem,
  useUnsavedGuard,
} from '@imbatranim/ui'
import { folderOf } from '@imbatranim-office/shared'
import { dwgRelease, dwgVersion } from '@imbatranim-office/shared/dwg'
import { readDxf, type ReadReport } from '../engine/dxf/read'
import { refuseReason } from '../engine/dxf/tags'
import { writeDxfBytes, type WriteReport } from '../engine/dxf/write'
import { Editor } from '../engine/editor'
import { exportInWorker, exportRequest, type ExportKind } from '../engine/export/job'
import { DwgOpenError, convertDwg, dwgFailureSentence, dxfBeside, isDwgPath } from './dwg'

export type FileTarget = { root: string; path: string }

export type CadFile = {
  editor: Editor
  /** The file name shown in the title ("Drawing1.dxf" before a first save). */
  name: string
  target: FileTarget | null
  loading: boolean
  /** The suite's server is starting, for the window's first DWG. */
  startingServer: boolean
  /** A DWG is being converted by the suite's server. */
  converting: boolean
  /** Why the file could not be opened (shown in the window), or null. */
  error: string | null
  dirty: boolean
  saving: boolean
  exporting: ExportKind | null
  save(): Promise<void>
  saveAs(): Promise<void>
  open(): Promise<void>
  newDrawing(): Promise<void>
  exportAs(kind: ExportKind): Promise<void>
  /** Render once, anywhere: the unsaved-changes, conflict and confirm dialogs. */
  dialogs: ReactNode
}

const UNTITLED = 'Drawing1.dxf'

const KIND_WORDS: Record<string, [string, string]> = {
  DIMENSION: ['dimension', 'dimensions'],
  HATCH: ['hatch', 'hatches'],
  LEADER: ['leader', 'leaders'],
  SPLINE: ['spline', 'splines'],
  ACAD_TABLE: ['table', 'tables'],
  SOLID: ['solid', 'solids'],
  MULTILEADER: ['multileader', 'multileaders'],
}

/** "7 dimensions, 5 hatches and 1 leader". */
export function describeKinds(counts: Record<string, number>): string {
  const parts = Object.entries(counts).map(([type, n]) => {
    const words = KIND_WORDS[type] ?? [type, type]
    return `${n} ${n === 1 ? words[0] : words[1]}`
  })
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

function readNote(report: ReadReport): string | null {
  if (Object.keys(report.foreign).length === 0) return null
  return `Shown as drawn, not editable here yet: ${describeKinds(report.foreign)}. They are saved back unchanged.`
}

function writeNote(report: WriteReport): string | null {
  const notes: string[] = []
  if (report.converted.ACAD_TABLE)
    notes.push(
      `${describeKinds({ ACAD_TABLE: report.converted.ACAD_TABLE })} saved as a block reference`
    )
  if (Object.keys(report.dropped).length > 0)
    notes.push(`${describeKinds(report.dropped)} could not be written`)
  return notes.length ? `${notes.join('; ')}.` : null
}

const withDxf = (path: string) => (/\.dxf$/i.test(path) ? path : `${path}.dxf`)
const stem = (name: string) => name.replace(/\.[^.]+$/, '')

/** The note a converted DWG opens with. */
function dwgNote(dwg: Uint8Array, name: string): string {
  const version = dwgVersion(dwg)
  const from = version ? ` (${dwgRelease(version)})` : ''
  return `Converted from DWG${from} by LibreDWG. CAD cannot write DWG: Save offers ${fileName(dxfBeside(name))} in the same folder and leaves ${name} unchanged.`
}

export function useCadFile(): CadFile {
  const system = useSystem()
  /**
   * The suite's server converts DWG. The window asks the desktop for it the
   * first time a DWG needs it, and only then, so a DXF never waits for it;
   * the window holds it from then until it closes.
   */
  const serverRef = useRef<string | null>(null)
  const [startingServer, setStartingServer] = useState(false)
  const launched = useOpenIntent()
  const { openFile, saveFile } = useFileDialog()
  const { ask: askConflict, dialog: conflictDialog } = useFileConflict()
  const { confirm, confirmDialog } = useConfirm()
  const [editor, setEditor] = useState(() => new Editor())
  const [target, setTarget] = useState<FileTarget | null>(null)
  const [loading, setLoading] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState<ExportKind | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  /** The document version on disk; dirty while the open document differs. */
  const [savedVersion, setSavedVersion] = useState(0)
  const [docVersion, setDocVersion] = useState(0)
  const diskVersionRef = useRef<string | null>(null)
  /** "Reload from disk" reads the file the window edits now, which Save as may have changed. */
  const reloadFromRef = useRef<FileTarget | null>(null)

  useEffect(
    () =>
      editor.subscribe((c) => {
        if (c === 'state') setDocVersion(editor.doc.version)
      }),
    [editor]
  )

  const name = target ? fileName(target.path, UNTITLED) : UNTITLED
  const dirty = docVersion !== savedVersion

  // The window's file: load it whenever File Manager hands over another one.
  useEffect(() => {
    const from = reloadFromRef.current
    reloadFromRef.current = null
    const source = from ? { root: from.root, path: from.path } : launched
    if (!source) return
    const dwg = isDwgPath(source.path)
    if (!dwg && !/\.dxf$/i.test(source.path)) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setError(
        reportFileRefusal(system, 'CAD opens .dxf and .dwg drawings.', {
          name: fileName(source.path),
        })
      )
      return
    }
    let cancelled = false
    const label = fileName(source.path)
    setLoading(true)
    setError(null)
    const read = system.fs.readWithVersion(source.root, source.path)
    /** The server's address, asked for once per window; a refusal can be retried. */
    const askServer = async (size: number): Promise<string> => {
      if (serverRef.current) return serverRef.current
      if (!system.server) throw new DwgOpenError('no-server', size)
      setStartingServer(true)
      try {
        const { ws } = await system.server.request()
        serverRef.current = ws
        return ws
      } catch (err) {
        const reason = err instanceof Error ? err.message : undefined
        throw new DwgOpenError('not-started', size, undefined, reason)
      } finally {
        setStartingServer(false)
      }
    }
    const dxf: Promise<{ data: Uint8Array; version: string | null; note: string | null }> = dwg
      ? read.then(async ({ bytes }) => {
          if (cancelled) throw new DwgOpenError('failed', bytes.byteLength)
          const ws = await askServer(bytes.byteLength)
          if (cancelled) throw new DwgOpenError('failed', bytes.byteLength)
          setConverting(true)
          let data: Uint8Array
          try {
            data = await convertDwg(ws, bytes)
          } catch (err) {
            // A server that stopped answering is asked for again next time.
            if (err instanceof DwgOpenError && err.kind === 'unreachable') serverRef.current = null
            throw err
          }
          // A DWG is never saved over, so there is no version to save against.
          return { data, version: null, note: dwgNote(new Uint8Array(bytes), label) }
        })
      : read.then(({ bytes, version }) => ({ data: new Uint8Array(bytes), version, note: null }))
    dxf.then(
      ({ data, version, note: opened }) => {
        if (cancelled) return
        setConverting(false)
        const why = dwg ? null : refuseReason(data)
        if (why) {
          setError(reportFileRefusal(system, why, { name: label }))
          setLoading(false)
          return
        }
        try {
          const { doc, report } = readDxf(data)
          const next = new Editor(doc)
          if (opened) next.message(opened)
          const note = readNote(report)
          if (note) next.message(note)
          diskVersionRef.current = version
          setEditor(next)
          setTarget({ root: source.root, path: source.path })
          setSavedVersion(doc.version)
          setDocVersion(doc.version)
          system.fs.recordRecent(source.root, source.path)
        } catch (err) {
          setError(
            reportFileFailure(system, 'open', err, { noun: 'drawing', name: fileName(source.path) })
          )
        }
        setLoading(false)
      },
      (err: unknown) => {
        if (cancelled) return
        setConverting(false)
        if (err instanceof DwgOpenError) {
          // Not a bug to log: the server is down, or the file is one it cannot read.
          const sentence = dwgFailureSentence(err, label)
          system.notify({ level: 'error', title: 'Could not open', body: sentence })
          setError(sentence)
        } else {
          setError(reportFileFailure(system, 'open', err, { noun: 'drawing', name: label }))
        }
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [system, launched, reloadKey])

  const writeTo = useCallback(
    async (to: FileTarget, expected: string | null | undefined): Promise<boolean> => {
      const versionAtSave = editor.doc.version
      const { bytes, report } = writeDxfBytes(editor.doc)
      const label = fileName(to.path)
      const result = await saveOverRead(
        system.fs,
        { ...to, name: label },
        bytes,
        expected,
        askConflict
      )
      if (result.outcome === 'cancel') return false
      if (result.outcome === 'reload') {
        reloadFromRef.current = to
        setReloadKey((k) => k + 1)
        return false
      }
      diskVersionRef.current = result.version
      setSavedVersion(versionAtSave)
      const note = writeNote(report)
      if (note)
        system.notify({ level: 'warning', title: 'Saved with changes', body: `${label}: ${note}` })
      return true
    },
    [system, editor, askConflict]
  )

  /**
   * Save as, through the OS's dialog, opened beside the drawing (a new drawing
   * opens it where it always has). CAD writes DXF only, so a drawing opened
   * from a DWG suggests the `.dxf` of the same name, in the DWG's folder, and
   * the DWG stays as it is.
   */
  const saveAs = useCallback(async () => {
    const fromDwg = target !== null && isDwgPath(target.path)
    const choice = await saveFile({
      title: fromDwg ? 'Save drawing as DXF' : 'Save drawing as',
      extensions: ['dxf'],
      suggestedName: fromDwg ? fileName(dxfBeside(target.path)) : name,
      startIn: target ? folderOf(target) : undefined,
    })
    if (!choice) return
    const to = { root: choice.root, path: withDxf(choice.path) }
    setSaving(true)
    try {
      // A new file: nothing to compare against.
      if (await writeTo(to, undefined)) {
        setTarget(to)
        if (to.path !== choice.path) system.fs.recordRecent(to.root, to.path)
      }
    } catch (err) {
      setError(reportFileFailure(system, 'save', err, { noun: 'drawing', name: fileName(to.path) }))
    } finally {
      setSaving(false)
    }
  }, [saveFile, target, name, writeTo, system])

  const save = useCallback(async () => {
    if (saving) return
    // CAD can't write DWG, so a drawing opened from one saves through Save as.
    if (!target || isDwgPath(target.path)) return saveAs()
    setSaving(true)
    try {
      await writeTo(target, diskVersionRef.current)
    } catch (err) {
      // Dirty stays: the bytes did not land, so the close guard keeps the work.
      setError(reportFileFailure(system, 'save', err, { noun: 'drawing', name }))
    } finally {
      setSaving(false)
    }
  }, [saving, target, saveAs, writeTo, system, name])

  const discardOk = useCallback(async () => {
    if (!dirty) return true
    return confirm({
      title: 'Discard changes?',
      message: `${name} has unsaved changes. They will be lost.`,
      confirmLabel: 'Discard',
      destructive: true,
    })
  }, [dirty, confirm, name])

  const open = useCallback(async () => {
    if (!(await discardOk())) return
    // A desktop from before on-demand servers can't start one to convert DWG.
    await openFile({ title: 'Open drawing', extensions: system.server ? ['dxf', 'dwg'] : ['dxf'] })
  }, [discardOk, openFile, system])

  const newDrawing = useCallback(async () => {
    if (!(await discardOk())) return
    const next = new Editor()
    setEditor(next)
    setTarget(null)
    setError(null)
    diskVersionRef.current = null
    setSavedVersion(next.doc.version)
    setDocVersion(next.doc.version)
  }, [discardOk])

  const exportAs = useCallback(
    async (kind: ExportKind) => {
      const choice = await saveFile({
        title: kind === 'svg' ? 'Export as SVG' : 'Export as PDF',
        extensions: [kind],
        suggestedName: `${stem(name)}.${kind}`,
      })
      if (!choice) return
      const path = new RegExp(`\\.${kind}$`, 'i').test(choice.path)
        ? choice.path
        : `${choice.path}.${kind}`
      setExporting(kind)
      try {
        const bytes = await exportInWorker(exportRequest(editor.doc, kind, stem(name)))
        await system.fs.upload(choice.root, path, bytes, fileName(path))
        system.notify({ level: 'success', title: 'Exported', body: fileName(path) })
      } catch (err) {
        reportFileFailure(system, 'save', err, {
          noun: kind === 'svg' ? 'SVG' : 'PDF',
          name: fileName(path),
        })
      } finally {
        setExporting(null)
      }
    },
    [saveFile, name, editor, system]
  )

  useSaveHotkey(save)
  const unsavedDialog = useUnsavedGuard(dirty, name, save)

  return {
    editor,
    name,
    target,
    loading,
    startingServer,
    converting,
    error,
    dirty,
    saving,
    exporting,
    save,
    saveAs,
    open,
    newDrawing,
    exportAs,
    dialogs: (
      <>
        {unsavedDialog}
        {conflictDialog}
        {confirmDialog}
      </>
    ),
  }
}
