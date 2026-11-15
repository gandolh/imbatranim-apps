---
summary: How an app's CSS reaches the desktop: app.css as Tailwind utilities only against the kit snapshot's tokens (no preflight, no --color-* values), and vendor stylesheets declared in package.json (imbatranimOffice.vendorStyles), copied byte for byte after a check that refuses rules not tied to the library, html/body/:root rules beyond custom properties, the desktop's tokens, @import, @font-face and remote url(); ownAttributes, ownCustomProperties (Univer's --univer-) and dropRules (Univer's scrollbar reset) as the declared exceptions.
updated: 2026-11-15
---

# Stylesheets

Split out of [architecture.md](architecture.md). The CSS rule was built
2026-10-21, the vendor stylesheets for SuperDoc and the allowances Univer
needed 2026-10-22. The code wins: `packages/shared/src/build/cssRule.ts`, `appCss.ts`,
`vendorCss.ts`.

## The CSS rule

`appStyles` compiles one stylesheet per app with `@tailwindcss/node`: the
default theme and the snapshot's token file imported with `theme(reference)`,
utilities only, `source(none)`, scanning the app's `src` and
`packages/shared/src` (not `build/`, `testing/` or tests). A utility reads the
desktop's variable with the snapshot's value as fallback,
`var(--color-primary, var(--accent))`, so it follows the accent and theme and
survives the desktop's CSS omitting a token it never used itself. Kit classes
are left to the desktop, which compiles `packages/ui` into its own CSS.

`checkUtilitiesOnly` then fails the build on anything but `@layer utilities`,
Tailwind's `@layer properties` / `@property --tw-*` / `@keyframes`, and on any
`--color-*` definition. CSS imported from JS fails too.

## Sizes and layers (2026-11-12)

The desktop's root is the browser's 16 px and its `body` is 13 px (imbatranimOS
brief 87), and the kit's `theme.css` carries `--spacing: 0.203125rem`, so a
built `app.css` reads `var(--spacing,.203125rem)` and `p-2` stays 6.5 px. What
still moves is a utility that compiles to a literal `rem`: `text-lg`,
`max-w-md`, `max-w-sm`, `text-[2.2rem]`. None is left in the apps:

- `max-w-md` and `max-w-sm` are pinned to the pixels they measured at 13 px,
  `max-w-[364px]` and `max-w-[312px]` (`EmptyState`, `RepoBar`).
- `text-lg` (14.625 px at 13 px) became the kit's `text-lead` (15 px) and the
  signature preview's `text-[2.2rem]` (28.6 px) became `text-display-sm` (26 px),
  each the nearest entry of the scale.
- Every other size is a name from the kit's scale, by pixel value: 8 `nano`, 9
  `micro`, 10 `tiny`, 11 `label`, 12 `control`, 13 `body`, 14 `subhead`, and the
  one 18 px `title` (17 px). Never `text-[Npx]`; a size the scale lacks is an
  imbatranimOS brief, since the kit's `theme.css` is never edited here.
- The Presenter's full-screen layer is `z-dialog`, a token of the kit's z scale
  (it was `z-[100]`). The four `z-[N]` in `PageView` and `PageAnnotateLayer`
  order siblings inside one page and stay literal, on record in
  `tools/conventions.json`.

The CAD dev page (`apps/cad/harness/desktop.css`) sets its 13 px on `body`, and
leaves the root at 16 px, as the desktop does.

## The redesign's utilities (2026-11-15)

Brief 11 kept the rule and added no stylesheet. What its classes rely on:

- **Geometry from the kit**, by name: `h-appbar` 40 px (`-phone` 48),
  `h-statusbar` 32 (`-phone` 48), `h-bottombar` 56, `h-target` 44,
  `w-inspector` 272, `w-inspector-strip` 48, `w-annotate` 232, `w-pdf-strip`
  56, `w-pdf-navigator` 200 and `w-popover` 264. Slides' navigator is a
  computed width, 132 to 220 px with the window's height, set inline. A
  control's 32 px, which the kit doesn't name, is `h-[32px]`.
- **The desk** is `bg-desk`, a kit token that is `surface-container` in light
  and `surface-container-lowest` in dark. No `dark:` variant: it would follow
  the browser, not the desktop.
- **Phones** are `max-[600px]:`. The desktop's `phone:` variant lives in its
  own `index.css` and doesn't reach a kit app's build.
- **Motion** is `motion-safe:` on every transition and spinner.
- **Focus.** The kit's ghost Button and a kit Input outside a Field draw no
  ring, so the apps add `focus-visible:ring-2 focus-visible:ring-primary`
  (inset on a tool). On the soft fill (pressed, selected) the ring is
  `on-primary-container`, with `!` or a `data-[pressed]:` prefix so it wins
  over the plain ring. A kit `ScrollArea`'s viewport takes Tab; its root
  carries `[&>div:focus-visible]:outline-2` with `-outline-primary` and
  `-outline-offset-2`, the only arbitrary variant for a part the kit renders.
- **Vendor parts follow the desktop without vendor CSS edits**: Docs sets
  SuperDoc's `--sd-ui-*` variables from the desktop's tokens, and Sheets
  calls Univer's own dark mode from the desktop's resolved mode.
- **Fixed colours** on paper stay literal and on record in
  `tools/conventions.json`: Slides' `#a04b23` frame and the `bg-white` pages.
  `npm run contrast` checks them on white.

## Vendor stylesheets

A library's own CSS (SuperDoc's `style.css`; Univer's and pdf.js's next) cannot
be imported from JS and is not utilities. An app declares it in its
`package.json`:

```json
"imbatranimOffice": {
  "vendorStyles": {
    "superdoc.css": {
      "from": "@harbour-enterprises/superdoc/style.css",
      "ownAttributes": ["data-tippy-root"]
    }
  }
}
```

The key is the file written beside `app.css`; `from` resolves from the app's
directory like an import (a bare string is shorthand for `{ "from": … }`).
`discoverApps` reads and resolves the declarations (at most 7: the OS takes 8
styles per app). `appStyles` copies each file byte for byte after
`checkVendorCss` (`vendorCss.ts`), and `appStylePaths(app)` gives the
descriptor's `styles`: `<app>/app.css`, then the vendor files in declared order.

The desktop leaves an app's styles on its page, so a vendor sheet is in force
for every window. The check is about the desktop:

- A style rule must be tied to the library: some compound selector carries a
  class, an id, Vue's scoped attribute `[data-v-…]`, or an attribute the
  declaration names in `ownAttributes`. A rule on a type or a common attribute
  alone (`p`, `*`, `::selection`, `[hidden]`, `[data-theme=dark]`) fails, and so
  does one on `html`/`body`/`:root` (a class there is the desktop's).
- `:root` may hold custom properties only, so the library's popups, which it
  mounts in `<body>` outside the window, still read them; none may be the
  desktop's: a name Tailwind's `theme.css` or the kit's token file defines or
  reads, or one in their namespaces (`--font-*`, `--text-*`, `--k-*`, …).
- No `--color-*` definition anywhere; no `@import`, `@font-face` or non-`data:`
  `url()` (the build copies the sheet and nothing it points at); no at-rule
  besides `@media`, `@supports`, `@container`, `@layer`, `@keyframes`,
  `@property` (not a desktop name) and `@charset`.

`ownCustomProperties` names custom-property namespaces only the library uses
(`["--univer-"]`: whole segments and a closing dash). A rule not tied to the
library may stand if every declaration in it is a custom property in one of
those namespaces. Univer's sheet is Tailwind with a `univer-` prefix and starts
with Tailwind's initialiser, `*,:before,:after,::backdrop{--univer-tw-…}`. The
built-in Sheets loaded this exact sheet page-wide, and a variable only the
library reads changes no desktop style. Any other declaration in such a rule,
or a custom property outside the namespaces, still fails as global. A namespace
that overlaps the desktop's (`--color-`, `--font-`, `--text-`, `--k-`, `--tw-`,
or any name the theme files use) is refused at build time. The check reads
selectors and property names with their CSS escapes, so
`.before\:univer-absolute:before` is one class and a pseudo-element.

`dropRules` lists top-level rules, each by its exact source text, that the
build cuts from the copy before the check; every other byte stays. The build
fails unless each one is in the sheet exactly once, so a library upgrade that
touches the rule forces a fresh look. Sheets drops Univer's
`*{scrollbar-color:initial;scrollbar-width:initial}`: `initial` computes to
`auto`, which the desktop already has, so dropping it changes nothing today,
and left in, unlayered, it would beat any scrollbar styling the desktop adds
later.

Scoping a sheet under a wrapper class was rejected for SuperDoc: its toolbar
dropdowns, font picker and tooltips teleport to `<body>`, so its `:root`
variables (257 `--sd-*`, 156 reads without a fallback) must stay on the root.
SuperDoc 1.45.0's sheet passes as it is once `data-tippy-root` (Tippy's popup
root, one `max-width` rule) is declared. The check cannot see a generic class
the desktop also uses (`.toolbar`, `.ProseMirror` in SuperDoc's sheet); nothing
in the OS used those at 56e23b7.
