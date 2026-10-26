import { describe, expect, it } from "vitest";
import {
  toCompanySettingsPayload,
  validateCompanySettings,
  type CompanySettingsForm,
} from "./company-settings.schemas";

const valid: CompanySettingsForm = {
  companyName: "Acme",
  websiteUrl: "https://acme.com",
  description: "We build things.",
  hqCountry: "Singapore",
  hqCity: "Singapore",
  hqAddress: "",
  benefits: "Remote stipend\nHealth insurance",
  linkedinUrl: "https://www.linkedin.com/company/acme",
  facebookUrl: "",
  videoUrl: "",
};

describe("company settings form (PB31)", () => {
  it("accepts a valid form", () => {
    expect(validateCompanySettings(valid)).toEqual([]);
  });

  it("rejects social links that point at another site", () => {
    expect(
      validateCompanySettings({
        ...valid,
        linkedinUrl: "https://evil.example/linkedin.com",
      })
    ).toHaveLength(1);
    expect(
      validateCompanySettings({ ...valid, facebookUrl: "https://fb.evil.io" })
    ).toHaveLength(1);
  });

  it("rejects a non-http video link and more than 15 benefits", () => {
    expect(
      validateCompanySettings({ ...valid, videoUrl: "javascript:alert(1)" })
    ).toHaveLength(1);
    expect(
      validateCompanySettings({
        ...valid,
        benefits: Array.from({ length: 16 }, (_, i) => `perk ${i}`).join("\n"),
      })
    ).toHaveLength(1);
  });

  it("sends null for cleared optional fields and a trimmed benefits list", () => {
    expect(toCompanySettingsPayload(valid)).toMatchObject({
      hqAddress: null,
      facebookUrl: null,
      videoUrl: null,
      linkedinUrl: "https://www.linkedin.com/company/acme",
      benefits: ["Remote stipend", "Health insurance"],
    });
  });
});
