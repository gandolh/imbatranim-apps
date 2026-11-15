/**
 * The apps' colour contrast, in the desktop's four looks (Apricot and Classic,
 * light and dark), run by hand:
 *
 *   npm run contrast -- <imbatranimOS checkout>
 *
 * It compiles each app's `app.css` the way `npm run build:os` does, against
 * the kit snapshot's token file, and reads which colour utilities each app
 * uses. The kit's tokens name the desktop's runtime variables; their values
 * live in the desktop, so they are read from the imbatranimOS checkout at the
 * snapshot's own commit (`vendor/imbatranim-ui/COMMIT`): the token blocks in
 * `apps/core/src/index.css` and the default accents in its appearance store.
 *
 * Every pair below that an app's stylesheet can form (both utilities present)
 * is checked at 4.5:1 for text and 3:1 for icons, rings and control edges.
 * Every text, icon, ring and edge colour an app uses must sit in at least one
 * pair, so a new colour can't slip past. Colours drawn on paper (Slides'
 * selection frame, PDF's selection outline) are checked against white.
 * Exits 1 on any failure.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { argv, exit } from "node:process";
import { compileAppCss, discoverApps, readKitSnapshot } from "../packages/shared/src/build/index.ts";

type Look = "apricot-light" | "apricot-dark" | "classic-light" | "classic-dark";
const LOOKS: Look[] = ["apricot-light", "apricot-dark", "classic-light", "classic-dark"];

const repo = join(import.meta.dirname, "..");
const osCheckout = argv[2];
if (!osCheckout || !existsSync(join(osCheckout, "apps", "core"))) {
  console.error("usage: npm run contrast -- <imbatranimOS checkout>");
  exit(1);
}

const kit = readKitSnapshot(join(repo, "vendor", "imbatranim-ui"));
const atCommit = (path: string) =>
  execFileSync("git", ["-C", osCheckout, "show", `${kit.commit}:${path}`], { encoding: "utf8" });

/* ── The values: the desktop's token blocks and default accents ─────────── */

const indexCss = atCommit("apps/core/src/index.css").replace(/\/\*[\s\S]*?\*\//g, "");
const store = atCommit("apps/core/src/shared/store/appearanceStore.ts");

function tokenBlock(look: Look): Record<string, string> {
  const [theme, mode] = look.split("-");
  const selector = `[data-os-theme="${theme}"][data-theme="${mode}"]`;
  const block = [...indexCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, sel]) =>
    sel.split(",").some((s) => s.trim() === selector),
  );
  if (!block) throw new Error(`no token block for ${selector} in index.css`);
  const hex = Object.fromEntries(
    [...block[2].matchAll(/--k-([a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2].toLowerCase()]),
  );
  for (const m of block[2].matchAll(/--k-([a-z0-9-]+)\s*:\s*var\(--k-([a-z0-9-]+)\)\s*;/g)) {
    if (hex[m[2]]) hex[m[1]] = hex[m[2]];
  }
  return hex;
}

/** The default accent of each theme (Apricot's apricot, Classic's crimson), in each mode. */
function accents(look: Look): Record<string, string> {
  const [theme, mode] = look.split("-");
  const pick = (re: RegExp) => {
    const m = re.exec(store);
    if (!m) throw new Error(`appearance store: no match for ${re}`);
    return m;
  };
  if (theme === "classic") {
    const fill = pick(/classic\("crimson",\s*"[^"]*",\s*"(#[0-9a-f]{6})"\)/i)[1];
    return { accent: fill, "accent-on": "#ffffff", "accent-soft": fill, "accent-soft-on": "#ffffff" };
  }
  const [, pastel, deep] = pick(/apricot\("apricot",\s*"[^"]*",\s*"(#[0-9a-f]{6})",\s*"(#[0-9a-f]{6})"\)/i);
  const on = pick(/const APRICOT_ON = "(#[0-9a-f]{6})"/i)[1];
  if (mode === "light") return { accent: deep, "accent-on": "#ffffff", "accent-soft": pastel, "accent-soft-on": on };
  const [, soft, softOn] = pick(/apricot:\s*\{\s*soft:\s*"(#[0-9a-f]{6})",\s*softOn:\s*"(#[0-9a-f]{6})"\s*\}/i);
  return { accent: pastel, "accent-on": on, "accent-soft": soft, "accent-soft-on": softOn };
}

/** The kit's `--color-*` names and the runtime variable each one reads. */
const themeCss = readFileSync(kit.themeCss, "utf8");
const colorVars = Object.fromEntries(
  [...themeCss.matchAll(/--color-([a-z0-9-]+)\s*:\s*var\(--(k-)?([a-z0-9-]+)\)/g)].map((m) => [
    m[1],
    m[2] ? `k-${m[3]}` : m[3],
  ]),
);

const values: Record<Look, Record<string, string>> = Object.fromEntries(
  LOOKS.map((look) => {
    const k = tokenBlock(look);
    const a = accents(look);
    const out: Record<string, string> = {};
    for (const [name, v] of Object.entries(colorVars)) {
      const hex = v.startsWith("k-") ? k[v.slice(2)] : a[v];
      if (hex) out[name] = hex;
    }
    return [look, out];
  }),
) as Record<Look, Record<string, string>>;

/* ── WCAG contrast ──────────────────────────────────────────────────────── */

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
/** `color-mix(in srgb, a p%, b)`. */
function mix(a: string, p: number, b: string): string {
  const [x, y] = [rgb(a), rgb(b)];
  return `#${x
    .map((v, i) =>
      Math.round(v * p + y[i] * (1 - p))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/* ── What each app uses ─────────────────────────────────────────────────── */

type Use = { fg: Set<string>; edge: Set<string>; bg: Set<string> };
const TEXT_PROPS = new Set(["color", "fill", "stroke", "caret-color", "accent-color", "text-decoration-color"]);
const EDGE_PROPS = /^(border(-[a-z]+)?-color|outline-color|--tw-ring-color|--tw-inset-ring-color)$/;

function uses(css: string): Use {
  const use: Use = { fg: new Set(), edge: new Set(), bg: new Set() };
  for (const m of css.matchAll(/([a-z-]+)\s*:\s*(?:color-mix\(in [a-z]+,\s*)?var\(--color-([a-z0-9-]+)/g)) {
    const [, prop, token] = m;
    if (prop === "background-color") use.bg.add(token);
    else if (TEXT_PROPS.has(prop)) use.fg.add(token);
    else if (EDGE_PROPS.test(prop)) use.edge.add(token);
  }
  return use;
}

const GROUPS: { root: string; shared: string }[] = [
  { root: repo, shared: join(repo, "packages", "shared", "src") },
  ...["accessories", "developer"].map((g) => ({ root: join(repo, g), shared: join(repo, g, "shared", "src") })),
];

/* ── The pairs ──────────────────────────────────────────────────────────── */

/** The grounds a panel, bar, field or the desk paints: where unpaired text, icons, rings and edges sit. */
const GROUNDS = ["surface", "surface-container-lowest", "surface-container-low", "surface-container", "desk"];
/** Ink that only ever sits on its own fill. */
const ON_FILL: Record<string, string> = {
  "on-primary": "primary",
  "on-primary-container": "primary-container",
  "on-error": "error",
  "on-error-container": "error-container",
  "on-secondary-container": "secondary-container",
  "inverse-on-surface": "inverse-surface",
};
/** Edges that only separate surfaces (hairlines): no contrast rule applies. */
const DECORATIVE_EDGES = new Set([
  "outline-variant",
  "surface-container-high",
  "surface-container-highest",
  "transparent",
  // A fill's border in the fill's own colour: the fill is the shape.
  "primary-container",
  "error-container",
]);
/** Paper, white or black in every look (brief 09's exceptions): checked on their own below. */
const PAPER = new Set(["white", "black"]);
/**
 * imbatranimOS's own known gap: Classic's crimson as text or an edge on the
 * dark surfaces is about 3:1, left as it was (its contrast.test.ts holds
 * only white on the fill there). A token value, so it is listed, not failed.
 */
const knownGap = (fg: string, look: Look) => look === "classic-dark" && fg === "primary";

/**
 * Text and its fill named in one class string: `text-on-surface
 * hover:bg-surface-container-high` pairs the ink with the hover fill. A
 * variant's fill takes that variant's ink, or the plain one. Each quoted
 * string counts on its own, and a template literal without its ${…} parts.
 */
function sameStringPairs(files: string[], colours: Set<string>): Set<string> {
  const pairs = new Set<string>();
  const re = /(?:^|\s)((?:[a-z0-9[\]&_=-]+:)*)(text|bg)-([a-z0-9-]+)(?:\/(\d+))?(?=\s|$)/g;
  for (const file of files) {
    const code = readFileSync(file, "utf8");
    const strings = [
      ...[...code.matchAll(/"([^"\n]*)"|'([^'\n]*)'/g)].map((m) => m[1] ?? m[2] ?? ""),
      ...[...code.matchAll(/`([^`]*)`/g)].map((m) => m[1].replace(/\$\{[^}]*\}/g, " ")),
    ];
    for (const str of strings) {
      const ink = new Map<string, string>();
      const fills: [string, string, string][] = [];
      for (const m of str.matchAll(re)) {
        const [, variant, kind, token, alpha] = m;
        if (!colours.has(token)) continue;
        if (kind === "text") ink.set(variant, token);
        else fills.push([variant, token, alpha ?? "100"]);
      }
      for (const [variant, fill, alpha] of fills) {
        const fg = ink.get(variant) ?? ink.get("");
        if (fg) pairs.add(`${fg}|${fill}|${alpha}`);
      }
    }
  }
  return pairs;
}

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["build", "testing", "__fixtures__", "node_modules"].includes(entry.name)) out.push(...sources(path));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

/* ── Run ────────────────────────────────────────────────────────────────── */

const fmt = (n: number) => n.toFixed(2);
const failures: string[] = [];
const gaps = new Set<string>();
const rows: string[] = [];
const colours = new Set(Object.keys(colorVars));

for (const group of GROUPS) {
  for (const app of discoverApps(group.root)) {
    const name = app.dir.slice(repo.length + 1);
    if (name.startsWith("games/")) continue;
    const extraFile = join(app.dir, "src", "app.css");
    const shared = existsSync(group.shared) ? [group.shared] : [];
    const css = await compileAppCss({
      appDir: existsSync(extraFile) ? dirname(extraFile) : app.dir,
      sources: [join(app.dir, "src"), ...shared],
      excludes: [join(group.shared, "build"), join(group.shared, "testing")],
      themeCss: kit.themeCss,
      extra: existsSync(extraFile) ? readFileSync(extraFile, "utf8") : undefined,
    });
    const use = uses(css);
    const grounds = GROUNDS.filter((g) => use.bg.has(g));
    const pairs = new Map<string, number>();
    const add = (fg: string, bg: string, need: number, alpha = "100") =>
      pairs.set(`${fg}|${bg}|${alpha}`, Math.max(need, pairs.get(`${fg}|${bg}|${alpha}`) ?? 0));
    for (const key of sameStringPairs([join(app.dir, "src"), ...shared].flatMap(sources), colours)) {
      const [fg, bg, alpha] = key.split("|");
      if (use.fg.has(fg) && use.bg.has(bg) && !PAPER.has(fg) && !PAPER.has(bg)) add(fg, bg, 4.5, alpha);
    }
    for (const fg of use.fg) {
      if (PAPER.has(fg)) continue;
      if (ON_FILL[fg]) {
        if (use.bg.has(ON_FILL[fg])) add(fg, ON_FILL[fg], 4.5);
      } else for (const g of grounds) add(fg, g, 4.5);
    }
    for (const edge of use.edge) {
      if (DECORATIVE_EDGES.has(edge) || PAPER.has(edge)) continue;
      for (const g of grounds) add(edge, g, 3);
    }
    for (const token of [...use.fg, ...use.edge]) {
      if (DECORATIVE_EDGES.has(token) || PAPER.has(token)) continue;
      if ([...pairs.keys()].some((k) => k.startsWith(`${token}|`))) continue;
      failures.push(`${name}: ${token} is used but sits in no pair`);
    }
    let low = Infinity;
    for (const [key, need] of pairs) {
      const [fg, bg, alpha] = key.split("|");
      const p = Number(alpha) / 100;
      for (const look of LOOKS) {
        const [a, b] = [values[look][fg], values[look][bg]];
        if (!a || !b) {
          failures.push(`${name}: ${fg} or ${bg} has no value in ${look}`);
          continue;
        }
        // A tint (bg-primary/25) is checked over each ground the app paints, the worst kept.
        const under = p < 1 ? grounds.map((g) => mix(b, p, values[look][g])) : [b];
        const r = Math.min(...under.map((u) => ratio(a, u)));
        const what = p < 1 ? `${bg}/${alpha}` : bg;
        if (knownGap(fg, look)) {
          if (r < need) gaps.add(`${fg} on ${what}: ${fmt(r)}`);
          continue;
        }
        low = Math.min(low, r / need);
        if (r < need) failures.push(`${name}: ${fg} on ${what} in ${look} is ${fmt(r)}, needs ${need}`);
      }
    }
    rows.push(`${name}: ${pairs.size} pairs x 4 looks, the lowest at ${fmt(low)} x its threshold`);
  }
}

// On paper, which is white in every look.
const WHITE = "#ffffff";
const paper: [string, (look: Look) => string][] = [
  ["Slides' selection frame #a04b23", () => "#a04b23"],
  ["PDF's selection outline (the strong accent 72% over black)", (look) => mix(values[look].primary, 0.72, "#000000")],
  ["PDF's typed signature, black", () => "#000000"],
];
for (const [what, colour] of paper) {
  const ratios = LOOKS.map((look) => ratio(colour(look), WHITE));
  rows.push(`${what} on white: ${ratios.map(fmt).join(" / ")} (needs 3)`);
  LOOKS.forEach((look, i) => ratios[i] < 3 && failures.push(`${what} on white in ${look} is ${fmt(ratios[i])}`));
}
// The desk under the panels: the hairline carries the edge, so this is reported, not held to a ratio.
for (const look of LOOKS) {
  const v = values[look];
  rows.push(
    `${look}: desk ${v.desk}, panels on it ${fmt(ratio(v["surface-container-low"], v.desk))}:1, ring on it ${fmt(ratio(v.primary, v.desk))}:1`,
  );
}

// The Presenter's black stage: its counter (white at 70%) and its Exit button's edge (white at 50%).
rows.push(
  `Presenter on black: counter ${fmt(ratio(mix(WHITE, 0.7, "#000000"), "#000000"))} (needs 4.5), Exit edge ${fmt(ratio(mix(WHITE, 0.5, "#000000"), "#000000"))} (needs 3)`,
);
if (ratio(mix(WHITE, 0.7, "#000000"), "#000000") < 4.5) failures.push("the Presenter's counter on black");
if (ratio(mix(WHITE, 0.5, "#000000"), "#000000") < 3) failures.push("the Presenter's Exit edge on black");

console.log(`Kit snapshot ${kit.commit.slice(0, 7)}; values from imbatranimOS at the same commit.`);
for (const r of rows) console.log(r);
if (gaps.size) console.log(`imbatranimOS's known gap, Classic dark's crimson: ${[...gaps].join("; ")}`);
if (failures.length) {
  console.log(`\n${failures.length} failing:`);
  for (const f of failures) console.log(`  ${f}`);
  exit(1);
}
console.log("\nEvery pair passes.");
