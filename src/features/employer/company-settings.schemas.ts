import { z } from "zod";
import { m } from "@/i18n/zod";
import type {
  EmployerProfile,
  UpdateEmployerProfilePayload,
} from "@/types/employer";

// PB31 AC2–3: what the OWNER edits on /employer/company/settings.
export type CompanySettingsForm = {
  companyName: string;
  websiteUrl: string;
  description: string;
  hqCountry: string;
  hqCity: string;
  hqAddress: string;
  benefits: string;
  linkedinUrl: string;
  facebookUrl: string;
  videoUrl: string;
};

export const toCompanySettingsForm = (
  p: EmployerProfile
): CompanySettingsForm => ({
  companyName: p.companyName,
  websiteUrl: p.websiteUrl ?? "",
  description: p.description ?? "",
  hqCountry: p.hqCountry ?? "",
  hqCity: p.hqCity ?? "",
  hqAddress: p.hqAddress ?? "",
  benefits: (p.benefits ?? []).join("\n"),
  linkedinUrl: p.linkedinUrl ?? "",
  facebookUrl: p.facebookUrl ?? "",
  videoUrl: p.videoUrl ?? "",
});

const HTTP_URL = /^https?:\/\/\S+$/i;
const onHost = (host: string) => (value: string) => {
  if (!value) return true;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === host || hostname.endsWith(`.${host}`);
  } catch {
    return false;
  }
};
const optionalUrl = z
  .string()
  .trim()
  .refine((v) => !v || HTTP_URL.test(v), m("validation.urlHttp"));

export const companySettingsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, m("validation.coNameRequired"))
    .max(100),
  websiteUrl: optionalUrl,
  description: z.string().trim().max(2000),
  hqAddress: z.string().trim().max(300),
  benefits: z
    .string()
    .refine(
      (v) => v.split("\n").filter((b) => b.trim()).length <= 15,
      m("validation.benefitsMax", { max: 15 })
    ),
  linkedinUrl: optionalUrl.refine(
    onHost("linkedin.com"),
    m("validation.linkedinUrl")
  ),
  facebookUrl: optionalUrl.refine(
    onHost("facebook.com"),
    m("validation.facebookUrl")
  ),
  videoUrl: optionalUrl,
});

export const validateCompanySettings = (
  form: CompanySettingsForm
): string[] => {
  const result = companySettingsSchema.safeParse(form);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

const orNull = (v: string): string | null => v.trim() || null;

export const toCompanySettingsPayload = (
  form: CompanySettingsForm
): UpdateEmployerProfilePayload => ({
  companyName: form.companyName.trim(),
  ...(form.websiteUrl.trim() && { websiteUrl: form.websiteUrl.trim() }),
  description: form.description.trim(),
  hqCountry: form.hqCountry.trim(),
  hqCity: form.hqCity.trim(),
  hqAddress: orNull(form.hqAddress),
  benefits: form.benefits
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean),
  linkedinUrl: orNull(form.linkedinUrl),
  facebookUrl: orNull(form.facebookUrl),
  videoUrl: orNull(form.videoUrl),
});
