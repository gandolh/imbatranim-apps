import type { FastifyPluginAsync } from "fastify";

/**
 * `GET /health` answers at once. The desktop waits on it before any Office window opens, so it
 * loads nothing: LibreDWG runs per conversion, in a child process, never at start.
 */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ ok: true }));
};
