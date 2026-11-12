---
summary: The server's structure call of 2026-11-12 (the house code structure, the start command, the zod provider, LOG_LEVEL warn, the WebSocket route without a response schema, what was rejected). The DWG call of 2026-10-28 (LibreDWG as WebAssembly in Node, a child per file, a WebSocket). Read before changing server/src.
updated: 2026-11-12
---

# Server decisions

## The server in the house code structure
_2026-11-12_ — `server/src` follows the `code-structure` skill: `server.ts` is
the only file that listens (through `close-with-grace`), `config.ts` the only
reader of the environment (`PORT`, `HOST`, `LOG_LEVEL`, parsed with zod, a bad
value stops the start and names the variable), `app.ts` registers the error
plugin, the WebSocket plugin and then the features by name. `features/health`
and `features/dwg` hold the routes; the converter and its child stay free of
Fastify. The one error handler passes Fastify's own 4xx on in Fastify's body
shape and sends a fixed `Internal Server Error` for a 5xx. The start command
is the descriptor's, so the entry became `server.ts` in the descriptor
template and the test that asserts it in the same commit. Type stripping stays
the run mode: `.ts` import suffixes, erasable syntax only.
- *Consequence*: the zod type provider types the one JSON route
  (`{ ok: true }`), at the price of five packages in the suite's `npm ci`
  (provider, `@fastify/swagger`, `openapi-types`, `json-schema-resolver`,
  `close-with-grace`); `zod` stays one copy, 4.6.7.
- *Consequence*: `LOG_LEVEL` defaults to `warn`, so the start line (now an
  `info` log) is hidden and a conversion failure or a 5xx reaches the desktop's
  capture of the output.
- *Consequence*: the WebSocket route declares no response schema (its frames
  are the protocol in `@imbatranim-office/shared/dwg`); `conventions.json`
  records it.
- *Consequence*: on stop every socket is closed with 1001 and ws gives up
  waiting after 2 s. A conversion running at that moment leaves its child to
  finish within its 60 s limit (a todo).
Rejected: a `lib/` for one feature; `@fastify/autoload`; decorators for
dependencies; `trustProxy` (nothing reads a client address and the server is
reached only through the desktop's proxy); connection and keep-alive timeouts
(the server is local and its sockets are WebSockets, which leave Node's HTTP
timeouts once upgraded; a test holds one open past a lowered `requestTimeout`);
a rate-limited 404 (local).

## DWG opens through the suite server: LibreDWG as WebAssembly, in Node
_2026-10-28_ — CAD opens a `.dwg` by sending it to the suite's
server, which converts it to DXF with LibreDWG and answers the DXF; CAD reads
it with its own DXF reader. LibreDWG comes from npm as WebAssembly
(`@mlightcad/libredwg-web` 0.8.2, GPL-3.0), runs in Node, and gets a fresh
child process per file. The exchange is a WebSocket (`/dwg-to-dxf`), because
the desktop proxies a service app's HTTP for GET and HEAD only. A DWG is never
written: Save puts a `.dxf` of the same name beside it.
Rejected: LibreDWG from Alpine (`apk add libredwg`), which changes the OS
image; building LibreDWG's C, which needs a compiler the image lacks; any
reader in the browser, where the CSP forbids wasm; the package's own
`DwgDatabase` conversion, which traps on an R2000 sample and would need a DXF
writer of our own; the ODA File Converter, a proprietary binary; a POST route,
which the desktop's proxy does not forward.
**Why**: the spike converted R2000, R2007 and R2018 samples in 0.4–0.85 s
each, and CAD's reader opened all three with every entity, layer and block.
- *Consequence*: the suite is a `service` descriptor. A server belongs to the
  descriptor, so every Office window (Docs, Sheets, Slides, PDF as well as
  CAD) leases it and waits for its health check, and the OS shows an error in
  any Office window whose lease fails. Measured 2026-10-28 in the production
  image: the first Office window of a session took 2.7–5.0 s with no server
  running, against 1.0–1.15 s static and 1.1–1.5 s with the server up; the
  server idles at about 100 MB and holds one of the OS's four server slots
  while any Office window is open.
- *Consequence*: one conversion takes 260–320 MB while it runs (the build
  reserves 1 GB of wasm memory); the process ends with the file.
