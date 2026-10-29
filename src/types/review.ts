import type { PaginationMeta } from "@/core/pagination/pagination";

export type ReviewDirection = "TALENT_TO_EMPLOYER" | "EMPLOYER_TO_TALENT";

// PB70 AC3.2: why a review isn't (or is no longer) possible.
export type ReviewIneligibleReason =
  | "NO_INTERVIEW"
  | "INTERVIEW_NOT_CONFIRMED"
  | "INTERVIEW_NOT_YET_HELD"
  | "ALREADY_REVIEWED";

export type ReviewEligibility = {
  eligible: boolean;
  reason: ReviewIneligibleReason | null;
  direction: ReviewDirection | null;
  revieweeId: string | null;
  alreadyReviewed: boolean;
};

export type ReviewListItem = {
  id: string;
  direction: ReviewDirection;
  overallRating: number;
  communicationRating: number | null;
  professionalismRating: number | null;
  interviewProcessRating: number | null;
  reliabilityRating: number | null;
  title: string | null;
  comment: string | null;
  createdAt: string;
  reviewer: { name: string | null; employer: { companyName: string } | null };
};

export type ReviewRatingBreakdown = {
  communication: number | null;
  professionalism: number | null;
  interviewProcess: number | null;
  reliability: number | null;
};

export type UserReviewsResponse = {
  averageRating: number | null;
  totalReviews: number;
  // PB72 AC2: published reviews per star rating.
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  ratings: ReviewRatingBreakdown;
  reviews: ReviewListItem[];
  pagination: PaginationMeta;
};

export type CreateReviewPayload = {
  applicationId: string;
  overallRating: number;
  communicationRating?: number;
  professionalismRating?: number;
  interviewProcessRating?: number;
  reliabilityRating?: number;
  // PB71 AC3.
  title: string;
  comment: string;
};

// PB72 AC3.
export type ReviewSort = "newest" | "oldest";

export type ReviewListFilter = { rating?: number; sort: ReviewSort };
