import type { RequestOptions } from "@/core/http/request-config";
import { interviewRepository } from "@/features/interviews/interview.repository";
import {
  toInterview,
  toInterviewWithHeader,
  toUpcomingInterviewsResponse,
  type InterviewWithHeader,
} from "@/features/interviews/interview.mapper";
import type { ProposeInterviewRequestDto } from "@/features/interviews/interview.dto";
import type { Interview, UpcomingInterviewsResponse } from "@/types/interview";
import type { UserRole } from "@/types/user";

export type { InterviewWithHeader };

export const getInterview = async (
  applicationId: string,
  role: UserRole,
  opts?: RequestOptions
): Promise<InterviewWithHeader> =>
  toInterviewWithHeader(
    await interviewRepository.get(applicationId, role, opts)
  );

export const proposeInterview = async (
  applicationId: string,
  body: ProposeInterviewRequestDto
): Promise<Interview> =>
  toInterview(await interviewRepository.propose(applicationId, body));

export const confirmInterview = async (
  applicationId: string,
  slot: string
): Promise<Interview> =>
  toInterview(await interviewRepository.confirm(applicationId, { slot }));

export const getUpcomingInterviews = async (
  opts?: RequestOptions
): Promise<UpcomingInterviewsResponse> =>
  toUpcomingInterviewsResponse(await interviewRepository.listUpcoming(opts));

export const cancelInterview = async (
  applicationId: string,
  reason: string
): Promise<Interview> =>
  toInterview(await interviewRepository.cancel(applicationId, { reason }));

export const getInterviewIcs = (
  applicationId: string,
  role: UserRole
): Promise<Blob> => interviewRepository.getIcs(applicationId, role);
