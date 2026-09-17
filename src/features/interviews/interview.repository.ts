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

  // Employer-only, same reasoning as listUpcoming above.
  cancel: async (applicationId: string): Promise<InterviewDto> => {
    const { data } = await apiClient.patch<InterviewDto>(
      `/employer/applications/${applicationId}/interview/cancel`
    );
    return data;
  },

  // responseType: "blob" — the backend returns raw text/calendar bytes, not
  // JSON, so this needs to bypass axios's default JSON parsing the same way
  // every other call in this file relies on it.
  getIcs: async (applicationId: string, role: UserRole): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(
      `${interviewPath(applicationId, role)}/ics`,
      { responseType: "blob" }
    );
    return data;
  },
};
