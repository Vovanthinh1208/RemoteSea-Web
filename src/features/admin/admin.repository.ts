import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { JobStatus } from "@/types/job";
import type { JobReportStatus } from "@/types/job-report";
import type {
  AdminEmployersResponseDto,
  AdminJobReportsResponseDto,
  AdminJobsResponseDto,
  RevenueResponseDto,
} from "@/features/admin/admin.dto";

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
};
