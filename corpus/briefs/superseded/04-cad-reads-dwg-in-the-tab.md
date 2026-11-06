> SUPERSEDED 2026-11-06, before any work: the owner keeps this in the backlog until its open questions are grilled, so it became the todo [cad-reads-dwg-in-the-tab](../../todos/cad-reads-dwg-in-the-tab.md), which holds the draft. Promoting that todo makes a new brief with a new number. Spec kept for the record.

# Brief 04 — CAD reads DWG in the tab

## Context

Since 2026-10-28, CAD opens a `.dwg` through the suite's server
([wiki/decisions.md](../../wiki/decisions.md), "DWG opens through the suite
server"):
- LibreDWG comes as WebAssembly from npm (`@mlightcad/libredwg-web` 0.8.2,
  GPL-3.0, in `server/package.json`) and converts the DWG to DXF in a child
  process per file, over the `/dwg-to-dxf` WebSocket.
- One conversion takes 260-320 MB, and the build reserves 1 GB of wasm
  memory.
- CAD asks for the server on its first DWG (brief 02,
  `system.server.request()` in `apps/cad/src/shell/useCadFile.tsx`).

The server does nothing else (`server/src/`: `convert.ts`, `converter.ts`),
yet it makes the suite a `service` descriptor. That means a cold start on
the first DWG, about 100 MB while it runs, and one of the OS's four server
slots.

The only reason was the desktop's CSP, which refused WebAssembly in the page.
This repo's CLAUDE.md lists "No WebAssembly in the apps" as an invariant for
the same reason. imbatranimOS's brief 53 allows WASM in the page, as the
second kind of app in its research on imbatranim-apps (2026-11-06,
approved by the owner the same day).

## Depends on

imbatranimOS brief 53 ("Kit apps may run WebAssembly"), built and running
in the OS the walk uses. It changes a header, not the kit, so no kit sync is
needed for it.

## Owner decisions

Approved 2026-11-06: WASM engines from npm packages may run in the apps. The
smaller calls, with the default this brief builds:

1. **The conversion runs in a worker, one per file,** ended after each file
   the way the child process is today, so a hang or the wasm memory can't
   outlive the file. Default: yes.
2. **The server goes if the tab can carry it.** If step 2's measurements show
   a phone-sized DWG converts in the tab, the descriptor goes back to
   `static`, and `server/` and its dependency on Fastify are deleted. If not,
   the server stays as the fallback for files over a size limit the
   measurement sets. Default: delete it, if the numbers allow.
3. **The invariant changes.** "No WebAssembly in the apps" becomes "WASM
   only from an npm package, pinned by the lockfile, never compiled here or
   committed", with the date and the reason. Default: yes.

## What to do

1. Run `@mlightcad/libredwg-web` in a module worker from CAD's served
   directory: its `.wasm` beside the module, the same DWG → DXF call the
   server makes, and the DXF handed to CAD's existing reader. Find the
   browser build's memory setting rather than reusing the server's 1 GB.
2. Measure with the three samples the server's tests use (R2000, R2007,
   R2018) and the largest DWG in `corpus/wiki/test-files.md`: time, peak
   memory, and whether it completes, in desktop Chrome and on an Android
   phone, or Chrome's Android emulation with a memory note if no phone is at
   hand. Record the numbers.
3. Apply decision 2:
   - either the descriptor template goes back to `static`, `server/` is
     removed, and CAD stops calling `system.server`;
   - or CAD converts in the tab under the limit and asks the server above
     it.
4. Update THIRD-PARTY-NOTICES.md: LibreDWG's wasm is now sent to the browser,
   so its GPL-3.0 notice and source link go with the served build.
5. Make decision 3's changes in CLAUDE.md and `wiki/decisions.md`; update
   `wiki/cad.md`, status and log. imbatranimOS's catalog pin moves in an OS
   commit after this one is pushed. That is the owner's order: this repo
   first, then the OS.

## Files you OWN

- `apps/cad/src/shell/` (DWG opening), a new worker beside it,
  `packages/shared/src/build/` if the build must copy `.wasm` files
- `server/` (deleted, or kept per decision 2), `os/descriptor.template.json`
- `THIRD-PARTY-NOTICES.md`, `corpus/`

## Files you must NOT touch

- CAD's DXF reader and its drawing code.
- The other four apps.

## Acceptance

- The three samples open in CAD with every entity, layer and block, as they
  do through the server today.
- Step 2's numbers are in the outcome.
- Tests and lint green; the build passes `npm run build:os`.
- **Owner check** after the pushes and a deploy: a DWG opens in CAD on the
  phone.
