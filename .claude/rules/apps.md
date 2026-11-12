---
paths:
  - "apps/*/src/**"
  - "accessories/apps/*/src/**"
  - "developer/apps/*/src/**"
  - "games/apps/*/src/**"
---

# The apps (`*/apps/*/src`)

- Read the `base-ui` skill before you add or change a component.
- Import the kit only as `@imbatranim/ui`. Never `@base-ui/react` (the kit
  wraps it) and never `@imbatranim/core` or `@imbatranim/ui/*`. ESLint
  enforces all three.
- React and the kit are the desktop's instances, lent at runtime and external
  at bundle time. An app does not bundle its own.
- An app reaches the OS through `useSystem()`: files, notifications, windows
  and the server.
- Controls come from the kit: `Toggle` for on/off, `RadioGroup` for a choice of
  one, `Tabs` for panels, `Checkbox`, `Select`, and `disablePointerDismissal`
  on a dialog that holds a form. No native `<select>`, checkbox, radio, or
  `aria-pressed` or `role="tab"` button.
- Sizes are the kit's names (`text-label`, `text-control`, `text-body`), never
  `text-[Npx]`, and no rem-sized utility (`text-lg`, `max-w-md`); layers use
  the kit's `z-*` tokens.
- Utilities compile against the kit's tokens. An app has no stylesheet of its
  own, and a library's CSS is declared in the app's `package.json`
  ([corpus/wiki/stylesheets.md](../../corpus/wiki/stylesheets.md)).
- No root font size and no `html`, `body` or `:root` rules.
- `App.tsx` is the module the desktop imports; it exports `App` and the hooks
  the desktop reads by name.
- Tests render against the fake system handle from `@imbatranim-office/shared/testing`.
- A `!` in source is an error: narrow the value. In a test it is a warning.
- `console` is for a failure with no UI, behind a one-line
  `eslint-disable-next-line no-console` that says why.
