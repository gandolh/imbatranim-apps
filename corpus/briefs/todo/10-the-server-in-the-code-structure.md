# Task 10: The server in the house code structure

**Depends on:**

- In this repo: brief 08, for the gate, `no-process-env` (a warning until this brief) and `.claude/rules/server.md`.
- In the owner's skills library:
  - brief 03, *A code-structure skill for the Fastify + React apps*: rules 1-11, `server-skeleton.md`, `zod-type-provider.md`, `migrating-a-server.md`, `check-structure.mjs`, and the dependency-cruiser and knip presets;
  - brief 16, *The Fastify servers adopt the code structure*: the method;
  - brief 15, *Enforce the base-ui and code-structure skills in every repo*: `check-structure` runs `--warn-only` until this brief is done.
- The owner's grilling of 2026-11-10: Q1 (how services start), Q23, Q24, Q25, Q26, Q43, Q53, Q55, Q56.

**Runs before:** nothing. It touches no file that briefs 09 and 11 touch, so it may run before them, but never at the same time as either.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

## Context

The suite's server does one job: DWG in, DXF out, for CAD (`server/src/app.ts` header). The desktop starts it on a window's first DWG, waits on `/health`, and proxies its WebSocket. It is small: 4 source files (219 lines) and 2 test files (172 lines).

The converter is not HTTP and is not Fastify: `convert.ts` runs LibreDWG's WebAssembly in a child process per file, and `converter.ts` is that child's entry. They stay free of Fastify imports.

### What the server has today (read 2026-11-10)

- **`index.ts`** (18 lines): reads `PORT` and `HOST` (`index.ts:9, 10`), builds the app, listens, prints one line (`:14`), stops on `SIGTERM` and `SIGINT` by hand.
- **`app.ts`** (70 lines): `buildServer(options)` registers `@fastify/websocket` (`:34`), `GET /health` (`:36`) and the WebSocket route `DWG_TO_DXF_PATH` (`:38`). It never listens. `Fastify({ logger: false })` (`:31`).
- **`convert.ts`** (87) and **`converter.ts`** (44): `createConverter()` and the child. `convert.ts:73` logs failures with `console.error`. The child is started with `new URL('./converter.ts', import.meta.url)`, so the two files stay side by side.
- **Tests:** `app.test.ts` (102 lines, 6 tests) listens on port 0 and talks to a real WebSocket, and `convert.test.ts` (70). Neither uses `inject()`.
- **How it starts.** There is no Dockerfile and no pm2 here. The OS runs the descriptor's command, `node server/src/index.ts`, from the build's root, with the port in `PORT` (`os/descriptor.template.json:19`), and the image has no compiler: Node strips the types. So the file path is the contract, in three places: `os/descriptor.template.json:19`, `server/package.json:8` (`main`), and the test that asserts the descriptor (`packages/shared/src/build/osBuild.test.ts:275`). The OS's catalog holds a copy of the descriptor with a pinned commit of this repo; it changes at the owner's next re-pin (see Interplay).
- **Versions.** Fastify 5.12.7 (`server/package.json`), `@fastify/websocket` 11.3.4, `fastify-plugin` 6.0.1 in the tree as a dependency of another package (`package-lock.json:7701`). **zod is not a dependency of the server:** the lockfile resolves one copy, 4.6.7, from other packages (`package-lock.json:12535`), so there is no zod 3 and no move to zod 4. `@fastify/type-provider-zod` is not installed.

### The versions to add (read on npm, 2026-11-10)

`@fastify/type-provider-zod` 1.0.3, `fastify-plugin` 6.0.1, `close-with-grace` 2.5.0, `@fastify/swagger` 9.9.3 and `openapi-types` 12.1.3 (the provider's required peers, which npm installs), and `zod` 4.6.7 as a direct dependency. Pin each exactly in `server/package.json`. Every dependency of the server is installed by the OS's `npm ci` for the whole suite, so this adds five packages to every build of Docs, Sheets, Slides, PDF and CAD. The lockfile diff is not measured here (the scratch copy links the real `node_modules`); step 1 records it.

### Every reader of the environment

| Where | What | Afterwards |
|---|---|---|
| `server/src/index.ts:9` | `Number(process.env.PORT ?? 41999)`: `PORT=abc` gives `NaN` and a server that listens on a random port | `config.ts`, parsed with zod: a non-number, or a port outside 1-65535, stops the start with a message naming `PORT` |
| `server/src/index.ts:10` | `process.env.HOST ?? '127.0.0.1'` | `config.ts` |
| (new) | `LOG_LEVEL` | `config.ts`, default `warn` |
| `server/src/convert.test.ts:54` | `DWG_FIXTURES` | a test, excepted |

No server file reads `NODE_ENV`. The build tooling outside `server/` reads the environment on purpose (`packages/shared/src/build/exportNames.ts:34`, `kitSnapshot.ts:185`) and is out of scope.

### The move map: every file under `server/src/`

| Today | Lines | Target | Note |
|---|---|---|---|
| `index.ts` | 18 | `server.ts` | Loads the config, builds the app, listens, `close-with-grace`. The only file that calls `listen`. |
| `app.ts` | 70 | `app.ts` | `buildServer` becomes `buildApp(config, options)`; registers the plugins, then the features, by name. |
| (new) | | `config.ts`, `config.test.ts` | `loadConfig(env = process.env)`: the one reader. A failure throws a message naming the variable. |
| (new) | | `plugins/websocket.ts` | `@fastify/websocket` with `maxPayload: MAX_DWG_BYTES + 1`, wrapped in `fastify-plugin` so the route plugin sees it. |
| (new) | | `plugins/errors.ts`, `plugins/errors.test.ts` | The one error handler and a 404 handler (below). |
| `app.ts:36` | | `features/health/routes.ts` | `GET /health`, with a response schema. |
| `app.ts:38-65`, `toBytes` | | `features/dwg/routes.ts` | The WebSocket route. Exempt from response schemas (Q53). |
| `convert.ts`, `convert.test.ts` | 87, 70 | `features/dwg/convert.ts`, `convert.test.ts` | `createConverter` gets its `log` from the app's logger. |
| `converter.ts` | 44 | `features/dwg/converter.ts` | The child's entry. It moves with `convert.ts`, so the `new URL('./converter.ts', import.meta.url)` still resolves. `THIRD-PARTY-NOTICES.md:30` names this path and changes with it. |
| `app.test.ts` | 102 | `features/dwg/routes.test.ts`, `features/health/routes.test.ts` | Split: the WebSocket tests keep a real socket; the health test uses `inject()`. |
| (new) | | `testing/buildTestApp.ts` | Builds the app with a fake converter, listens on port 0, returns the socket URL, closes after each test (today's `start` helper, `app.test.ts:12-18`, and `exchange`, `:23-43`). |

There is no `lib/`: nothing is a pure helper shared by two features, and an empty folder would only invite one. `features/dwg/` is the only feature that holds logic, and `features/health/` holds one route. No feature imports another, so no `index.ts` is needed in either yet.

### Every route

| Feature | Method and path | params | querystring | body | response |
|---|---|---|---|---|---|
| health | `GET /health` | | | | `200`: **new** `healthSchema`, `{ ok: true }`, in `features/health/` |
| dwg | `GET /dwg-to-dxf` (WebSocket) | | | | exempt (Q53): the frames are a protocol in `@imbatranim-office/shared/dwg`, not a JSON reply. A `conventions.json` entry says so. |

The only JSON the server sends is `{ "ok": true }`, and the desktop reads `/health`'s status, not its body. Proof that the schema changes nothing: serialise the reply through the provider and compare it byte for byte with `JSON.stringify({ ok: true })`.

### What is not there today, and the facts that apply

- **No error handler.** With none, Fastify's default reply puts a thrown error's message in the body. The server has two HTTP routes and the desktop proxies GET and HEAD only, so the exposure is small, but the rule is the same everywhere: one handler.
- **`logger: false`** (`app.ts:31`) turns `app.log` into a no-op, so a handler that "logs the 500" would log nothing. `createConverter` works around it with `console.error`.
- **Timeouts.** A WebSocket leaves Node's HTTP timeouts once it upgrades, and a conversion has its own limit (`CONVERT_TIMEOUT_MS`, 60 s, `packages/shared/src/dwg.ts:21`) and the route's idle timer (`idleMs`, 30 s). Step 4 proves with a test that a socket held open longer than a lowered `requestTimeout` still receives its answer.
- **`trustProxy`.** The server binds `127.0.0.1` and is reached only through the desktop's proxy, and no code reads a client address. It is not set (a decision, below).
- **`close-with-grace`.** A conversion in flight when the server stops leaves its child to finish on its own, within the 60 s limit. Killing the child on close is a behaviour change, so it is a todo, not a step here.

## Owner decisions

Decided 2026-11-10 (the numbers are the skills library's open questions):

1. **Q23:** `server/src/features/<name>/`.
2. **Q24:** typed plugin options, explicit registration in `app.ts`; no `@fastify/autoload`, no decorators for dependencies.
3. **Q25 and Q53:** a response schema on every JSON route; the WebSocket route is exempt with a `conventions.json` entry.
4. **Q26:** this repo has no "nothing boots the app" rule. Tests keep a real socket where they need one, and use `inject()` where the route is plain HTTP.
5. **Q43:** one error handler that passes Fastify's own 4xx through (status and message) and sends a fixed `Internal Server Error` for a 5xx, never the thrown message, and logs the error with the request. The body keeps Fastify's own shape, `{ statusCode, error, message }`: the repo has no shape of its own.
6. **Q55:** a zod schema lives in its feature folder (`healthSchema`); `@imbatranim-office/shared` stays the home of the WebSocket protocol, which the CAD client imports.
7. **Q1:** the start command is the descriptor's `command`, so the entry rename changes it in the same commit (above).
8. **The code-structure rules** (the skills library's brief 03), as decided: `server.ts` is the only file that calls `listen`; `config.ts` is the only reader of `process.env`; cross-cutting plugins are wrapped in `fastify-plugin`; features are not.
9. **`trustProxy` stays unset** (technical call): nothing reads a client address, and the server is local.
10. **Type stripping stays the run mode** (the repo's invariant, [corpus/CLAUDE.md](../../CLAUDE.md)): every file uses `.ts` import suffixes and erasable syntax only, so `node server/src/server.ts` runs with no build.

## Owner decisions (defaults)

- **The zod type provider for one JSON route.** Default: yes, as the estate rule says, with `@fastify/type-provider-zod` and its two peers. It adds five packages to the suite's `npm ci` to type a route that returns `{ ok: true }`. *Question for the owner:* keep the provider here, or skip it and keep rules 1-5, 7 and 8 (with `/health`'s reply typed by hand)? If skipped, steps 3 and 5 shrink and `zod` is used only by `config.ts`.
- **`LOG_LEVEL` default `warn`.** Default: Pino on, at `warn`, to standard output, so a conversion failure and every 5xx reach the desktop's capture of the server's output. Today's one startup line (`index.ts:14`) becomes an `info` log, which `warn` hides. *Question for the owner:* should the start line stay visible (`info`)?

## Files you OWN

- Everything under `server/src/` (the move map), `server/package.json` (the entry, the dependencies) and `package-lock.json`.
- `os/descriptor.template.json:19` (the `command`) and `packages/shared/src/build/osBuild.test.ts:275` (the assertion), in the same commit as the rename.
- `THIRD-PARTY-NOTICES.md:30` (the converter's path).
- New: `.dependency-cruiser.cjs` (from the vendored `house-style`), `tools/conventions.json` entries for the server.
- `.claude/rules/server.md` (the structure lines), `eslint.config.js` (`no-process-env` to an error).
- Corpus: [wiki/architecture.md](../../wiki/architecture.md) (lines 32 and 48 name `index.ts`), [wiki/decisions.md](../../wiki/decisions.md), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `packages/shared/src/dwg.ts` (the protocol CAD's client also uses), and CAD's client code.
- The WebSocket protocol: the path, the failure kinds, the close codes, the size cap and the idle behaviour stay byte for byte.
- `vendor/` and the groups' descriptors.
- The OS's catalog copy of the descriptor, which is imbatranimOS's.

## What to do

One commit per step, with `npm run typecheck`, `npm test`, `npm run lint` and `npm run build:os` green after each.

1. **Dependencies.** Add the six packages to `server/package.json`, exact, and `npm install`. Record the lockfile diff (the packages added and removed) in the outcome note, and check `npm ls zod` shows one copy. Before touching code, record a baseline: start the server by hand (`PORT=41999 node server/src/index.ts`), save `curl -s -i http://127.0.0.1:41999/health` and stop it.
2. **`config.ts` and the `server.ts` / `app.ts` split.** Add `config.ts` and its test (defaults; `PORT=abc` and `PORT=0` fail with a message naming `PORT`; an empty `HOST` fails). Rename `index.ts` to `server.ts` with `git mv`, and in the same commit change `server/package.json`'s `main`, `os/descriptor.template.json`'s `command` and `osBuild.test.ts`'s assertion. `server.ts` calls `loadConfig()`, builds the app with `buildApp(config)` (rename of `buildServer`, with its one test import), listens, and stops through `close-with-grace`. Run the hand start again and compare with step 1's baseline.
3. **The error plugin.** Add `plugins/errors.ts` (wrapped in `fastify-plugin`) and its test, which registers a throwing route and a bad-JSON route on a test app: a thrown `new Error('secret')` answers 500 without `secret` in the body and logs the error; an invalid JSON body answers 400 with Fastify's message, not 500; an unknown path answers 404. Turn the logger on at `config.logLevel` and send `createConverter`'s `log` to `app.log.warn`.
4. **Move each file into its feature.** `git mv` per the move map, one commit per feature (`health`, then `dwg`), with `plugins/websocket.ts` and `testing/buildTestApp.ts`. Update the relative imports and `THIRD-PARTY-NOTICES.md`. Add the timeout test from Context (a socket open longer than a lowered `requestTimeout` still gets its answer). The child converter must still start: run the real converter test (`convert.test.ts`'s second `describe`).
5. **The type provider and the schemas.** Register `validatorCompiler` and `serializerCompiler` on the app, type `features/health/routes.ts` as `FastifyPluginAsyncZod`, and add `healthSchema` as the `200` response. Compare the serialised reply with `JSON.stringify({ ok: true })`, byte for byte, in the health test. Skip this step if the owner takes the alternative in the defaults.
6. **The checkers.** Add `.dependency-cruiser.cjs` and the `tools/conventions.json` entry for the WebSocket route. Set `no-process-env` to an error. Drop `--warn-only` from `check-structure` in `check:conventions`. Prove each rule bites with a deliberate violation (a second `listen(`, a `process.env` read in `features/dwg/routes.ts`, an import from one feature into another, a `fastify` import under a folder the rules call pure), then revert.
7. **Corpus.** Update [wiki/architecture.md](../../wiki/architecture.md) and `.claude/rules/server.md`, add a [wiki/decisions.md](../../wiki/decisions.md) entry "The server in the house code structure" (what was rejected: `lib/` for one feature, autoload, decorators, `trustProxy`), a [log.md](../../log.md) entry, and a todo `corpus/todos/` for "kill the running converter child when the server closes". `bash corpus/lint.sh` clean.

## Acceptance

- [ ] `grep -rn "process\.env" server/src | grep -v "config.ts\|\.test\.ts"` prints nothing.
- [ ] `grep -rn "listen(" server/src | grep -v "server.ts\|\.test\.ts\|testing/"` prints nothing, and `grep -rn "NODE_ENV" server/src` prints nothing.
- [ ] `PORT=abc node server/src/server.ts` exits non-zero and its message names `PORT`.
- [ ] `PORT=41999 node server/src/server.ts &` then `curl -s -i http://127.0.0.1:41999/health` matches step 1's baseline in status, content type and body, and the process stops cleanly on `SIGTERM`.
- [ ] `grep -n "server/src" os/descriptor.template.json server/package.json` shows `server.ts` and no `index.ts`, and `npx vitest run packages/shared/src/build/osBuild.test.ts` passes.
- [ ] `npx vitest run server` passes, including the error-plugin test (no thrown message in a 500), the timeout test and the real converter test.
- [ ] `grep -nE '"(zod|fastify-plugin|close-with-grace|@fastify/type-provider-zod|@fastify/swagger|openapi-types)"' server/package.json` shows exact versions, no `^` or `~`.
- [ ] `npx depcruise` with the repo's config fails on each deliberate violation in step 6 and passes on the clean tree; `npx knip` reports no unused file or dependency in `server/`.
- [ ] `npm run check` passes, and `bash corpus/lint.sh` ends clean.

## Interplay

- **The OS's catalog.** imbatranimOS pins a commit of this repo in its catalog and holds a copy of `os/descriptor.template.json` with that pin. That copy still says `node server/src/index.ts` until the owner re-pins. A pin to a commit after this brief, with the old command, would start nothing, and only CAD's first DWG would show it. Hand the owner the new command and the commit hash in the outcome note; the catalog edit is an imbatranimOS step.
- Brief 08's gate runs everything above; this brief turns `check-structure` strict and `no-process-env` into an error.
- Briefs 09 and 11 touch no server file.
