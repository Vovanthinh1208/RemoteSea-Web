import type { PaginationMeta } from "@/core/pagination/pagination";

export type ReviewDirection = "TALENT_TO_EMPLOYER" | "EMPLOYER_TO_TALENT";

export type ReviewEligibility = {
  eligible: boolean;
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
  comment?: string;
};
