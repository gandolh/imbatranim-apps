import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { errors } from "./errors.ts";

type Line = { level: number; msg: string; err?: { message?: string } };

/** A bare app with the error plugin first, and a log the test can read. */
async function errorApp() {
  const lines: Line[] = [];
  const app = Fastify({
    logger: { level: "warn", stream: { write: (line: string) => void lines.push(JSON.parse(line) as Line) } },
  });
  await app.register(errors);
  app.get("/boom", () => {
    throw new Error("secret");
  });
  app.get("/boom-async", async () => {
    await Promise.resolve();
    throw new Error("secret");
  });
  app.post("/echo", (request) => request.body);
  return { app, lines };
}

const apps: Awaited<ReturnType<typeof errorApp>>["app"][] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((a) => a.close()));
});
async function setup() {
  const made = await errorApp();
  apps.push(made.app);
  return made;
}

describe("the error plugin", () => {
  it.each(["/boom", "/boom-async"])("answers a thrown error on %s as a fixed 500 and logs it", async (url) => {
    const { app, lines } = await setup();
    const res = await app.inject({ method: "GET", url });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain("secret");
    expect(res.json()).toEqual({ statusCode: 500, error: "Internal Server Error", message: "Internal Server Error" });
    expect(lines.some((l) => l.level >= 50 && l.err?.message === "secret")).toBe(true);
  });

  it("passes Fastify's own 4xx on with its message, not as a 500", async () => {
    const { app, lines } = await setup();
    const res = await app.inject({
      method: "POST",
      url: "/echo",
      headers: { "content-type": "application/json" },
      payload: "{not json",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ statusCode: 400, error: "Bad Request" });
    expect(res.json<{ message: string }>().message).toMatch(/JSON/);
    expect(lines).toEqual([]);
  });

  it("answers an unknown path with a 404 in Fastify's shape", async () => {
    const { app } = await setup();
    const res = await app.inject({ method: "GET", url: "/nope" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ statusCode: 404, error: "Not Found", message: "Route GET:/nope not found" });
  });
});
