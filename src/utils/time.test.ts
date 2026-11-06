import { describe, expect, it } from "vitest";
import { timeAgoPhrase } from "@/utils/time";

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3_600_000).toISOString();

describe("timeAgoPhrase", () => {
  it("doesn't turn 'just now' into 'just now ago'", () => {
    const phrase = timeAgoPhrase(new Date().toISOString());
    expect(phrase).not.toMatch(/ago|trước/);
  });

  it("appends the suffix to a real duration", () => {
    expect(timeAgoPhrase(hoursAgo(3))).toMatch(/3.*(ago|trước)/);
  });
});
