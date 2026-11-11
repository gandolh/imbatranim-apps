import { houseStyle } from "./vendor/house-style/eslint.config.js";
import reactRefresh from "eslint-plugin-react-refresh";

// The folders an app's source lives in. An app imports only the kit (`@imbatranim/ui`) and the
// shared helpers, never the desktop's own packages, so the same list scopes the import rules below.
const APP_SOURCE = ["apps/*/src", "accessories/apps/*/src", "developer/apps/*/src", "games/apps/*/src"];
const APP_FILES = APP_SOURCE.map((dir) => `${dir}/**/*.{ts,tsx}`);

const KIT_IMPORTS = [
  {
    group: ["@imbatranim/core", "@imbatranim/core/*"],
    message: "The desktop's own package. An app reaches the OS through useSystem() and the kit, never core.",
  },
  {
    group: ["@imbatranim/ui/*"],
    message: 'The kit is lent as one module: import from "@imbatranim/ui".',
  },
];

const PDF_FIRST_PAGE_MESSAGE =
  "The engine (pdf-lib) loads after the first page: type imports only here; values come from app/engine.ts.";

/**
 * The house config from the vendored house-style copy, given this repo's folders. Thin on purpose:
 * the compiler is the first gate, and the house adds only what it cannot see. The rules and the
 * reason for each are in the copy.
 */
export default [
  ...houseStyle({
    root: import.meta.dirname,
    // Every folder that holds React code: the apps, the shared helpers of each group and the engine.
    web: [...APP_SOURCE, "games/shared/src", "accessories/shared/src", "developer/shared/src", "packages/shared/src"],
    server: "server/src",
    // Run by hand: the kit sync prints its result.
    scripts: ["tools"],
    // The server entry prints where it listens before anything else is up.
    console: ["server/src/index.ts"],
    // The CAD tests check a geometry result through helpers that hold the `expect` calls.
    assertFunctionNames: ["expect", "expectTypeOf", "expectPoint", "expectLine", "expectSameDrawing"],
    // vendor/ is the OS's kit, byte for byte: never linted or rewritten here.
    ignores: ["dist/**", "**/dist/**"],
  }),
  {
    name: "imbatranim-apps/react-refresh",
    files: ["**/*.{ts,tsx}"],
    ...reactRefresh.configs.vite,
  },
  {
    name: "imbatranim-apps/process-env-warns",
    // A warning for now (2026-11-11): the server entry still reads PORT and HOST itself. When the
    // server takes its settings from config.ts, this block goes and the rule is an error again.
    files: ["server/src/index.ts"],
    rules: { "n/no-process-env": "warn" },
  },
  {
    // Build code passes the environment on to child processes on purpose.
    name: "imbatranim-apps/build-env",
    files: ["packages/shared/src/build/**"],
    rules: { "n/no-process-env": "off" },
  },
  {
    name: "imbatranim-apps/kit-imports",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: KIT_IMPORTS }],
    },
  },
  {
    // Every app imports the kit, which wraps Base UI. Base UI itself is the kit's.
    name: "imbatranim-apps/base-ui-imports",
    files: APP_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...KIT_IMPORTS,
            {
              group: ["@base-ui/react", "@base-ui/react/*"],
              message: 'Apps import only the kit: use the component from "@imbatranim/ui", never Base UI directly.',
            },
          ],
        },
      ],
    },
  },
  {
    // Nothing in a browser bundle may reach the engine's Node entry (it binds
    // pdf.js to @napi-rs/canvas, a native module).
    name: "imbatranim-apps/pdf-engine-node-entry",
    files: ["apps/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@pdfcore/engine/node", "@pdfcore/engine/src/*"],
              message:
                "The engine's Node entry and its internals stay out of the browser build: import '@pdfcore/engine' (types) or load it as app/engine.ts does.",
            },
          ],
        },
      ],
    },
  },
  {
    // PDF's first page: every module on the way to it imports only
    // types from the engine and pdf.js, and none of the chunks that load after
    // it. lazy.ts and app/engine.ts reach those with dynamic imports.
    name: "imbatranim-apps/pdf-first-page",
    files: ["apps/pdf/src/**/*.{ts,tsx}"],
    ignores: [
      "apps/pdf/src/**/*.test.{ts,tsx}",
      "apps/pdf/src/app/engineModule.ts",
      "apps/pdf/src/panels/**",
      "apps/pdf/src/forms/**",
      "apps/pdf/src/organize/**",
      "apps/pdf/src/editor/AnnotateToolbar.tsx",
      "apps/pdf/src/editor/PageAnnotateLayer.tsx",
      "apps/pdf/src/editor/SignatureDialog.tsx",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@pdfcore/engine", allowTypeImports: true, message: PDF_FIRST_PAGE_MESSAGE },
            {
              name: "@pdfcore/engine/browser",
              allowTypeImports: true,
              message: PDF_FIRST_PAGE_MESSAGE,
            },
            {
              name: "pdfjs-dist",
              allowTypeImports: true,
              message: "pdf.js is a dynamic import (reader/pdfjs.ts): type imports only here.",
            },
          ],
          patterns: [
            {
              group: ["@pdfcore/engine/node", "@pdfcore/engine/src/*"],
              message: "The engine's Node entry and its internals stay out of the browser build.",
            },
            {
              group: [
                "**/panels/*",
                "**/forms/*",
                "**/organize/*",
                "**/editor/AnnotateToolbar",
                "**/editor/PageAnnotateLayer",
                "**/editor/SignatureDialog",
                "**/app/engineModule",
              ],
              allowTypeImports: true,
              message: "Loaded after the first page: reach it through lazy.ts (or app/engine.ts).",
            },
          ],
        },
      ],
    },
  },
  {
    // An app's entry is the module the desktop imports, and exports its hooks
    // (`commandSources`) by name beside `App`; it is never hot-reloaded.
    name: "imbatranim-apps/app-entry",
    files: ["**/apps/*/src/App.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    // Test helpers and tests export what they like.
    name: "imbatranim-apps/test-exports",
    files: ["**/*.test.{ts,tsx}", "packages/shared/src/testing/**", "packages/shared/test/**"],
    rules: { "react-refresh/only-export-components": "off" },
  },
];
