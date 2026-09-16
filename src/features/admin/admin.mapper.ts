import type {
  AdminAuditLogResponseDto,
  AdminEmployersResponseDto,
  AdminJobReportsResponseDto,
  AdminJobsResponseDto,
  AdminUsersResponseDto,
  RevenueResponseDto,
} from "@/features/admin/admin.dto";
import type {
  AdminAuditLogResponse,
  AdminEmployersResponse,
  AdminJobReportsResponse,
  AdminJobsResponse,
  AdminUsersResponse,
  RevenueResponse,
} from "@/types/admin";

export const toAdminJobsResponse = (
  dto: AdminJobsResponseDto
): AdminJobsResponse => dto;
export const toAdminEmployersResponse = (
  dto: AdminEmployersResponseDto
): AdminEmployersResponse => dto;
export const toRevenueResponse = (dto: RevenueResponseDto): RevenueResponse =>
  dto;
export const toAdminJobReportsResponse = (
  dto: AdminJobReportsResponseDto
): AdminJobReportsResponse => dto;
export const toAdminAuditLogResponse = (
  dto: AdminAuditLogResponseDto
): AdminAuditLogResponse => dto;
export const toAdminUsersResponse = (
  dto: AdminUsersResponseDto
): AdminUsersResponse => dto;
