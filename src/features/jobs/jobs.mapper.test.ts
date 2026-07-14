import { describe, expect, it } from "vitest";
import { toJob, toJobListItem, toJobListResponse } from "@/features/jobs/jobs.mapper";
import type { JobDto, JobListItemDto, JobListResponseDto } from "@/features/jobs/jobs.dto";

const jobDto = {
  id: "job-1",
  title: "Backend Engineer",
  slug: "backend-engineer",
  description: "Build things",
  requirements: null,
  jobType: "FULL_TIME",
  level: "MID",
  salaryMin: 1000,
  salaryMax: 2000,
  currency: "USD",
  isRemote: true,
  timezone: "sea",
  country: null,
  status: "ACTIVE",
  planType: "STANDARD",
  benefits: [],
  vnHireCount: 0,
  isFeatured: false,
  viewCount: 0,
  applyCount: 0,
  publishedAt: null,
  expiresAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  employer: { companyName: "Acme", logoUrl: null, slug: "acme", isVerified: true },
  categories: [],
  skills: [],
} satisfies JobDto;

describe("jobs.mapper", () => {
  it("toJob passes the DTO through unchanged (identity mapping)", () => {
    expect(toJob(jobDto)).toBe(jobDto);
  });

  it("toJobListItem passes the DTO through unchanged", () => {
    const listItem = {
      ...jobDto,
      employer: { companyName: "Acme", isVerified: true },
    } as unknown as JobListItemDto;
    expect(toJobListItem(listItem)).toBe(listItem);
  });

  it("toJobListResponse maps every job in the list and passes pagination/facets through", () => {
    const listItem = {
      ...jobDto,
      employer: { companyName: "Acme", isVerified: true },
    } as unknown as JobListItemDto;
    const responseDto: JobListResponseDto = {
      jobs: [listItem],
      pagination: { page: 1, limit: 12, total: 1, pages: 1 },
      facets: { jobType: {}, timezone: {}, seniority: {}, category: {} },
    };

    const result = toJobListResponse(responseDto);
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]).toBe(listItem);
    expect(result.pagination).toBe(responseDto.pagination);
    expect(result.facets).toBe(responseDto.facets);
  });
});
