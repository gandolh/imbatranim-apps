---
paths:
  - "server/src/**"
---

# The server (`server/src`)

- Read the `code-structure` skill before you add or move a route, a plugin or
  a module.
- The entry runs under Node's type stripping, with no build: relative imports
  keep their `.ts` suffix, and only erasable syntax is allowed (no `enum`, no
  parameter properties). `erasableSyntaxOnly` checks it.
- The layout: `server.ts` listens and nothing else does; `config.ts` is the
  only reader of the environment; `app.ts` registers `plugins/errors.ts` first,
  then `plugins/websocket.ts`, then each `features/<name>/` by name. A feature
  keeps its schemas and tests beside its routes and imports no other feature.
  The converter (`features/dwg/convert.ts`, `converter.ts`) imports no Fastify.
  Tests build the app through `testing/buildTestApp.ts`.
- The WebSocket route has no response schema (an exception in
  `tools/conventions.json`). A JSON route declares its response schema with the
  zod provider.
- The start command is the descriptor's (`os/descriptor.template.json`), so
  renaming `server.ts` changes it, `server/package.json`'s `main` and
  `osBuild.test.ts` together.
- It does one-off jobs (DWG conversion, PDF export, thumbnails), never a round
  trip per keystroke.
- `npm run check:conventions` runs `check-structure` over this folder, strict.
