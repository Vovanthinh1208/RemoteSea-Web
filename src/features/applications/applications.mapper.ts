import type {
  ApplicationDto,
  ApplicationListResponseDto,
  ApplicationStatusCountsDto,
  ApplicationWithJobDto,
} from "@/features/applications/applications.dto";
import type {
  Application,
  ApplicationStatus,
  ApplicationWithJob,
} from "@/types/application";
import type { PaginationMeta } from "@/core/pagination/pagination";

export type ApplicationListResponse = {
  applications: ApplicationWithJob[];
  pagination: PaginationMeta;
};

export type ApplicationStatusCounts = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
};

export const toApplication = (dto: ApplicationDto): Application =>
  dto;
export const toApplicationWithJob = (
  dto: ApplicationWithJobDto
): ApplicationWithJob => dto;

export const toApplicationListResponse = (
  dto: ApplicationListResponseDto
): ApplicationListResponse => ({
  applications: dto.applications.map(toApplicationWithJob),
  pagination: dto.pagination,
});

export const toApplicationStatusCounts = (
  dto: ApplicationStatusCountsDto
): ApplicationStatusCounts => dto;
