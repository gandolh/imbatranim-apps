/**
 * The suite's server. One job: DWG in, DXF out, for CAD.
 *
 * - `GET /health` answers at once (features/health). The desktop waits on it before any Office
 *   window opens (the server is the suite descriptor's, so every app's window leases it), so
 *   starting must stay cheap: LibreDWG loads per conversion, in a child process, never at start.
 * - `DWG_TO_DXF_PATH` is a WebSocket (features/dwg). The protocol is in
 *   `@imbatranim-office/shared/dwg`.
 *
 * `buildApp` registers in a fixed order: the error plugin, the other plugins, then the features by
 * name. It never listens; server.ts does.
 */
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import type { Config } from "./config.ts";
import { createConverter, type Converter } from "./features/dwg/convert.ts";
import { dwgRoutes } from "./features/dwg/routes.ts";
import { healthRoutes } from "./features/health/routes.ts";
import { errors } from "./plugins/errors.ts";
import { websocketSupport } from "./plugins/websocket.ts";

/** Fastify's options a caller may override: a test turns the logger off or lowers a timeout. */
export type ServerOptions = Pick<FastifyServerOptions, "logger" | "requestTimeout" | "connectionTimeout">;

export type BuildAppOptions = {
  server?: ServerOptions;
  convert?: Converter;
  /** How long a socket may stay open without sending its file. */
  idleMs?: number;
};

export async function buildApp(config: Config, options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: config.logLevel }, ...options.server });
  const convert = options.convert ?? createConverter({ log: (line) => app.log.warn(line) });

  // Zod checks every request and encodes every reply, in every plugin registered below.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // First, so every route registered below answers through it.
  await app.register(errors);
  await app.register(websocketSupport);

  await app.register(healthRoutes);
  await app.register(dwgRoutes, { convert, idleMs: options.idleMs ?? 30_000 });

  return app;
}
