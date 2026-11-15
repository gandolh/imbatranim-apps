import { describe, it, expect } from "vitest";
import {
  EncryptedDocument,
  NotImplemented,
  SignatureInvalidationWarning,
  UnsupportedPlatform,
} from "../api/errors.js";

describe("engine error messages", () => {
  it("put the detail after a colon and carry no em dash", () => {
    expect(
      new NotImplemented("Pages.rotate", "not supported yet").message,
    ).toBe("Pages.rotate is not implemented yet: not supported yet.");
    expect(new UnsupportedPlatform("Render", "no canvas").message).toBe(
      "Render is not available on this platform: no canvas.",
    );
    expect(new EncryptedDocument("a password is needed").message).toBe(
      "Document is encrypted and cannot be opened for editing: a password is needed.",
    );
    expect(new SignatureInvalidationWarning("1 signature").message).toMatch(
      /whole file\): 1 signature\.$/,
    );
  });

  it("read cleanly with no detail", () => {
    const messages = [
      new NotImplemented("X"),
      new UnsupportedPlatform("X"),
      new EncryptedDocument(),
      new SignatureInvalidationWarning(),
    ].map((e) => e.message);
    for (const m of messages) expect(m).not.toMatch(/[—:]/);
  });
});
