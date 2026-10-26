import { z } from "zod";
import { m, v } from "@/i18n/zod";

// startMonth/endMonth are <input type="month"> values ("YYYY-MM") — converted
// to ISO date strings (first of month) at the call site, not here, since the
// two API payload shapes (create vs. update) disagree on what an empty
// endMonth means (omitted vs. explicit null).
export const workExperienceFormSchema = z
  .object({
    company: z.string().trim().min(1, m("validation.companyRequired")).max(120),
    title: z.string().trim().min(1, m("validation.titleRequired")).max(120),
    location: z.string().trim().max(120).optional(),
    startMonth: z.string().min(1, m("validation.startDateRequired")),
    isCurrent: z.boolean(),
    endMonth: z.string().optional(),
    description: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.isCurrent || !!data.endMonth, {
    error: v("validation.endDateRequired"),
    path: ["endMonth"],
  })
  .refine(
    (data) =>
      data.isCurrent || !data.endMonth || data.endMonth > data.startMonth,
    {
      error: v("validation.endDateOrder"),
      path: ["endMonth"],
    }
  );

export type WorkExperienceFormValues = z.infer<typeof workExperienceFormSchema>;

export const monthToIsoDate = (month: string): string =>
  new Date(`${month}-01T00:00:00.000Z`).toISOString();

export const isoDateToMonth = (iso: string): string => iso.slice(0, 7);
