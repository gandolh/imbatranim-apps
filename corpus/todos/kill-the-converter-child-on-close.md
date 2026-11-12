---
title: Kill the running converter child when the server closes
created: 2026-11-12
status: open
tags: [imbatranim-apps]
---

# Kill the running converter child when the server closes

When the server stops (SIGTERM from the desktop) with a conversion in flight, the
socket is closed with 1001 but the forked LibreDWG child runs on until it answers
or its 60 s limit (`CONVERT_TIMEOUT_MS`) kills it. Killing it on close, from an
`onClose` hook in `features/dwg`, is a behaviour change, so it was left out of the
server restructure ([brief 10](../briefs/done/10-the-server-in-the-code-structure.md)).
`createConverter` would need a `close()` that kills the current child and refuses
the queue.
