# Getting started

How to build and check the suite, and how to see it running inside imbatranimOS. The [main README](../README.md) has the short version.

## Prerequisites

- Node 24.14.1 or later and npm 11.11 or later, as `package.json` asks.
- For the apps in a window: an imbatranimOS checkout you can run, in its dev container or its production image.

## Build and check

```bash
npm ci
npm test             # vitest: the apps, packages/shared and the server
npm run typecheck    # tsc -b across every workspace
npm run lint
npm run build:os     # writes dist/os: one folder per app, shared chunks and workers
npm run build:os --workspace=games   # writes games/dist/os, the Games group
npm run build:os --workspace=accessories   # writes accessories/dist/os, the Accessories group
```

`npm run build:os` is the exact build the OS's Marketplace runs for Office after `npm ci`. Its test, `packages/shared/src/build/osBuild.test.ts`, checks the output against `os/descriptor.template.json`. Every other group is a workspace folder the Marketplace installs with `npm ci --workspace=<group>` and builds with `npm run build:os --workspace=<group>`; `packages/shared/src/build/groups.test.ts` checks each against its `<group>/os/descriptor.template.json`.

There is no dev server. The apps import React and `@imbatranim/ui` as externals that only the desktop provides, so they render only inside an OS window.

## See the apps in the OS

Install the suite into a local imbatranimOS from a commit of your checkout. The steps, for the dev container and for the production image, are in [os/README.md](../os/README.md#installing-from-a-local-checkout). After installing Office the OS lists Docs, Sheets, Slides, PDF and CAD in Start, and opens matching files from File Manager in them. After installing Games it lists Minesweeper and Solitaire, and after installing Accessories, Todo and Bookmarks.

## The UI kit snapshot

`vendor/imbatranim-ui/` is a copy of the desktop's kit at a known OS commit, so the apps typecheck against the same components the desktop lends them. `npm run kit:sync -- <os-checkout> <commit>` copies the kit from that OS commit and moves the shared-module pins in `package.json` to what the OS's lockfile resolves there. `--check` only reports a difference. More in the wiki's [architecture page](../corpus/wiki/architecture.md).

## Common problems

- `SELF_SIGNED_CERT_IN_CHAIN` during an OS install behind a TLS-inspecting proxy: the Marketplace build passes only `PATH`, `LANG`, `LC_ALL` and `TZ` to npm, so put `cafile=` in the global `npmrc` of the Node that runs it, under `<node prefix>/etc/npmrc`.
