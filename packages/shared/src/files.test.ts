import { describe, expect, it } from "vitest";
import { folderOf } from "./files";

describe("folderOf", () => {
  it("gives the folder a file is in", () => {
    expect(folderOf({ root: "home", path: "Drawings/2026/plan.dxf" })).toEqual({
      root: "home",
      path: "Drawings/2026",
    });
  });

  it("gives the root itself for a file at the top", () => {
    expect(folderOf({ root: "shared", path: "plan.dxf" })).toEqual({ root: "shared", path: "" });
  });
});
