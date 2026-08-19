export type CompanyMemberRole =
  "OWNER" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER";

export type TeamMember = {
  id: string;
  userId: string;
  role: CompanyMemberRole;
  createdAt: string;
  user: { name: string | null; email: string };
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: CompanyMemberRole;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string | null };
};

export type InvitationPreview = {
  companyName: string;
  role: CompanyMemberRole;
  email: string;
  valid: boolean;
};

export type InviteMemberPayload = {
  email: string;
  role: Exclude<CompanyMemberRole, "OWNER">;
};
