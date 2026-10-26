import { describe, expect, it } from "vitest";
import {
  EDITABLE_JOB_STATUSES,
  toUpdateJobPayload,
  validateJobEdit,
  type JobEditFormState,
} from "./job-edit.schemas";

const valid: JobEditFormState = {
  title: "Senior React Engineer",
  description: "x".repeat(120),
  requirements: "",
  jobType: "FULL_TIME",
  level: "SENIOR",
  salaryMin: "3000",
  salaryMax: "5000",
  currency: "USD",
  timezone: "",
  country: "Vietnam",
  benefits: "Health insurance\n\n Remote stipend ",
};

describe("job edit form (PB42)", () => {
  it("only DRAFT and REJECTED listings are editable", () => {
    expect(EDITABLE_JOB_STATUSES).toEqual(["DRAFT", "REJECTED"]);
  });

  it("accepts a valid form", () => {
    expect(validateJobEdit(valid)).toEqual([]);
  });

  it("rejects salaryMax below salaryMin (AC3)", () => {
    expect(
      validateJobEdit({ ...valid, salaryMin: "6000", salaryMax: "5000" })
    ).toHaveLength(1);
  });

  it("rejects a title outside 5–200 characters and a short description", () => {
    expect(validateJobEdit({ ...valid, title: "Dev" }).length).toBe(1);
    expect(validateJobEdit({ ...valid, title: "x".repeat(201) }).length).toBe(
      1
    );
    expect(validateJobEdit({ ...valid, description: "short" }).length).toBe(1);
  });

  it("builds a payload without status, category or skills", () => {
    const payload = toUpdateJobPayload(valid);
    expect(payload).toMatchObject({
      salaryMin: 3000,
      salaryMax: 5000,
      benefits: ["Health insurance", "Remote stipend"],
      requirements: undefined,
      timezone: undefined,
    });
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("categoryIds");
    expect(payload).not.toHaveProperty("skillIds");
  });
});
