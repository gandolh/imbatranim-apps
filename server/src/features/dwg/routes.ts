import type { FastifyPluginAsync } from "fastify";
import { DWG_TO_DXF_PATH, MAX_DWG_BYTES, dwgVersion, type DwgFailure } from "@imbatranim-office/shared/dwg";
import type { Converter } from "./convert.ts";

export interface DwgOptions {
  /** The conversion; a test passes a fake. */
  convert: Converter;
  /** How long a socket may stay open without sending its file. */
  idleMs: number;
}

/**
 * `DWG_TO_DXF_PATH` is a WebSocket: the desktop proxies a service app's HTTP for GET and HEAD only,
 * and its WebSockets both ways. The frames are a protocol, in `@imbatranim-office/shared/dwg`, not
 * a JSON reply, so the route declares no response schema.
 */
export const dwgRoutes: FastifyPluginAsync<DwgOptions> = async (app, { convert, idleMs }) => {
  app.get(DWG_TO_DXF_PATH, { websocket: true }, (socket) => {
    const fail = (failure: DwgFailure) => {
      socket.send(JSON.stringify(failure));
      socket.close(1000);
    };
    const idle = setTimeout(() => socket.close(1000), idleMs);
    socket.once("message", (data, isBinary) => {
      clearTimeout(idle);
      if (!isBinary) return fail({ error: "not-dwg" });
      const dwg = toBytes(data);
      if (dwg.byteLength > MAX_DWG_BYTES) return fail({ error: "too-large" });
      const version = dwgVersion(dwg);
      if (!version) return fail({ error: "not-dwg" });
      convert(dwg).then(
        (result) => {
          if (socket.readyState !== socket.OPEN) return;
          if (!result.ok) return fail({ error: result.error, version });
          socket.send(result.dxf, { binary: true });
          socket.close(1000);
        },
        () => fail({ error: "failed", version }),
      );
    });
    socket.once("close", () => clearTimeout(idle));
  });
};

function toBytes(data: Buffer | ArrayBuffer | Buffer[]): Uint8Array {
  if (Array.isArray(data)) return new Uint8Array(Buffer.concat(data));
  return data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data);
}
