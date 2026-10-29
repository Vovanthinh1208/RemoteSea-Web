import type {
  Interview,
  InterviewPlatform,
  UpcomingInterviewsResponse,
} from "@/types/interview";

export type InterviewDto = Interview;

export type ProposeInterviewRequestDto = {
  // PB60 AC2.
  title: string;
  platform: InterviewPlatform;
  meetingUrl: string;
  interviewerId?: string;
  durationMinutes: number;
  proposedSlots: string[];
};

// PB62 BR1.
export type CancelInterviewRequestDto = { reason: string };

export type ConfirmInterviewRequestDto = { slot: string };

export type InterviewWithHeaderResponseDto = {
  interview: InterviewDto | null;
  jobTitle: string;
  employerName: string;
  talentName: string | null;
};

export type UpcomingInterviewsResponseDto = UpcomingInterviewsResponse;
