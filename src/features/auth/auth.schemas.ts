import { z } from "zod";
import { m, v } from "@/i18n/zod";

// Field rules shared by every auth form — the email/password constraints were
// previously repeated verbatim per schema (password's min-8 in three places),
// so a policy change meant hunting down each copy. Settings' change-password
// schema keeps its own copy on purpose: its message wording differs ("New
// password …").
const emailField = z
  .string()
  .min(1, m("validation.emailRequired"))
  .email(m("validation.emailInvalid"));
const passwordField = z.string().min(8, m("validation.passwordMin"));

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
  remember: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, m("validation.nameRequired"))
    .max(120, m("validation.nameTooLong")),
  email: emailField,
  password: passwordField,
  role: z.enum(["TALENT", "EMPLOYER"]),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(8, m("validation.confirmPassword")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: v("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
