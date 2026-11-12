import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./config.ts";

describe("loadConfig", () => {
  it("fills the defaults", () => {
    expect(loadConfig({})).toEqual({ host: "127.0.0.1", port: 41999, logLevel: "warn" });
  });

  it("takes what the desktop sets", () => {
    expect(loadConfig({ PORT: "5123", HOST: "0.0.0.0", LOG_LEVEL: "info" })).toEqual({
      host: "0.0.0.0",
      port: 5123,
      logLevel: "info",
    });
  });

  it.each(["abc", "0", "65536", "1.5", ""])("refuses PORT=%j and names PORT", (port) => {
    expect(() => loadConfig({ PORT: port })).toThrow(ConfigError);
    expect(() => loadConfig({ PORT: port })).toThrow(/PORT/);
  });

  it("refuses an empty HOST and an unknown LOG_LEVEL, naming each", () => {
    expect(() => loadConfig({ HOST: "" })).toThrow(/HOST/);
    expect(() => loadConfig({ LOG_LEVEL: "loud" })).toThrow(/LOG_LEVEL/);
  });

  it("lists every bad variable at once", () => {
    expect(() => loadConfig({ PORT: "abc", HOST: "" })).toThrow(/PORT[^]*HOST|HOST[^]*PORT/);
  });
});
