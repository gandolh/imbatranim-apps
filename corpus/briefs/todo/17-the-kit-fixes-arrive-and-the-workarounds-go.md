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
