import { z } from "zod";

// Mirrors the backend's createScorecardSchema (remotesea-api's
// modules/scorecards/dto/create-scorecard.dto.ts) — client-side validation
// is a UX nicety here, not the real boundary; the API re-validates
// everything.
export const scorecardFormSchema = z.object({
  recommendation: z.enum(["STRONG_YES", "YES", "NO", "STRONG_NO"], {
    message: "Pick a recommendation",
  }),
  note: z.string().trim().max(2000, "Keep it under 2000 characters").optional(),
});

export type ScorecardFormValues = z.infer<typeof scorecardFormSchema>;
