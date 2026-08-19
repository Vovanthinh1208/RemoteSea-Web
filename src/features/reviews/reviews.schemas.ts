import { z } from "zod";

// Mirrors the backend's createReviewSchema exactly (remotesea-api's
// modules/reviews/dto/create-review.dto.ts) — client-side validation is a
// UX nicety here, not the real boundary; the API re-validates everything.
const ratingSchema = z.number({ message: "Pick a rating" }).int().min(1).max(5);

export const reviewFormSchema = z.object({
  overallRating: ratingSchema,
  communicationRating: ratingSchema.optional(),
  professionalismRating: ratingSchema.optional(),
  interviewProcessRating: ratingSchema.optional(),
  reliabilityRating: ratingSchema.optional(),
  // No transform here on purpose — a transform changes zod's *output* type
  // (comment becomes a required-but-possibly-undefined key) in a way
  // zodResolver can't reconcile with react-hook-form's input type, and
  // breaks handleSubmit's typing. The textarea always submits a string
  // (never absent), so "" is converted to undefined at submit time instead
  // — see ReviewForm's onSubmit.
  comment: z
    .string()
    .trim()
    .max(2000, "Keep it under 2000 characters")
    .optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
