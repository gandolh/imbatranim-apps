# Brief 02 — CAD asks for its server on its first DWG

## Context

Found while building DWG opening (2026-10-28). imbatranimOS started a
descriptor's server for every window of it, so when CAD's DWG server made
the suite a `service`, every Office window paid a cold start of 1.7-3.9 s
and failed with "Sheets stopped working" when the server couldn't start. On
2026-11-03 the suite went back to `static` (`os/descriptor.template.json`):
CAD opens DXF only, and its Open dialog offers `.dwg` only when its window
has a server. The server and the DWG path (`apps/cad/src/shell/dwg.ts`)
stayed in the repo.

Decided with the owner on 2026-11-03 (imbatranimOS's
`decisions-marketplace-suites.md`, "A kit app asks for its server when it
needs one"). **Depends on imbatranimOS's brief 29, "A kit app asks for its
server"**, which adds the kit call and stops the host leasing before an app
renders. Don't start this one until it is done there. Promoted from the
todo `2026-10-28-os-suite-server-for-every-window`.

## Spec

1. Sync the kit (`npm run kit:sync`) to the imbatranimOS commit with
   brief 29.
2. Make the descriptor a `service` with the DWG server again, in
   `os/descriptor.template.json`, and update `osBuild.test.ts` to match.
3. CAD asks for its server through the new kit call the first time it opens
   a `.dwg`, and only then; `useCadFile` takes the server from that call
   instead of `host.server`. DXF never asks.
4. While the server starts, CAD shows its own progress ("Starting the DWG
   converter…" or similar, in the app's words). If it fails, CAD says the
   DWG can't be opened and why, and the window stays open and usable.
5. CAD's Open dialog offers `.dwg` again.

## Must preserve

- Docs, Sheets, Slides and PDF never ask for the server: their windows open
  as fast as a static suite's.
- DXF opening and saving as today.

## Acceptance

- Tests: opening a DXF makes no server call; the first DWG makes one and a
  second reuses it; a failing server shows CAD's message and leaves the
  drawing area usable.
- `osBuild.test.ts` asserts the `service` template.
- A short walk in the OS: a Sheets window opens with no "Starting its
  server…", and CAD opens a DWG.
- Typecheck, lint and the tests of the apps changed pass.

## Files you OWN

- `vendor/imbatranim-ui/` (through `kit:sync` only)
- `os/descriptor.template.json`, `packages/shared/src/build/osBuild.test.ts`
- `apps/cad/src/shell/useCadFile.tsx`, `apps/cad/src/shell/dwg.ts`,
  `apps/cad/src/App.tsx` and CAD's tests
