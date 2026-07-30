import type { RequestOptions } from "@/core/http/request-config";
import { applicationsRepository } from "@/features/applications/applications.repository";
import {
  toApplication,
  toApplicationListResponse,
  toApplicationStatusCounts,
  type ApplicationListResponse,
  type ApplicationStatusCounts,
} from "@/features/applications/applications.mapper";
import type { ApplyRequestDto } from "@/features/applications/applications.dto";
import type { Application } from "@/types/application";

export type ApplyPayload = ApplyRequestDto;
export type { ApplicationListResponse, ApplicationStatusCounts };

export const applyToJob = async (
  payload: ApplyPayload
): Promise<Application> =>
  toApplication(await applicationsRepository.apply(payload));

export const listMyApplications = async (
  page: number,
  limit: number,
  opts?: RequestOptions
): Promise<ApplicationListResponse> =>
  toApplicationListResponse(
    await applicationsRepository.listMine(page, limit, opts)
  );

export const getMyApplicationStats = async (
  opts?: RequestOptions
): Promise<ApplicationStatusCounts> =>
  toApplicationStatusCounts(
    await applicationsRepository.getStatusCounts(opts)
  );

export const listMyApplicationIds = async (
  opts?: RequestOptions
): Promise<string[]> =>
  (await applicationsRepository.listMyApplicationIds(opts)).jobIds;
