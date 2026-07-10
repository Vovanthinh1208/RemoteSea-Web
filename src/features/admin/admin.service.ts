import type { RequestOptions } from "@/core/http/request-config";
import { adminRepository } from "@/features/admin/admin.repository";
import {
  toAdminEmployersResponse,
  toAdminJobsResponse,
  toRevenueResponse,
} from "@/features/admin/admin.mapper";
import type { JobStatus } from "@/types/job";
import type { AdminEmployersResponse, AdminJobsResponse, RevenueResponse } from "@/types/admin";

export const listAdminEmployers = async (
  params: { verified?: "true" | "false"; page?: number; limit?: number } = {},
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
): Promise<AdminJobsResponse> => toAdminJobsResponse(await adminRepository.listJobs(params, opts));

export const reviewAdminJob = async (
  id: string,
  action: "approve" | "reject",
  note?: string
): Promise<{ status: JobStatus; publishedAt: string | null }> =>
  adminRepository.reviewJob(id, action, note);

export const getAdminRevenue = async (opts?: RequestOptions): Promise<RevenueResponse> =>
  toRevenueResponse(await adminRepository.getRevenue(opts));
