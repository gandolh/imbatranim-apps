/**
 * A group's published build: its `dist/os` as one archive the OS installs instead of building on the box
 * (imbatranimOS's `build.prebuilt`, 2026-11-24). The OS checks the archive's SHA-256 against the one its catalog
 * descriptor names, so the archive must come out byte for byte the same from the same build: entries in name
 * order, folders 0755 and files 0644, owner 0, time 0, a gzip header with no time and the Unix OS byte. Anyone who
 * builds the commit gets the digest the descriptor names.
 *
 * The format is plain ustar, folders and regular files only: the OS refuses links, devices and pax or GNU headers.
 */
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BLOCK = 512;

/** The archive of everything under `dir`, its paths relative to `dir`. Throws on a link or another kind of file. */
export function packTree(dir: string): Buffer {
  const blocks: Buffer[] = [];
  const walk = (rel: string): void => {
    const names = readdirSync(rel ? join(dir, rel) : dir).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const name of names) {
      const path = rel ? `${rel}/${name}` : name;
      const stat = lstatSync(join(dir, path));
      if (stat.isDirectory()) {
        blocks.push(header(`${path}/`, "5", 0o755, 0));
        walk(path);
      } else if (stat.isFile()) {
        const body = readFileSync(join(dir, path));
        blocks.push(header(path, "0", 0o644, body.length), body, Buffer.alloc((BLOCK - (body.length % BLOCK)) % BLOCK));
      } else {
        throw new Error(`${path} is not a file or a folder; a published build holds only those`);
      }
    }
  };
  walk("");
  blocks.push(Buffer.alloc(2 * BLOCK));
  const gz = gzipSync(Buffer.concat(blocks), { level: 9 });
  // zlib writes the OS it was built for (3 Unix, 10 Windows); one value keeps the digest the same everywhere.
  gz[9] = 3;
  return gz;
}

/** The lowercase hex SHA-256 the OS's descriptor names. */
export function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function header(path: string, type: "0" | "5", mode: number, size: number): Buffer {
  const { name, prefix } = splitPath(path);
  const h = Buffer.alloc(BLOCK);
  h.write(name, 0, 100, "utf8");
  h.write(`${mode.toString(8).padStart(7, "0")}\0`, 100, "latin1");
  h.write("0000000\0", 108, "latin1");
  h.write("0000000\0", 116, "latin1");
  h.write(`${size.toString(8).padStart(11, "0")}\0`, 124, "latin1");
  h.write("00000000000\0", 136, "latin1");
  h.write(type, 156, "latin1");
  h.write("ustar\0", 257, "latin1");
  h.write("00", 263, "latin1");
  h.write(prefix, 345, 155, "utf8");
  h.fill(32, 148, 156);
  let sum = 0;
  for (const b of h) sum += b;
  h.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, "latin1");
  return h;
}

/** A path as ustar holds it: up to 100 bytes of name, and up to 155 more of folders in the prefix. */
function splitPath(path: string): { name: string; prefix: string } {
  if (Buffer.byteLength(path) <= 100) return { name: path, prefix: "" };
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  for (let i = trimmed.indexOf("/"); i !== -1; i = trimmed.indexOf("/", i + 1)) {
    const prefix = trimmed.slice(0, i);
    const name = path.slice(i + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(name) <= 100) return { name, prefix };
  }
  throw new Error(`${path} is too long for a ustar archive`);
}
