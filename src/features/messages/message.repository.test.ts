import { describe, expect, it } from "vitest";
import { threadPath } from "@/features/messages/message.repository";

describe("threadPath", () => {
  it("uses the employer route for an EMPLOYER caller", () => {
    expect(threadPath("app-1", "EMPLOYER")).toBe(
      "/employer/applications/app-1/messages"
    );
  });

  it("uses the talent route for a TALENT caller", () => {
    expect(threadPath("app-1", "TALENT")).toBe("/applications/app-1/messages");
  });

  it("uses the talent route for any non-employer caller", () => {
    expect(threadPath("app-1", "ADMIN")).toBe("/applications/app-1/messages");
  });
});
