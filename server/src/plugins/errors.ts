import { STATUS_CODES } from "node:http";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

/** The status a thrown value carries, if it carries one (Fastify's own errors and its plugins' do). */
function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

/**
 * The one error handler, and the 404 handler. Wrapped in fastify-plugin, so they sit on the root and every
 * route inherits them. The body keeps Fastify's own shape, `{ statusCode, error, message }`.
 *
 * - A 4xx that Fastify or a plugin raised (a malformed JSON body, a body over the limit) keeps its status and
 *   its message, which Fastify writes for clients.
 * - Anything else is a 500 with a fixed message, logged with the request: a thrown message is as likely to be
 *   a path or a stack detail as anything a caller can act on, so it never reaches the client.
 */
const errorHandling: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((error: unknown, request, reply) => {
    const status = statusOf(error);
    if (status !== undefined && status >= 400 && status < 500) {
      const message = error instanceof Error ? error.message : "The request is not valid.";
      return reply.code(status).send({ statusCode: status, error: STATUS_CODES[status] ?? "Bad Request", message });
    }
    request.log.error({ err: error }, "unhandled error");
    return reply.code(500).send({ statusCode: 500, error: "Internal Server Error", message: "Internal Server Error" });
  });

  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
    }),
  );
};

export const errors = fp(errorHandling, { name: "errors" });
