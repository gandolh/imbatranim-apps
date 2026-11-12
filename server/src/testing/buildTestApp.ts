import type { FastifyInstance } from "fastify";
import { afterEach } from "vitest";
import { DWG_TO_DXF_PATH } from "@imbatranim-office/shared/dwg";
import { buildApp, type BuildAppOptions } from "../app.ts";
import { loadConfig } from "../config.ts";

const open: FastifyInstance[] = [];
afterEach(async () => {
  await Promise.all(open.splice(0).map((app) => app.close()));
});

/** The app for one test: the logger off, a fake converter if given, closed after the test. It does not listen. */
export async function buildTestApp(options: Omit<BuildAppOptions, "server"> = {}): Promise<FastifyInstance> {
  const app = await buildApp(loadConfig({}), { ...options, server: { logger: false } });
  open.push(app);
  return app;
}

/** Listens on a free port, for a test that needs a real socket, and returns the DWG route's WebSocket URL. */
export async function listenTestApp(app: FastifyInstance): Promise<string> {
  await app.listen({ port: 0, host: "127.0.0.1" });
  const { port } = app.server.address() as { port: number };
  return `ws://127.0.0.1:${port}${DWG_TO_DXF_PATH}`;
}
