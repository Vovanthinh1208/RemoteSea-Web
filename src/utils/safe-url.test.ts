import { describe, expect, it } from "vitest";
import { safeExternalUrl } from "./safe-url";

describe("safeExternalUrl", () => {
  it("passes http(s) and mailto through unchanged", () => {
    expect(safeExternalUrl("https://janedoe.dev")).toBe("https://janedoe.dev");
    expect(safeExternalUrl("http://example.com/x")).toBe("http://example.com/x");
    expect(safeExternalUrl("mailto:hi@example.com")).toBe("mailto:hi@example.com");
  });

  it("drops javascript: and data: payloads (the XSS the backend url() would store)", () => {
    expect(safeExternalUrl("javascript:alert(document.cookie)")).toBeNull();
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    // Scheme match is case/whitespace-insensitive in browsers — the URL parser
    // normalizes these, so they must still be rejected.
    expect(safeExternalUrl("JavaScript:alert(1)")).toBeNull();
  });

  it("drops other schemes and unparseable input", () => {
    expect(safeExternalUrl("ftp://files.example.com")).toBeNull();
    expect(safeExternalUrl("not a url")).toBeNull();
  });

  it("returns null for empty/nullish input", () => {
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl("")).toBeNull();
  });
});
