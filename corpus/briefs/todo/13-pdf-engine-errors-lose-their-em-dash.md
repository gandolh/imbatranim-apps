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
