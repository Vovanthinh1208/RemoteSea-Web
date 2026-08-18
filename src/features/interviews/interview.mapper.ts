import type {
  InterviewDto,
  InterviewWithHeaderResponseDto,
} from "@/features/interviews/interview.dto";
import type { Interview } from "@/types/interview";

export const toInterview = (dto: InterviewDto): Interview => dto;

export type InterviewWithHeader = {
  interview: Interview | null;
  jobTitle: string;
  employerName: string;
  talentName: string | null;
};

export const toInterviewWithHeader = (
  dto: InterviewWithHeaderResponseDto
): InterviewWithHeader => ({
  interview: dto.interview ? toInterview(dto.interview) : null,
  jobTitle: dto.jobTitle,
  employerName: dto.employerName,
  talentName: dto.talentName,
});
