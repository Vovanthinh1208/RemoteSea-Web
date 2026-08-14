export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

// Talent-facing shape (GET /invitations) — job/employer summary only.
export type Invitation = {
  id: string;
  message: string | null;
  status: InvitationStatus;
  createdAt: string;
  respondedAt: string | null;
  job: { id: string; title: string; slug: string };
  employer: {
    companyName: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
};

export type SendInvitationPayload = {
  jobId: string;
  talentId: string;
  message?: string;
};

export type RespondInvitationAction = "ACCEPT" | "DECLINE";
