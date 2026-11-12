import { z } from "zod";

const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

/** The server's settings, parsed once at start. No other file reads the environment. */
export interface Config {
  /** `HOST`: the desktop sets 127.0.0.1, and the server is reached only through its proxy. */
  host: string;
  /** `PORT`, 1 to 65535: the desktop picks it and hands it over. */
  port: number;
  /** `LOG_LEVEL`, `warn` by default: a conversion failure and every 5xx reach the desktop's capture of the output. */
  logLevel: LogLevel;
}

/** The environment can't run the server. The message names every variable at fault. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

// A set but empty value is a mistake, not "unset": `HOST=` fails rather than binding every interface.
const envSchema = z.object({
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number<string>().int().min(1).max(65535).default(41999),
  LOG_LEVEL: z.enum(LOG_LEVELS).default("warn"),
});

/**
 * Parses the settings, or throws `ConfigError` listing every bad variable
 * (`PORT=abc` fails here, not as a server on a random port). Tests pass their own `env`.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) throw new ConfigError(z.prettifyError(parsed.error));
  const { HOST, PORT, LOG_LEVEL } = parsed.data;
  return { host: HOST, port: PORT, logLevel: LOG_LEVEL };
}
