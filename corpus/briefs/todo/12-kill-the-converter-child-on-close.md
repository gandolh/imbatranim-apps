# Task 12: Kill the converter child when the server closes

**Depends on:** brief 10 (the server in the code-structure layout: `features/dwg`, `app.ts`, the WebSocket plugin's 1001 close).

**Runs before:** nothing. **Runs after:** 10.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../../CLAUDE.md)).

## Context

When the server stops (SIGTERM from the desktop) with a conversion in flight, the WebSocket plugin's `preClose` closes the socket with 1001, but the forked LibreDWG child runs on until it answers or its 60 s limit (`CONVERT_TIMEOUT_MS`) kills it. Killing it on close is a behaviour change, so brief 10 left it out ([the todo it came from, 2026-11-12](../../log.md)).

## Decisions (from the todo)

- `createConverter` (`server/src/features/dwg/convert.ts`) returns the converter function with a `close()` on it. `close()` kills the running child (SIGTERM, then SIGKILL after a short grace) and refuses queued and later conversions.
- A refused or killed conversion answers `{ ok: false, error: "failed" }`, an existing `DwgFailureKind`: no new status. The socket is already closed with 1001 by then (`preClose` runs first), so the route's `readyState` check drops the answer, the same as for a conversion that finishes after its socket closed.
- `app.ts` registers an `onClose` hook that calls `convert.close()`. A converter a test injects may carry a `close` too; a plain function has none and the hook skips it.
- The `Converter` function type stays the same for its callers; the desktop reads none of this (the wire protocol in `@imbatranim-office/shared/dwg` is unchanged).

## Files you OWN

- `server/src/features/dwg/convert.ts`, `convert.test.ts`, `__fixtures__/` if the stand-in needs it
- `server/src/app.ts`, `server/src/features/dwg/routes.test.ts` (or an app test)
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md)

## What to do

1. `close()` on the converter, per the decisions.
2. The `onClose` hook in `app.ts`.
3. Tests: a converter test that closes with a child running (the stand-in's `h` hangs) and proves the child was killed and a queued job was refused; a test that `app.close()` calls the converter's `close`. No timeout is raised.

## Acceptance

- [ ] `close()` with a child running ends it at once (well under `CONVERT_TIMEOUT_MS`) and the in-flight and queued conversions answer `failed`; a conversion started after `close()` answers `failed` without forking.
- [ ] `app.close()` calls the converter's `close`.
- [ ] No timeout was raised and no status was added.
- [ ] `npm run check` exits 0, and `bash corpus/lint.sh` ends clean.
