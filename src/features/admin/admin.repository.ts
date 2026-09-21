import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { JobStatus } from "@/types/job";
import type { JobReportStatus } from "@/types/job-report";
import type {
  AdminAuditLogResponseDto,
  AdminEmployersResponseDto,
  AdminJobReportsResponseDto,
  AdminJobsResponseDto,
  AdminUsersResponseDto,
  RevenueResponseDto,
} from "@/features/admin/admin.dto";
import type {
  AdminAuditTargetType,
  AdminJobModerationFlag,
} from "@/types/admin";
import type { UserRole } from "@/types/user";

// The first call for a given job is a real (billed) LLM completion — a few
// seconds, comfortably able to exceed axios's global 15s default
// (http-client.ts) — not just a pathological outlier. Same reasoning as
// cv-analysis.repository.ts's CV_ANALYSIS_TIMEOUT_MS.
const MODERATION_FLAG_TIMEOUT_MS = 45_000;

export const adminRepository = {
  listEmployers: async (
    params: {
      verified?: "true" | "false";
      page?: number;
      limit?: number;
    } = {},
    opts?: RequestOptions
  ): Promise<AdminEmployersResponseDto> => {
    const { data } = await apiClient.get<AdminEmployersResponseDto>(
      "/admin/employers",
      {
        params,
        signal: opts?.signal,
      }
    );
    return data;
  },

  updateEmployer: async (
    id: string,
    action: "verify" | "suspend"
  ): Promise<{ success: true }> => {
    const { data } = await apiClient.patch<{ success: true }>(
      `/admin/employers/${id}`,
      {
        action,
      }
    );
    return data;
  },

  listJobs: async (
    params: {
      status?: JobStatus;
      page?: number;
      limit?: number;
    } = {},
    opts?: RequestOptions
  ): Promise<AdminJobsResponseDto> => {
    const { data } = await apiClient.get<AdminJobsResponseDto>("/admin/jobs", {
      params,
      signal: opts?.signal,
    });
    return data;
  },

  reviewJob: async (
    id: string,
    action: "approve" | "reject",
    note?: string
  ): Promise<{ status: JobStatus; publishedAt: string | null }> => {
    const { data } = await apiClient.patch<{
      status: JobStatus;
      publishedAt: string | null;
    }>(`/admin/jobs/${id}`, { action, note });
    return data;
  },

  // Advisory only — see JobModerationService on the backend. Lazily
  // generated: the first call for a job runs the LLM, every call after
  // returns the cached row instantly.
  getJobModerationFlag: async (
    id: string,
    opts?: RequestOptions
  ): Promise<AdminJobModerationFlag> => {
    const { data } = await apiClient.get<AdminJobModerationFlag>(
      `/admin/jobs/${id}/moderation-flag`,
      { signal: opts?.signal, timeout: MODERATION_FLAG_TIMEOUT_MS }
    );
    return data;
  },

  // Always calls the LLM and overwrites the cached row — see
  // JobModerationService.regenerate on the backend.
  regenerateJobModerationFlag: async (
    id: string
  ): Promise<AdminJobModerationFlag> => {
    const { data } = await apiClient.post<AdminJobModerationFlag>(
      `/admin/jobs/${id}/moderation-flag/regenerate`,
      undefined,
      { timeout: MODERATION_FLAG_TIMEOUT_MS }
    );
    return data;
  },

  getRevenue: async (opts?: RequestOptions): Promise<RevenueResponseDto> => {
    const { data } = await apiClient.get<RevenueResponseDto>("/admin/revenue", {
      signal: opts?.signal,
    });
    return data;
  },

  listReports: async (
    params: {
      status?: JobReportStatus;
      page?: number;
      limit?: number;
    } = {},
    opts?: RequestOptions
  ): Promise<AdminJobReportsResponseDto> => {
    const { data } = await apiClient.get<AdminJobReportsResponseDto>(
      "/admin/reports",
      { params, signal: opts?.signal }
    );
    return data;
  },

  resolveReport: async (
    id: string,
    action: "resolve" | "dismiss"
  ): Promise<{ id: string; status: JobReportStatus; resolvedAt: string }> => {
    const { data } = await apiClient.patch<{
      id: string;
      status: JobReportStatus;
      resolvedAt: string;
    }>(`/admin/reports/${id}`, { action });
    return data;
  },

  listAuditLog: async (
    params: {
      targetType?: AdminAuditTargetType;
      targetId?: string;
      page?: number;
      limit?: number;
    } = {},
    opts?: RequestOptions
  ): Promise<AdminAuditLogResponseDto> => {
    const { data } = await apiClient.get<AdminAuditLogResponseDto>(
      "/admin/audit-log",
      { params, signal: opts?.signal }
    );
    return data;
  },

  listUsers: async (
    params: {
      role?: UserRole;
      banned?: "true" | "false";
      q?: string;
      page?: number;
      limit?: number;
    } = {},
    opts?: RequestOptions
  ): Promise<AdminUsersResponseDto> => {
    const { data } = await apiClient.get<AdminUsersResponseDto>(
      "/admin/users",
      { params, signal: opts?.signal }
    );
    return data;
  },

  updateUser: async (
    id: string,
    body: { action: "ban" | "unban" | "change-role"; role?: UserRole }
  ): Promise<{ success: true }> => {
    const { data } = await apiClient.patch<{ success: true }>(
      `/admin/users/${id}`,
      body
    );
    return data;
  },
};
