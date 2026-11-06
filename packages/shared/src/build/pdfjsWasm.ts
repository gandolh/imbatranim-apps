/**
 * pdf.js's WebAssembly decoders, served beside the build.
 *
 * pdf.js reads its decoders from a directory (`getDocument({ wasmUrl })`, then
 * `<wasmUrl>openjpeg.wasm`), so their names cannot carry a content hash and a
 * plain `new URL(..., import.meta.url)` asset would not do. A module that
 * imports `virtual:pdfjs-wasm-dir` gets that directory's URL:
 *
 *   build      the three decoders and their licences are emitted under
 *              `pdfjs-wasm/`, and the URL is relative to the importing chunk;
 *   tests      a path into the installed package (pdf.js in Node reads a path,
 *              not a URL);
 *   dev server a `/@fs/` URL.
 *
 * Only the decoders for JPEG2000, JBIG2 and colour management ship. The
 * package's `quickjs-eval.wasm` runs a PDF's own scripts and stays out, and
 * so do its JavaScript fallbacks: the desktop allows WebAssembly.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'

export const PDFJS_WASM_MODULE = 'virtual:pdfjs-wasm-dir'
/** The directory under the build's output that holds them. */
export const PDFJS_WASM_OUT_DIR = 'pdfjs-wasm'
/** What ships: the decoders and the licence files that go with each. */
export const PDFJS_WASM_FILES = [
  'openjpeg.wasm',
  'jbig2.wasm',
  'qcms_bg.wasm',
  'LICENSE_OPENJPEG',
  'LICENSE_PDFJS_OPENJPEG',
  'LICENSE_JBIG2',
  'LICENSE_PDFJS_JBIG2',
  'LICENSE_QCMS',
  'LICENSE_PDFJS_QCMS',
] as const

const RESOLVED = `\0${PDFJS_WASM_MODULE}`

/** The installed package's `wasm/` directory, found from `root`. */
export function pdfjsWasmSourceDir(root: string): string {
  const require = createRequire(join(root, 'package.json'))
  return join(dirname(require.resolve('pdfjs-dist/package.json')), 'wasm')
}

export function pdfjsWasm(options: { root: string }): Plugin {
  const sourceDir = () => pdfjsWasmSourceDir(options.root)
  let building = false
  return {
    name: 'imbatranim-apps:pdfjs-wasm',
    configResolved(config) {
      building = config.command === 'build'
    },
    resolveId(id) {
      return id === PDFJS_WASM_MODULE ? RESOLVED : undefined
    },
    load(id, loadOptions) {
      if (id !== RESOLVED) return undefined
      const dir = sourceDir()
      if (!building) {
        const url = loadOptions?.ssr ? dir + '/' : `/@fs/${dir.replace(/^\/+/, '')}/`
        return `export default ${JSON.stringify(url)}`
      }
      const refs = PDFJS_WASM_FILES.map((name) =>
        this.emitFile({
          type: 'asset',
          fileName: `${PDFJS_WASM_OUT_DIR}/${name}`,
          source: readFileSync(join(dir, name)),
        })
      )
      return `export default new URL('.', import.meta.ROLLUP_FILE_URL_${refs[0]}).href`
    },
  }
}
