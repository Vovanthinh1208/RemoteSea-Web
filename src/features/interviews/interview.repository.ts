import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  ConfirmInterviewRequestDto,
  InterviewDto,
  InterviewWithHeaderResponseDto,
  ProposeInterviewRequestDto,
  UpcomingInterviewsResponseDto,
} from "@/features/interviews/interview.dto";
import type { UserRole } from "@/types/user";

// The one place allowed to know both URL shapes — same role-branching
// pattern as message.repository.ts's threadPath. Confirming is talent-only
// (there's no employer equivalent), so it doesn't need this branch.
const interviewPath = (applicationId: string, role: UserRole): string =>
  role === "EMPLOYER"
    ? `/employer/applications/${applicationId}/interview`
    : `/applications/${applicationId}/interview`;

export const interviewRepository = {
  get: async (
    applicationId: string,
    role: UserRole,
    opts?: RequestOptions
  ): Promise<InterviewWithHeaderResponseDto> => {
    const { data } = await apiClient.get<InterviewWithHeaderResponseDto>(
      interviewPath(applicationId, role),
      { signal: opts?.signal }
    );
    return data;
  },

  propose: async (
    applicationId: string,
    body: ProposeInterviewRequestDto
  ): Promise<InterviewDto> => {
    const { data } = await apiClient.post<InterviewDto>(
      `/employer/applications/${applicationId}/interview`,
      body
    );
    return data;
  },

  confirm: async (
    applicationId: string,
    body: ConfirmInterviewRequestDto
  ): Promise<InterviewDto> => {
    const { data } = await apiClient.patch<InterviewDto>(
      `/applications/${applicationId}/interview/confirm`,
      body
    );
    return data;
  },

  // Employer-only — no talent-side equivalent, so unlike the paths above
  // this doesn't need interviewPath's role branching.
  listUpcoming: async (
    opts?: RequestOptions
  ): Promise<UpcomingInterviewsResponseDto> => {
    const { data } = await apiClient.get<UpcomingInterviewsResponseDto>(
      "/employer/interviews/upcoming",
      { signal: opts?.signal }
    );
    return data;
  },
};
