import websocket from "@fastify/websocket";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { MAX_DWG_BYTES } from "@imbatranim-office/shared/dwg";

/**
 * `@fastify/websocket`, wrapped in fastify-plugin so the route plugin sees it.
 *
 * - `maxPayload` is one byte over the cap: enough to tell "too large" from "at the cap", and ws closes a
 *   socket whose message is larger with 1009 before it buffers the message whole.
 * - On close every client gets 1001 (going away) and the server stops taking upgrades. The plugin's own
 *   default closes with no code, and ws waits 30 s for a client that never answers (`closeTimeout` cuts that to 2 s).
 */
// ws 8.22 takes `closeTimeout`; @types/ws doesn't list it yet, so the object is typed apart from the call.
const wsOptions = { maxPayload: MAX_DWG_BYTES + 1, closeTimeout: 2_000 };

const websocketPlugin: FastifyPluginAsync = async (app) => {
  await app.register(websocket, {
    options: wsOptions,
    preClose(done) {
      for (const client of this.websocketServer.clients) client.close(1001);
      this.websocketServer.close(done);
    },
  });
};

export const websocketSupport = fp(websocketPlugin, { name: "websocket-support" });
