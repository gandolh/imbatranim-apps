import { z } from "zod";

/** `GET /health`'s reply. The desktop reads the status, not the body. */
export const healthSchema = z.object({ ok: z.literal(true) });
