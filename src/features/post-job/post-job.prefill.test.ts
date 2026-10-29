import { describe, expect, it } from "vitest";
import {
  INITIAL_FORM_STATE,
  prefillCompanyStep,
  validateStep,
} from "./post-job.schemas";

const profile = {
  companyName: "Sao Biển Tech",
  websiteUrl: "https://saobien.example",
  description: "Nền tảng thanh toán cho SME.",
  size: "11-50",
  hqCountry: "Singapore",
};
const recruiter = { name: "Đỗ Thanh Tùng", email: "tung@saobien.example" };

describe("prefillCompanyStep (PB41)", () => {
  it("fills the company step from an existing profile so it validates", () => {
    const form = prefillCompanyStep(INITIAL_FORM_STATE, profile, recruiter);
    expect(form).toMatchObject({
      coName: "Sao Biển Tech",
      coWeb: "https://saobien.example",
      coAbout: "Nền tảng thanh toán cho SME.",
      coSize: "11–50",
      coHq: "🇸🇬 Singapore",
      recName: "Đỗ Thanh Tùng",
      recEmail: "tung@saobien.example",
    });
    expect(validateStep(1, form)).toEqual([]);
  });

  it("never overwrites what the user (or a restored draft) already has", () => {
    const typed = {
      ...INITIAL_FORM_STATE,
      coName: "Tên khác",
      recEmail: "x@y.z",
    };
    const form = prefillCompanyStep(typed, profile, recruiter);
    expect(form.coName).toBe("Tên khác");
    expect(form.recEmail).toBe("x@y.z");
  });

  it("maps an HQ country outside the option list to Other", () => {
    expect(
      prefillCompanyStep(
        INITIAL_FORM_STATE,
        { ...profile, hqCountry: "Vietnam" },
        null
      ).coHq
    ).toBe("Other");
  });
});
