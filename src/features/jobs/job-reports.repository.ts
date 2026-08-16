import { apiClient } from "@/core/http/http-client";
import type {
  CreateJobReportRequestDto,
  CreateJobReportResponseDto,
} from "@/features/jobs/job-reports.dto";

export const jobReportsRepository = {
  create: async (
    jobId: string,
    payload: CreateJobReportRequestDto
  ): Promise<CreateJobReportResponseDto> => {
    const { data } = await apiClient.post<CreateJobReportResponseDto>(
      `/jobs/${jobId}/report`,
      payload
    );
    return data;
  },
};
