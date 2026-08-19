import type { Interview } from "@/types/interview";

export type InterviewDto = Interview;

export type ProposeInterviewRequestDto = {
  durationMinutes: number;
  proposedSlots: string[];
  meetingUrl?: string;
};

export type ConfirmInterviewRequestDto = { slot: string };

export type InterviewWithHeaderResponseDto = {
  interview: InterviewDto | null;
  jobTitle: string;
  employerName: string;
  talentName: string | null;
};
