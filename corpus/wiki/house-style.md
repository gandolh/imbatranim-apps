---
summary: The house style adopted 2026-11-11 - Prettier at width 120 with double quotes and semicolons, one reformat commit, the generated vendor/house-style copy, ESLint on its houseStyle(), the check and check:fast gate - with the alternatives rejected (git or tarball dependency, other widths, extending the vendored tsconfig) and what is deferred.
updated: 2026-11-11
---

# The house style, formatted and checked

**2026-11-11.** The repo adopts the estate's house style and its quality
harness. Prettier runs at width 120 with double quotes, semicolons and
`trailingComma: "all"` (this repo had single quotes, no semicolons and width
100), the Tailwind plugin stays, and Markdown stays out. One commit,
`8fbe7dd`, reformatted 320 files; its hash is in `.git-blame-ignore-revs`.
The configs are a generated copy in `vendor/house-style/` (version 1.0.0),
refreshed by `npm run house-style:sync`; nobody edits it. ESLint calls the
copy's `houseStyle()` with this repo's folders and keeps the repo's import
boundaries, with Base UI now forbidden in every app folder. `npm run check`
is the gate and `npm run check:fast` its quick subset.

- **Rejected: a git or tarball dependency** for the configs. A copy needs no
  network or git in the OS's build, and the sync reports drift.
- **Rejected: a width other than 120.** It changed the fewest lines across the
  house repos, and the repo had no strong reason for 100.
- **Rejected: extending the vendored tsconfig.** The repo keeps its own base
  (bundler resolution, `.ts` import suffixes) because the server runs under
  Node's type stripping, and a `.js` suffix would not resolve there.
- **Deferred: `noUncheckedIndexedAccess`** (740 errors) and
  `exactOptionalPropertyTypes` (72); a later brief takes them.
- `no-non-null-assertion` is an error in source and a warning in tests; the
  checkers read their roots from `tools/conventions.json`.
