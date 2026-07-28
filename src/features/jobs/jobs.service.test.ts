import { describe, expect, it, vi } from "vitest";
import { DEFAULT_JOB_FILTERS, type JobFilters } from "@/features/jobs/job-filters";

const repository = vi.hoisted(() => ({
  jobsRepository: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/features/jobs/jobs.repository", () => repository);

const { buildJobListParams, listJobs, getJob } = await import("@/features/jobs/jobs.service");
const { ValidationError } = await import("@/core/errors/error-types");

describe("buildJobListParams", () => {
  it("drops all filter params when filters are at their defaults, but always sends sort", () => {
    // sort is deliberately never dropped, even at its "recent" default — see
    // the comment in buildJobListParams: the API's own unset-sort default is
    // featured-first, not recent, so omitting it here would silently request
    // the wrong order while the UI shows "Most recent" selected.
    expect(buildJobListParams(DEFAULT_JOB_FILTERS, 12)).toEqual({
      q: undefined,
      type: undefined,
      level: undefined,
      category: undefined,
      timezone: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      sort: "recent",
      page: 1,
      limit: 12,
    });
  });

  it("translates UI filter labels to wire enums and includes salary range once it's off-default", () => {
    const query: JobFilters = {
      q: "engineer",
      sort: "salary",
      page: 2,
      filters: {
        jobType: ["Full-time", "Contract"],
        timezone: ["sea"],
        category: ["engineering"],
        seniority: ["Senior"],
        salaryMin: 1000,
        salaryMax: 5000,
      },
    };

    expect(buildJobListParams(query, 12)).toEqual({
      q: "engineer",
      type: ["FULL_TIME", "CONTRACT", "FREELANCE"],
      level: ["SENIOR", "LEAD", "EXECUTIVE"],
      category: ["engineering"],
      timezone: ["sea"],
      salaryMin: 1000,
      salaryMax: 5000,
      sort: "salary",
      page: 2,
      limit: 12,
    });
  });

  it("treats the salary range as unset exactly at the floor/ceiling boundary", () => {
    const query: JobFilters = {
      ...DEFAULT_JOB_FILTERS,
      filters: { ...DEFAULT_JOB_FILTERS.filters, salaryMin: 500, salaryMax: 8000 },
    };
    const params = buildJobListParams(query, 12);
    expect(params.salaryMin).toBeUndefined();
    expect(params.salaryMax).toBeUndefined();
  });
});

const validJobListResponseDto = {
  jobs: [],
  pagination: { page: 1, limit: 12, total: 0, pages: 0 },
  facets: { jobType: {}, timezone: {}, seniority: {}, category: {} },
};

describe("listJobs", () => {
  it("maps translated params into the repository call and returns the mapped response", async () => {
    repository.jobsRepository.list.mockResolvedValueOnce(validJobListResponseDto);

    const result = await listJobs(DEFAULT_JOB_FILTERS, 12);

    expect(repository.jobsRepository.list).toHaveBeenCalledWith(
      buildJobListParams(DEFAULT_JOB_FILTERS, 12),
      undefined
    );
    expect(result).toEqual(validJobListResponseDto);
  });

  it("throws a ValidationError when the response doesn't match the expected shape", async () => {
    repository.jobsRepository.list.mockResolvedValueOnce({ jobs: "not-an-array" });
    await expect(listJobs(DEFAULT_JOB_FILTERS, 12)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("getJob", () => {
  it("forwards the id and signal to the repository", async () => {
    const controller = new AbortController();
    repository.jobsRepository.getById.mockResolvedValueOnce({
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
    });

    await getJob("job-1", { signal: controller.signal });

    expect(repository.jobsRepository.getById).toHaveBeenCalledWith("job-1", {
      signal: controller.signal,
    });
  });
});
