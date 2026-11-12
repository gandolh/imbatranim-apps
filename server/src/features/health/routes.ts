import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { healthSchema } from "./schema.ts";

/**
 * `GET /health` answers at once. The desktop waits on it before any Office window opens, so it
 * loads nothing: LibreDWG runs per conversion, in a child process, never at start.
 */
export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", { schema: { response: { 200: healthSchema } } }, async () => ({ ok: true as const }));
};
