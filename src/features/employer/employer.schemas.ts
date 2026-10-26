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

// PB32 AC4: the 6-digit code from the company inbox.
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, m("validation.verificationCodeFormat")),
});
export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
