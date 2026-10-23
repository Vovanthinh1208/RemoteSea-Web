import { z } from "zod";
import { m, v } from "@/i18n/zod";

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, m("validation.currentPasswordRequired")),
    newPassword: z.string().min(8, m("validation.newPasswordMin")),
    confirmNewPassword: z.string().min(8, m("validation.confirmPassword")),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    error: v("validation.passwordsMismatch"),
    path: ["confirmNewPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
