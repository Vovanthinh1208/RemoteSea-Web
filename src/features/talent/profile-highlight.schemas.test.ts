import { describe, expect, it } from "vitest";
import { highlightFormSchema } from "./profile-highlight.schemas";

const base = { title: "Portfolio", isOngoing: true };

describe("highlightFormSchema url (PB25)", () => {
  it.each(["javascript:alert(1)", "ftp://example.com", "example.com"])(
    "rejects %s with the http(s) message",
    (url) => {
      const result = highlightFormSchema.safeParse({ ...base, url });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]?.path).toEqual(["url"]);
    }
  );

  it.each(["", "https://github.com/me", "http://example.com/x"])(
    "accepts %j",
    (url) => {
      expect(highlightFormSchema.safeParse({ ...base, url }).success).toBe(
        true
      );
    }
  );
});
