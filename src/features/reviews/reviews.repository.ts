import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CreateReviewRequestDto,
  ReviewEligibilityDto,
  UserReviewsResponseDto,
} from "@/features/reviews/reviews.dto";
import type { ReviewListItem } from "@/types/review";

export const reviewsRepository = {
  getEligibility: async (
    applicationId: string,
    opts?: RequestOptions
  ): Promise<ReviewEligibilityDto> => {
    const { data } = await apiClient.get<ReviewEligibilityDto>(
      `/reviews/eligibility/${applicationId}`,
      { signal: opts?.signal }
    );
    return data;
  },

  create: async (payload: CreateReviewRequestDto): Promise<ReviewListItem> => {
    const { data } = await apiClient.post<ReviewListItem>("/reviews", payload);
    return data;
  },

  listForUser: async (
    userId: string,
    page: number,
    limit: number,
    opts?: RequestOptions
  ): Promise<UserReviewsResponseDto> => {
    const { data } = await apiClient.get<UserReviewsResponseDto>(
      `/reviews/user/${userId}`,
      { params: { page, limit }, signal: opts?.signal }
    );
    return data;
  },
};
