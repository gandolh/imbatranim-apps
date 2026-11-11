// The house dependency-cruiser preset, from the vendored house-style copy: no cycles, no unresolvable
// imports, a feature used through its index only, no Fastify in lib/. The tsconfig is named for its
// `paths` alias: `@imbatranim/ui` is the kit snapshot in vendor/.
module.exports = {
  extends: "./vendor/house-style/.dependency-cruiser.cjs",
  forbidden: [
    {
      // A warning for now (2026-11-11): the CAD export's job and run modules import each other. When
      // one of them takes the other's type from a third module, this goes and the rule is an error again.
      name: "no-circular",
      severity: "warn",
    },
  ],
  options: { tsConfig: { fileName: "tsconfig.app.json" } },
};
