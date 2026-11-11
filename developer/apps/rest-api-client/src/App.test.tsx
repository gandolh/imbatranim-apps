// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanupRendered, createFakeSystem, renderWithSystem, settle } from "@imbatranim-office/shared/testing";
import { fencedSystem } from "../../../shared/src/testing/fencedSystem";
import { App } from "./App";

afterEach(cleanupRendered);

const DOC = {
  collections: [{ id: "r1", name: "List users", method: "GET", url: "{{base}}/users" }],
  history: [],
  environments: [
    {
      id: "e1",
      name: "Local",
      vars: [{ id: "v1", name: "base", value: "http://localhost:3000", secret: false }],
    },
  ],
  activeEnvId: "e1",
};

describe("the REST API Client as a kit app", () => {
  it("shows its saved requests from its data folder, with only the capabilities its descriptor grants", async () => {
    const fake = createFakeSystem({
      appId: "rest-api-client",
      appData: { "data:collections.json": JSON.stringify(DOC) },
    });
    const { container } = renderWithSystem(
      <App windowId="window-1" host={{ appId: "rest-api-client", assetBase: "/", server: null }} />,
      fencedSystem(fake.system, "rest-api-client"),
    );
    await settle();
    expect(container.textContent).toContain("List users");
    expect(fake.notifications).toEqual([]);
  });
});
