# Task 17: The kit's focus and motion fixes arrive, and brief 11's workarounds go

**Depends on:** imbatranimOS brief 91 (kit controls: focus rings, reduced
motion, Classic dark's crimson, 44 px menu rows on a phone), built and
committed in the OS repo. Don't start before it is.

**Runs after:** 16.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../CLAUDE.md)).

Filed 2026-11-19 from the owner's backlog grill, the imbatranim-apps half of
the OS todo "Kit controls that miss a focus ring or move under reduced
motion".

## Context

Brief 11 walked every app screen with Tab in the four looks and sampled
motion under reduced motion. It worked around what the kit got wrong in
`53f9122` and `098849f`, inside the apps. imbatranimOS brief 91 fixes the
kit and the shell. This brief moves the kit snapshot to that commit and
removes the app-side workarounds the fixed kit makes unneeded.

The kit's menu rows grow to 44 px under 600 px in brief 91, so every More
menu here (CAD, Slides, PDF) gets taller on a phone.

## Files you OWN

- `vendor/imbatranim-ui/` through `npm run kit:sync` only (never by hand)
- the files `53f9122` and `098849f` changed, to take their workarounds out
- `tools/browser/` specs, if a check encoded a workaround
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md)

## What to do

1. `npm run kit:sync -- <imbatranimOS checkout> <brief 91's last commit>`.
2. Read `53f9122` and `098849f`. Remove each workaround the new kit makes
   unneeded; keep, and list, any it still needs.
3. The focus spec and the overflow spec in the dev container's desktop, in
   the four looks (Apricot and Classic, light and dark), at 1280 and 390.
   Menus at 390: rows 44 px, nothing cut.

## Acceptance

- [ ] `npm run kit:sync -- … --check` exits 0 at brief 91's commit.
- [ ] Every workaround is gone or listed with its reason.
- [ ] The focus and overflow specs pass; `npm run check` exit 0;
      `bash corpus/lint.sh` OK.
- [ ] End move `ready_for_deploy`, owner step: push, re-pin imbatranimOS's
      marketplace descriptors to this repo's last commit, then
      `node cli.ts imbatranim-os server` from the vps-deploy checkout.

## Outcome (2026-11-19)

Built in `f6c6298` to `60bde4d`, local on `main`, not pushed.

- **Kit snapshot** at imbatranimOS `c9f2735` (`f6c6298`); `kit:sync -- … --check` exit 0. No props changed, `SHARED_KIT_VERSION` stays 1. The snapshot test names the new commit (`1a70280`).
- **Removed** (`1454780`, `12b50aa`): `53f9122`'s 2 px accent ring on nine text fields (the REST client's URL, header, form-field, auth and environment fields, PDF's typed signature and a form's text field), since the kit's Input rings itself on `focus-visible`; and, not named by the brief, the 2 px accent outline `14b0192` gave eight scroll areas' viewports (Todo, Bookmarks, Git GUI x3, the REST client x3, CAD's Layers). The kit's viewport now carries `outline-none` and rings through a layer after it, which left that outline with no effect and the focus spec reading the stop as unringed.
- **Kept:** `098849f` (`ring-on-primary-container` on soft-fill controls). Classic is one fill per mode, so a `ring-primary` ring on a `bg-primary-container` control is still 1:1 with its fill. The ghost buttons' own `focus-visible:ring-primary` rings are the same colour the kit now draws; left alone, they are harmless.
- **Tests:** Docs' refusal body reads `name: reason`; the focus spec lost its Classic dark allowance and reads the kit's ScrollArea ring layer (the `aria-hidden` sibling after the viewport) as that stop's ring.
- **CAD's More menu** (`60bde4d`): at 44 px a row the single 16-row list was 740 px tall and the overflow spec at 360 by 800 found it cut. More keeps Ortho, Polar tracking and Object snaps and two rows that open the snap settings and the units as lists of their own (the desktop's chevron menu is unchanged). Slides' More (5 rows) and PDF's (3) are 44 px a row and fit at 390 and 360, in Apricot light and Classic dark.
- **Walk** (dev container's desktop, the three groups installed from the scratch clone at `60bde4d`): focus spec, `npx playwright test -c tools/browser/playwright.config.ts tools/browser/focus.spec.ts --workers=1`: 100 passed, 200 skipped (it runs at 1280 only), exit 0, in Apricot light and dark and Classic light and dark. Overflow spec, `overflow.spec.ts --workers=2`: 52 passed, 26 skipped, exit 0. Menu shots in the builder's scratch.
- **Run:** `npm run check` exit 0, `bash corpus/lint.sh` OK.
- **Left for later:** Slides' font size menu has 24 rows and its Shapes menu 7; at 44 px a row the font size list is taller than any phone. The kit's ContextMenu has no max-height (imbatranimOS brief 91 names it); the fix belongs in the kit.
- **Owner step:** push this repo, re-pin imbatranimOS's descriptors for the groups this brief changed (`imbatranim-office.json`, `accessories.json`, `developer.json`) to this repo's last commit, then `node cli.ts imbatranim-os server` from the vps-deploy checkout.
