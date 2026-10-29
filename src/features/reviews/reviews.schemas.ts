import { z } from "zod";
import { m, v } from "@/i18n/zod";

// Mirrors the backend's createReviewSchema exactly (remotesea-api's
// modules/reviews/dto/create-review.dto.ts) — client-side validation is a
// UX nicety here, not the real boundary; the API re-validates everything.
const ratingSchema = z
  .number({ error: v("validation.pickRating") })
  .int()
  .min(1)
  .max(5);

export const reviewFormSchema = z.object({
  overallRating: ratingSchema,
  communicationRating: ratingSchema.optional(),
  professionalismRating: ratingSchema.optional(),
  interviewProcessRating: ratingSchema.optional(),
  reliabilityRating: ratingSchema.optional(),
  // PB71 AC3: a title and a detailed comment of at least 20 characters.
  title: z
    .string({ error: v("validation.required") })
    .trim()
    .min(1, m("validation.required"))
    .max(120, m("reviews.form.titleMax")),
  comment: z
    .string({ error: v("reviews.form.commentMin") })
    .trim()
    .min(20, m("reviews.form.commentMin"))
    .max(2000, m("validation.max2000")),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
