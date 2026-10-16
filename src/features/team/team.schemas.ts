import { z } from "zod";
import { m, v } from "@/i18n/zod";

export const inviteMemberFormSchema = z.object({
  email: z.string().trim().email(m("validation.emailInvalid")),
  role: z.enum(["RECRUITER", "HIRING_MANAGER", "INTERVIEWER"], {
    error: v("validation.pickRole"),
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberFormSchema>;
