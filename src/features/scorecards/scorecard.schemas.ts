import { z } from "zod";
import { m, v } from "@/i18n/zod";

// Mirrors the backend's createScorecardSchema (remotesea-api's
// modules/scorecards/dto/create-scorecard.dto.ts) — client-side validation
// is a UX nicety here, not the real boundary; the API re-validates
// everything.
const criterionSchema = z
  .number({ error: v("validation.pickRating") })
  .int()
  .min(1, m("validation.pickRating"))
  .max(5, m("validation.pickRating"));

const requiredText = z
  .string({ error: v("validation.required") })
  .trim()
  .min(1, m("validation.required"))
  .max(2000, m("validation.max2000"));

export const scorecardFormSchema = z.object({
  // PB64 AC2: 1–5 per criterion.
  technicalRating: criterionSchema,
  communicationRating: criterionSchema,
  cultureFitRating: criterionSchema,
  // PB64 AC3.
  strengths: requiredText,
  improvements: requiredText,
  // PB64 AC4.
  recommendation: z.enum(
    [
      "STRONGLY_RECOMMEND",
      "RECOMMEND",
      "NEUTRAL",
      "NOT_RECOMMEND",
      "STRONGLY_NOT_RECOMMEND",
    ],
    { error: v("validation.pickRecommendation") }
  ),
  note: z.string().trim().max(2000, m("validation.max2000")).optional(),
});

export type ScorecardFormValues = z.infer<typeof scorecardFormSchema>;
