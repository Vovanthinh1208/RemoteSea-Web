import { describe, expect, it } from "vitest";
import { scrubUrl } from "@/services/monitoring";

describe("scrubUrl", () => {
  it("redacts the OAuth access token in the callback URL", () => {
    expect(
      scrubUrl("https://app.example.com/auth/callback?token=abc123.def.ghi")
    ).toBe("https://app.example.com/auth/callback?token=[REDACTED]");
  });

  it("redacts the password-reset token", () => {
    expect(scrubUrl("/reset-password?token=reset-secret")).toBe(
      "/reset-password?token=[REDACTED]"
    );
  });

  it("redacts a sensitive param at the start of a bare query string", () => {
    expect(scrubUrl("token=abc&foo=bar")).toBe("token=[REDACTED]&foo=bar");
  });

  it("redacts a sensitive param that isn't first, keeping the rest intact", () => {
    expect(scrubUrl("/x?page=2&access_token=xyz&sort=recent")).toBe(
      "/x?page=2&access_token=[REDACTED]&sort=recent"
    );
  });

  it("leaves non-sensitive params untouched", () => {
    expect(scrubUrl("/jobs?q=react&page=3")).toBe("/jobs?q=react&page=3");
  });
});
