import preset from "./vendor/house-style/knip.json" with { type: "json" };

// knip has no `extends`, so this spreads the house preset and adds what knip cannot find on its own.
// Each group's package.json lists the Tailwind packages its build resolves from the group's folder
// (the shared build compiles each app's utilities there), so no import names them.
const TAILWIND_BUILD = ["@tailwindcss/node", "@tailwindcss/oxide", "tailwindcss"];

export default {
  ...preset,
  // The fixtures are frozen input the build tests read as text, never imported.
  ignore: [...preset.ignore, "packages/shared/test/fixtures/**"],
  workspaces: {
    // The CAD harness is a plain browser page for measuring the app; its HTML files load these.
    "apps/cad": { entry: ["harness/main.tsx", "harness/perf.ts", "harness/vite.config.ts"] },
    // The engine's folder barrels came with it from the OS and nothing imports them today (2026-11-11);
    // they stay until a cleanup of the engine decides each one.
    "packages/pdfcore-engine": {
      ignore: [
        "src/adapters/native/index.ts",
        "src/adapters/pdf-lib/index.ts",
        "src/adapters/pdfjs/index.ts",
        "src/api/index.ts",
        "src/model/index.ts",
      ],
    },
    // The build finds pdf.js's wasm folder through the root's installed copy.
    "packages/shared": { ignoreDependencies: ["pdfjs-dist"] },
    accessories: { ignoreDependencies: [...TAILWIND_BUILD, "react-dom"] },
    developer: { ignoreDependencies: TAILWIND_BUILD },
    games: { ignoreDependencies: [...TAILWIND_BUILD, "react-dom"] },
  },
};
