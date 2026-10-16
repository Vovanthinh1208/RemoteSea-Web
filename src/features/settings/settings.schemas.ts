import { z } from "zod";
import { m } from "@/i18n/zod";

export const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, m("validation.currentPasswordRequired")),
  newPassword: z.string().min(8, m("validation.newPasswordMin")),
});
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
