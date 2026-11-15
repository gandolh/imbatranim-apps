# Task 13: The PDF engine's error messages lose their em dash

**Depends on:** brief 11 (its copy sweep took the em dash out of the apps' own strings and left the engine's).

**Runs before:** nothing. **Runs after:** 11, 12.

**Before you start:** run `brief-board guide` ([corpus/CLAUDE.md](../../../CLAUDE.md)).

## Context

Brief 11's copy sweep left the PDF engine's error messages, which can reach a toast through `msgOf`:

- `packages/pdfcore-engine/src/api/errors.ts:27,41,56,84`
- `packages/pdfcore-engine/src/adapters/pdf-lib/forms.ts:141,277`

## Decisions (from the todo)

- Rewrite each with a colon, a comma or two sentences, the way brief 11 rewrote the tooltips, and update the tests that match the text.
- Then grep the engine's other user-reachable strings (thrown messages, anything `msgOf` can surface) for an em dash and fix those too; list them in the outcome.
- Keep the lone dash that means "no value" (`apps/slides/src/editor/Editor.tsx:807`, `developer/apps/rest-api-client/src/components/Sidebar.tsx:72`): a table convention, not prose. Solitaire's win line (`games/apps/solitaire/src/Solitaire.tsx:333`) goes with the games' next brief.

## Files you OWN

- `packages/pdfcore-engine/src/api/errors.ts`, `packages/pdfcore-engine/src/adapters/pdf-lib/forms.ts`, and any engine file the grep turns up, with their tests
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md)

## Acceptance

- [ ] No em dash is left in a message string of `packages/pdfcore-engine/src` (comments and test names stay).
- [ ] A test pins the rewritten messages from `errors.ts`.
- [ ] The two "no value" dashes and Solitaire's win line are untouched.
- [ ] `npm run check` exits 0, and `bash corpus/lint.sh` ends clean.

## Outcome (2026-11-15)

Built in `404a78e`, local on `main`, not pushed.

- Rewritten with `: ` before the detail: `NotImplemented`, `UnsupportedPlatform`, `EncryptedDocument` and `SignatureInvalidationWarning` in `errors.ts`; the `Forms.commit` appearance failure (`forms.ts:141`, now `...outside WinAnsi): <reason>`). The `Forms.set` signature-field message (`forms.ts:277`) now ends `(use Sign instead).`: it named an internal brief, so the dash went with it.
- The grep of `packages/pdfcore-engine/src` for an em dash in a message string found only those six. The rest are comments and `describe` names. No test matched the old text; `__tests__/errors.test.ts` is new and pins the four `errors.ts` messages with and without a detail.
- Untouched: Slides `Editor.tsx:807`, the REST client `Sidebar.tsx:72`, Solitaire's win line.
- Run: `npm run check` exit 0 (91 files, 945 tests passed, 3 skipped), `bash corpus/lint.sh` OK.
- **Owner step:** push this repo, re-pin imbatranimOS's `marketplace/imbatranim-office.json` `ref` to this repo's last commit (it supersedes brief 11's pin to `e2712ef`, and brief 12's step; leave `accessories.json` and `developer.json` as brief 11 sets them), then `node cli.ts imbatranim-os server` from the vps-deploy checkout.
