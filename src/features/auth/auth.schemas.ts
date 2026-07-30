import { z } from "zod";

// Field rules shared by every auth form — the email/password constraints were
// previously repeated verbatim per schema (password's min-8 in three places),
// so a policy change meant hunting down each copy. Settings' change-password
// schema keeps its own copy on purpose: its message wording differs ("New
// password …").
const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email");
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
  remember: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: emailField,
  password: passwordField,
  role: z.enum(["TALENT", "EMPLOYER"]),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordFormValues = z.infer<
  typeof forgotPasswordSchema
>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z
      .string()
      .min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<
  typeof resetPasswordSchema
>;
