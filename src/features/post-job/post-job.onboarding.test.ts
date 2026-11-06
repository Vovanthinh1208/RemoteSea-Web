import { describe, expect, it } from "vitest";
import {
  INITIAL_FORM_STATE,
  validateCompanyProfile,
} from "@/features/post-job/post-job.schemas";

const valid = {
  ...INITIAL_FORM_STATE,
  coName: "Acme",
  coWeb: "https://acme.example",
  coAbout: "We build things.",
};

describe("validateCompanyProfile (PB30 AC2)", () => {
  it("accepts a complete company without any recruiter fields", () => {
    expect(validateCompanyProfile(valid)).toEqual([]);
  });

  it("reports every missing required field at once", () => {
    expect(
      validateCompanyProfile({ ...valid, coName: "", coAbout: "" })
    ).toHaveLength(2);
  });

  it("rejects a website that isn't an http(s) URL", () => {
    expect(
      validateCompanyProfile({ ...valid, coWeb: "acme.example" })
    ).toHaveLength(1);
  });
});
