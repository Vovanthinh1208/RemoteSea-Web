export type InterviewStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

// PB60 AC2.
export type InterviewPlatform = "GOOGLE_MEET" | "ZOOM" | "MS_TEAMS" | "OTHER";

export type Interview = {
  id: string;
  // PB60 AC2 — null only on interviews proposed before these existed.
  title: string | null;
  platform: InterviewPlatform | null;
  durationMinutes: number;
  proposedSlots: string[];
  confirmedSlot: string | null;
  meetingUrl: string | null;
  status: InterviewStatus;
  createdAt: string;
  // Already present on the API response (interviews/interfaces.ts's
  // interviewSelect) — just not declared here until the hiring workspace
  // needed it, to compute who's eligible to submit a scorecard.
  interviewerId: string | null;
  interviewer: { name: string | null } | null;
  // PB62: the employer's reason, shown to the talent once cancelled.
  cancelReason: string | null;
  cancelledAt: string | null;
};

// 'mine': the caller is an INTERVIEWER-role team member, so `interviews`
// only holds their own assigned ones. 'team': every other role, so it's the
// whole company's agenda. Set by the backend (EmployerService.
// listUpcomingInterviews), never derived client-side.
export type UpcomingInterviewsScope = "mine" | "team";

export type UpcomingInterview = {
  id: string;
  title: string | null;
  applicationId: string;
  confirmedSlot: string;
  durationMinutes: number;
  meetingUrl: string | null;
  talentName: string | null;
  jobTitle: string;
  interviewerId: string | null;
  interviewerName: string | null;
};

export type UpcomingInterviewsResponse = {
  scope: UpcomingInterviewsScope;
  interviews: UpcomingInterview[];
};
