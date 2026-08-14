import { z } from "zod";

export const submitVerificationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
export type SubmitVerificationFormValues = z.infer<
  typeof submitVerificationSchema
>;
