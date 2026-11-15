import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/** Appends one JSON line to `<REPORT_DIR>/<name>.jsonl` when REPORT_DIR is set: the specs' measurements, kept outside the repo. */
export function report(name: string, row: Record<string, unknown>): void {
  const dir = process.env.REPORT_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${name}.jsonl`), `${JSON.stringify(row)}\n`);
}
