import { describe, expect, it } from "vitest";
import { buildTestApp } from "../../testing/buildTestApp.ts";

describe("GET /health", () => {
  it("answers ok without loading LibreDWG", async () => {
    let converted = 0;
    const app = await buildTestApp({ convert: async () => (converted++, { ok: false, error: "failed" }) });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.body).toBe(JSON.stringify({ ok: true }));
    expect(converted).toBe(0);
  });

  it("answers an unknown path through the error plugin", async () => {
    const app = await buildTestApp();
    const res = await app.inject({ method: "GET", url: "/nope" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ statusCode: 404, error: "Not Found", message: "Route GET:/nope not found" });
  });
});
