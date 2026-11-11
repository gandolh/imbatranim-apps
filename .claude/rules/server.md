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
- `config.ts` is to be the only reader of the environment. `index.ts` still
  reads `PORT` and `HOST` itself (an ESLint warning); add no other reader.
- It does one-off jobs (DWG conversion, PDF export, thumbnails), never a round
  trip per keystroke.
- `npm run check:conventions` runs `check-structure` over this folder,
  `--warn-only` until the server is restructured.
