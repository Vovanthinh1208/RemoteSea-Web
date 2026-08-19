import type {
  ReviewEligibilityDto,
  UserReviewsResponseDto,
} from "@/features/reviews/reviews.dto";
import type { ReviewEligibility, UserReviewsResponse } from "@/types/review";

export const toReviewEligibility = (
  dto: ReviewEligibilityDto
): ReviewEligibility => dto;

export const toUserReviewsResponse = (
  dto: UserReviewsResponseDto
): UserReviewsResponse => dto;
