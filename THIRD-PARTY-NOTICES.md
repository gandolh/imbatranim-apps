# Third-party notices

imbatranim-apps is licensed under the AGPL-3.0-only (see [LICENSE](LICENSE)).
Code translated or copied into this repository from another project keeps that
project's copyright and licence notice here: one section per source, naming the
project, its licence, the files here that carry its code, and the notice text.
The ArtCraft crafts are the usual source (see
[corpus/wiki/craft-reference.md](corpus/wiki/craft-reference.md)); their names
and logos are never used.

Dependencies installed from npm carry their own licences in `node_modules` and
are not listed here. The kit snapshot in `vendor/imbatranim-ui` is imbatranimOS
code under the same AGPL-3.0-only licence.

No code has been translated from another project yet; the sections below are
for test data, and for the one dependency whose licence differs from ours.

## LibreDWG, as WebAssembly (the suite server's DWG reader)

- What: [`@mlightcad/libredwg-web`](https://github.com/mlightcad/libredwg-web)
  0.8.2, installed from npm by `server/package.json`, is
  [LibreDWG](https://www.gnu.org/software/libredwg/) compiled to WebAssembly
  with a JavaScript wrapper. The DXF it writes names its LibreDWG build in a
  `999` comment (`0.14.8608.68_25bfb_dirty` in 0.8.2).
- Licences: LibreDWG is GPL-3.0-or-later; the npm package says GPL-3.0. Both
  combine with this repository's AGPL-3.0-only under section 13 of the GPLv3
  and the AGPLv3. Their source is at the links above; nothing of either is
  copied into this repository.
- Where it runs: only in `server/` (Node), one child process per conversion
  (`server/src/features/dwg/converter.ts`). It is never bundled into an app: it is not
  in the build, and `npm run build:os` emits no `.wasm` but pdf.js's three
  decoders (a test checks).

## pdf.js's image decoders, as WebAssembly (PDF)

- What: `pdfjs-dist` 6.4.299 (Apache-2.0), installed from npm and pinned by the
  lockfile, carries three WebAssembly decoders that PDF ships under
  `pdfjs-wasm/` in the build, unchanged: `openjpeg.wasm` (JPEG2000, from
  OpenJPEG), `jbig2.wasm` (JBIG2, from PDFium's decoder) and `qcms_bg.wasm`
  (colour management, from Mozilla's qcms, with code from Little CMS).
- Licences: OpenJPEG is BSD-2-Clause (Universite catholique de Louvain and
  others), the JBIG2 decoder is BSD-3-Clause (The PDFium Authors), qcms is MIT.
  pdf.js's wrappers around them are Apache-2.0 (the `LICENSE_PDFJS_*` files).
  The build copies each licence file next to its decoder, under
  `pdfjs-wasm/`; their text is the package's own, in `node_modules/pdfjs-dist/wasm/`.
- Not shipped: `quickjs-eval.wasm`, which runs a PDF's own scripts, and the
  decoders' JavaScript fallbacks.
- Where it runs: in the browser, in pdf.js's worker. Nothing is compiled here.

## CADCraft: a sample drawing (CAD test fixture)

- Source: <https://github.com/storytold/cadcraft>, `examples/apartment.dxf` at
  commit `896a390b4272e89bd5de416f3afaf44292670fd4`, unchanged (sha256
  `0d3bc019a4cc69f5338845a85f033f15964d5694eba0db35cfa94cbd15e732e3`). Its
  `ATTRIBUTION.md` lists it as an original sample drawing by the CADCraft
  contributors, MIT OR Apache-2.0.
- Here: `apps/cad/fixtures/apartment.dxf`, used by CAD's tests only. No CADCraft
  code was translated for CAD; its documents were read for behaviour.
- Taken under the MIT License:

```
MIT License

Copyright (c) 2026 ArtCraft Team and the CADCraft contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## python-pptx (default template, in test decks)

The three test decks in `apps/slides/src/engine/__fixtures__/` (`anim.pptx`,
`theme.pptx`, and `notes.pptx`, the last copied from imbatranimOS's built-in
Slides tests) were generated with python-pptx. Their slide master, layouts and
theme come from the default template python-pptx ships; the slides, text,
notes and animations were written for the tests. They are test data only and
are not part of the built app.

python-pptx, https://github.com/scanny/python-pptx, MIT licence:

```
The MIT License (MIT)
Copyright (c) 2013 Steve Canny, https://github.com/scanny

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
