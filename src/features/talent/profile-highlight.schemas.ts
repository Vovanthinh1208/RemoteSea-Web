import { z } from "zod";

const CURRENT_YEAR = new Date().getUTCFullYear();
export const HIGHLIGHT_YEARS = Array.from({ length: 62 }, (_, i) =>
  String(CURRENT_YEAR + 1 - i)
);

// One shared shape for all three highlight types — which fields matter
// depends on `type` (read by the caller, not this schema); matches the
// backend's own "one table, type decides which columns are meaningful"
// design (see ProfileHighlight in schema.prisma).
export const highlightFormSchema = z
  .object({
    title: z.string().trim().min(1, "Required").max(120),
    subtitle: z.string().trim().max(120).optional(),
    description: z.string().trim().max(500).optional(),
    tag: z.string().trim().max(60).optional(),
    url: z.string().trim().optional(),
    startYear: z.string().optional(),
    isOngoing: z.boolean(),
    endYear: z.string().optional(),
  })
  .refine((data) => data.isOngoing || !!data.endYear, {
    message: "End year is required unless this is ongoing",
    path: ["endYear"],
  })
  .refine(
    (data) =>
      data.isOngoing ||
      !data.endYear ||
      !data.startYear ||
      data.endYear >= data.startYear,
    {
      message: "End year must be on or after start year",
      path: ["endYear"],
    }
  );

export type HighlightFormValues = z.infer<typeof highlightFormSchema>;
