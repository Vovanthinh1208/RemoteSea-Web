import { z } from "zod";

export const inviteMemberFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["RECRUITER", "HIRING_MANAGER", "INTERVIEWER"], {
    message: "Pick a role",
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberFormSchema>;
