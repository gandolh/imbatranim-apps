import { readFileSync } from "node:fs";
import { join } from "node:path";
import { request, type FullConfig } from "@playwright/test";
import { E2E_DIR, STATE_FILE } from "./playwright.config.ts";
import { APPEARANCE_KEY } from "./desktop.ts";

/** Puts the dev account's appearance back as the setup found it. */
export default async function globalTeardown(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:5173";
  const saved = JSON.parse(readFileSync(join(E2E_DIR, "appearance.json"), "utf8")) as { value: string | null };
  if (saved.value === null) return;
  const api = await request.newContext({ baseURL, storageState: STATE_FILE });
  await api.put("/api/prefs", { data: { entries: [{ key: APPEARANCE_KEY, value: saved.value }] } });
  await api.dispose();
}
