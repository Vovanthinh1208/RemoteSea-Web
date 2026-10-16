import { z } from "zod";
import { m } from "@/i18n/zod";

export const submitVerificationSchema = z.object({
  email: z
    .string()
    .min(1, m("validation.emailRequired"))
    .email(m("validation.emailInvalid")),
});
export type SubmitVerificationFormValues = z.infer<
  typeof submitVerificationSchema
>;
