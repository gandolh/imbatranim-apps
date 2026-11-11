# imbatranim-apps

The apps that install on the imbatranimOS desktop, in groups (Office, Games,
Accessories, Developer), and the small server some of them use. Read
[corpus/index.md](corpus/index.md) first.

## Commands

- `npm run check`: typecheck, lint, format check, conventions, tests. Run it
  before every hand-back.
- `npm run check:fast`: the typecheck, then ESLint on the changed files. The
  Stop hook runs it.
- `npx vitest run <file>`: one test file.
- `npm run format`: Prettier writes every file it covers (Markdown stays out).
- `npm run build:os`: the Office group into `dist/os`. The other groups build
  with `npm run build:os -w games`, `-w accessories` and `-w developer`.
- `npm run kit:sync -- <os-checkout> <commit>`: moves the kit snapshot to an
  imbatranimOS commit. Add `--check` to compare without writing.
- `npm run house-style:sync -- --check`: is the copy in `vendor/house-style/`
  still the commit in its header.

## Places that mislead

- There is no dev server. An app renders only inside an OS window; tests render
  it against a fake system handle.
- `vendor/imbatranim-ui/` is the OS's kit, byte for byte, and
  `vendor/house-style/` is the house copy. Never edit either. A kit change or a
  reformat in imbatranimOS arrives through `kit:sync`.
- Relative imports keep their `.ts` suffix: the server runs under Node's type
  stripping with no build, and the build resolves them the same way.
- `npm test` runs on a quiet machine. `apps/pdf/src/App.test.tsx` waits about
  two seconds for the engine and can time out when the suite runs under load;
  run it alone with `npx vitest run apps/pdf/src/App.test.tsx`.
- The structure checker (`check:conventions`) runs `--warn-only` until the
  server is restructured.

## Hard rules

- **AGPL-3.0-only, TypeScript only.** No compiled binaries, no prebuilt
  artifacts committed. WebAssembly only from a pinned npm package.
- **No CI.** Don't add GitHub Actions, runners or other GitHub-specific
  automation. Checks run locally.
- **Exact version pins.** Never `npm update`; the shared modules stay at the
  versions the OS resolves at the kit snapshot's commit.
- **No pushes.** Commit locally. The owner pushes.
- **Deploys are the OS's.** It builds this repo with `npm ci` and `npm run
  build:os`; nothing here deploys.

## brief-board

Brief progress goes on brief-board. Run `brief-board guide` before you
start or resume a brief, and follow it.
