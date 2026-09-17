import type { RequestOptions } from "@/core/http/request-config";
import { interviewRepository } from "@/features/interviews/interview.repository";
import {
  toInterview,
  toInterviewWithHeader,
  toUpcomingInterviewsResponse,
  type InterviewWithHeader,
} from "@/features/interviews/interview.mapper";
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
  durationMinutes: number,
  proposedSlots: string[],
  meetingUrl: string | undefined
): Promise<Interview> =>
  toInterview(
    await interviewRepository.propose(applicationId, {
      durationMinutes,
      proposedSlots,
      meetingUrl,
    })
  );

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
  applicationId: string
): Promise<Interview> =>
  toInterview(await interviewRepository.cancel(applicationId));

export const getInterviewIcs = (
  applicationId: string,
  role: UserRole
): Promise<Blob> => interviewRepository.getIcs(applicationId, role);
