# The OS descriptor

`descriptor.template.json` is the suite's entry in imbatranimOS's marketplace
catalog, without its pin. The OS's `marketplace/imbatranim-office.json` is this
file with `source.ref` set to a full 40-hex commit of this repo, committed in
the OS repo: the catalog is the OS's trust anchor, so only a commit the OS
reviewed is installed. Shipping a change is a commit here, then an OS commit
that copies this file and moves the pin.

The placeholder ref is not a commit id on purpose: the OS refuses it, so an
unpinned copy can never install.

What must stay true, and is checked by `packages/shared/src/build/osBuild.test.ts`
against a real build:

- one entry per `apps/<name>`, with `id` `office-<name>`, `entry`
  `<name>/app.mjs` and `styles` as `appStylePaths()` gives them (`app.css`, then
  the app's vendor stylesheets in declared order), each file present after
  `npm run build:os`;
- `build` is `npm ci`, then `npm run build:os`, writing `dist/os`;
- `sharedKit` is the `SHARED_KIT_VERSION` in `vendor/imbatranim-ui/COMMIT`.

`capabilities` are what the app's code reaches for through `useSystem()`;
touching one not listed throws. `minSystemVersion` is the kit's
`PROTOCOL_VERSION` (2).

## The other groups

Every group but Office is one root workspace folder with its template in
`<group>/os/descriptor.template.json` (Games: `games/os/`, copied to the OS's
`marketplace/games.json`; Accessories: `accessories/os/`, copied to
`marketplace/accessories.json`). `packages/shared/src/build/groups.test.ts` finds
each such workspace and checks it against a real build:

- `id` is the folder name; each app's `id` is its `<group>/apps/<name>`, its
  `entry` `<name>/app.mjs` and its `styles` as `appStylePaths()` gives them;
- `build` is `npm ci --workspace=<group>`, then
  `npm run build:os --workspace=<group>`, writing `<group>/dist/os`, with no
  `source.subdir`: the install runs at the clone's root and npm installs that
  workspace's dependencies only;
- the group's `package.json` lists the build helper's own packages (Vite,
  TypeScript, Tailwind, React) at the root's exact versions, since a scoped
  install leaves the root's devDependencies out.

Each app's `App.test.tsx` renders it through `fencedSystem`
(`<group>/shared/src/testing`), which fences the handle to the capabilities
the template grants, as the desktop does: a `system` call the template does
not list fails the test.

## Installing from a local checkout

The OS accepts a `file://` repo only when its backend runs with
`MARKETPLACE_ALLOW_LOCAL_REPOS=true`, and an install clones a commit, not a
working tree. Never commit the local descriptor in the OS repo.

1. Clone this repo somewhere scratch, copy your working tree into the clone
   (`git ls-files -co --exclude-standard` lists what to copy) and commit there.
   Note the commit id.
2. Copy the clone into the OS container's home volume (create
   `/home/imbatranim/fixtures` first on a fresh volume):
   `docker cp -a <clone> <container>:/home/imbatranim/fixtures/apps`
   (`-a` keeps uid 1000, the OS user).
3. Write the descriptor: the group's template (`os/` for Office,
   `games/os/` for Games, `accessories/os/` for Accessories) with
   `"source": { "repo": "file:///home/imbatranim/fixtures/apps", "ref": "<commit>" }`.
   - **Dev container** (`MARKETPLACE_ALLOW_LOCAL_REPOS=true npm run dev` in the
     OS checkout; `docker exec infrastructure-dev-1 printenv MARKETPLACE_ALLOW_LOCAL_REPOS`
     says whether it was): save it over the OS checkout's
     `marketplace/<id>.json` (`imbatranim-office.json`, `games.json`, `accessories.json`); compose
     watch syncs it into
     `/app/marketplace` in seconds. A rebuild of the dev image (any change to
     the OS's `package.json`, lockfile or Dockerfile, even a touch) drops it
     from the container: touch the file to sync it again.
   - **Production image**: build it from the OS repo root
     (`docker build -f infrastructure/Dockerfile --target prod -t <tag> .`),
     run it with `-e MARKETPLACE_ALLOW_LOCAL_REPOS=true` (and `FRONTEND_URL`
     set to the address you browse, when it is not `http://localhost:8080`),
     and `docker cp` the descriptor to
     `<container>:/app/marketplace/<id>.json`, where the catalog
     is baked.
4. Settings → Marketplace (reopen it to re-read the catalog) → the group →
   Install. A new commit is a new ref in the descriptor, and the row offers
   Update.
5. Uninstall from the pane and restore the committed descriptor
   (`git checkout marketplace/<id>.json`) when you are done.
