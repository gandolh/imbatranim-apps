---
title: The PDF engine's error messages lose their em dash
created: 2026-11-15
status: open
tags: [imbatranim-apps, copy]
---

# The PDF engine's error messages lose their em dash

Brief 11's copy sweep took the em dash out of the apps' own strings. It
left the PDF engine's error messages, which can reach a toast through
`msgOf`:

- `packages/pdfcore-engine/src/api/errors.ts:27,41,56,84`
- `packages/pdfcore-engine/src/adapters/pdf-lib/forms.ts:141,277`

Rewrite each one with a colon, a comma or two sentences, the way brief 11
rewrote the tooltips, and update the tests that match the text.

Keep the lone dash that means "no value"
(`apps/slides/src/editor/Editor.tsx:807`,
`developer/apps/rest-api-client/src/components/Sidebar.tsx:72`). It's a
table convention, not prose. Solitaire's win line
(`games/apps/solitaire/src/Solitaire.tsx:333`) goes with the games' next
brief.
