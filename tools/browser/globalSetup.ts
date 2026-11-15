import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "node:process";
import { request, type FullConfig } from "@playwright/test";
import { E2E_DIR, STATE_FILE } from "./playwright.config.ts";
import { APPEARANCE_KEY } from "./desktop.ts";

/**
 * Signs the dev account in once for every spec, and keeps its appearance so
 * the teardown can put it back. EXPECT_REF (a commit) makes it check that
 * the three groups are installed from that commit.
 */
export default async function globalSetup(config: FullConfig) {
  const password = env.OS_E2E_PASSWORD;
  if (!password) throw new Error("Set OS_E2E_PASSWORD to the dev container's password.");
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:5173";
  mkdirSync(E2E_DIR, { recursive: true });
  const api = await request.newContext({ baseURL });
  const signIn = await api.post("/api/identity/local/sign-in", { data: { password } });
  if (!signIn.ok()) throw new Error(`The dev sign-in failed: ${signIn.status()}`);
  await api.storageState({ path: STATE_FILE });
  // A stale install is the main trap: with EXPECT_REF set, every group must be installed from it.
  const ref = env.EXPECT_REF;
  if (ref) {
    const market = (await (await api.get("/api/marketplace")).json()) as {
      apps: { descriptorId: string; installed?: { ref: string } | null }[];
    };
    for (const id of ["imbatranim-office", "accessories", "developer"]) {
      const installed = market.apps.find((a) => a.descriptorId === id)?.installed?.ref ?? "none";
      if (!installed.startsWith(ref)) throw new Error(`${id} is installed from ${installed}, not ${ref}`);
    }
  }
  const prefs = (await (await api.get("/api/prefs")).json()) as Record<string, string>;
  writeFileSync(join(E2E_DIR, "appearance.json"), JSON.stringify({ value: prefs[APPEARANCE_KEY] ?? null }));
  await api.dispose();
}
