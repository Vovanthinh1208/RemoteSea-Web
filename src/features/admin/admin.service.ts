import type { RequestOptions } from "@/core/http/request-config";
import { adminRepository } from "@/features/admin/admin.repository";
import {
  toAdminAuditLogResponse,
  toAdminEmployersResponse,
  toAdminJobReportsResponse,
  toAdminJobsResponse,
  toRevenueResponse,
} from "@/features/admin/admin.mapper";
import type { JobStatus } from "@/types/job";
import type { JobReportStatus } from "@/types/job-report";
import type {
  AdminAuditLogResponse,
  AdminAuditTargetType,
  AdminEmployersResponse,
  AdminJobReportsResponse,
  AdminJobsResponse,
  RevenueResponse,
} from "@/types/admin";

export const listAdminEmployers = async (
  params: {
    verified?: "true" | "false";
    page?: number;
    limit?: number;
  } = {},
  opts?: RequestOptions
): Promise<AdminEmployersResponse> =>
  toAdminEmployersResponse(await adminRepository.listEmployers(params, opts));

export const updateAdminEmployer = async (
  id: string,
  action: "verify" | "suspend"
): Promise<{ success: true }> => adminRepository.updateEmployer(id, action);

export const listAdminJobs = async (
  params: { status?: JobStatus; page?: number; limit?: number } = {},
  opts?: RequestOptions
): Promise<AdminJobsResponse> =>
  toAdminJobsResponse(await adminRepository.listJobs(params, opts));

export const reviewAdminJob = async (
  id: string,
  action: "approve" | "reject",
  note?: string
): Promise<{ status: JobStatus; publishedAt: string | null }> =>
  adminRepository.reviewJob(id, action, note);

export const getAdminRevenue = async (
  opts?: RequestOptions
): Promise<RevenueResponse> =>
  toRevenueResponse(await adminRepository.getRevenue(opts));

export const listAdminReports = async (
  params: { status?: JobReportStatus; page?: number; limit?: number } = {},
  opts?: RequestOptions
): Promise<AdminJobReportsResponse> =>
  toAdminJobReportsResponse(await adminRepository.listReports(params, opts));

export const resolveAdminReport = async (
  id: string,
  action: "resolve" | "dismiss"
): Promise<{ id: string; status: JobReportStatus; resolvedAt: string }> =>
  adminRepository.resolveReport(id, action);

export const listAdminAuditLog = async (
  params: {
    targetType?: AdminAuditTargetType;
    targetId?: string;
    page?: number;
    limit?: number;
  } = {},
  opts?: RequestOptions
): Promise<AdminAuditLogResponse> =>
  toAdminAuditLogResponse(await adminRepository.listAuditLog(params, opts));
