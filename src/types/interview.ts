export type InterviewStatus = "PENDING" | "CONFIRMED";

export type Interview = {
  id: string;
  durationMinutes: number;
  proposedSlots: string[];
  confirmedSlot: string | null;
  meetingUrl: string | null;
  status: InterviewStatus;
  createdAt: string;
};

// 'mine': the caller is an INTERVIEWER-role team member, so `interviews`
// only holds their own assigned ones. 'team': every other role, so it's the
// whole company's agenda. Set by the backend (EmployerService.
// listUpcomingInterviews), never derived client-side.
export type UpcomingInterviewsScope = "mine" | "team";

export type UpcomingInterview = {
  id: string;
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
