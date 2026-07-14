import type { Application, ApplicationStatus, ApplicationWithJob } from "@/types/application";
import type { PaginationMeta } from "@/core/pagination/pagination";

export type ApplicationDto = Application;
export type ApplicationWithJobDto = ApplicationWithJob;
export type ApplyRequestDto = { jobId: string; coverLetter?: string; resumeUrl?: string };

export type ApplicationListResponseDto = {
  applications: ApplicationWithJobDto[];
  pagination: PaginationMeta;
};

export type ApplicationStatusCountsDto = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
};
