/**
 * Start the suite's server. The desktop runs `node server/src/server.ts` from
 * the build's root (Node strips the types; the image has no compiler and this
 * repo commits no build output), with the port in `PORT` and `HOST` set to
 * 127.0.0.1. The process: settings, the app, shutdown, listen. Nothing else
 * in the server listens. See app.ts for what it serves.
 */
import closeWithGrace from "close-with-grace";
import { buildApp } from "./app.ts";
import { loadConfig } from "./config.ts";

const config = loadConfig();
const app = await buildApp(config);

// SIGINT, SIGTERM, an uncaught error: stop taking requests, close the sockets, and exit.
// After 10 s it exits anyway.
closeWithGrace({ delay: 10_000, logger: app.log }, async ({ signal, err }) => {
  if (err) app.log.error({ err }, "closing after an uncaught error");
  else app.log.info(`closing on ${signal ?? "request"}`);
  await app.close();
});

await app.listen({ host: config.host, port: config.port });
app.log.info(`imbatranim-office server on ${config.host}:${config.port}`);
