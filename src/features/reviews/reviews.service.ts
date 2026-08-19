import type { RequestOptions } from "@/core/http/request-config";
import { reviewsRepository } from "@/features/reviews/reviews.repository";
import {
  toReviewEligibility,
  toUserReviewsResponse,
} from "@/features/reviews/reviews.mapper";
import type {
  CreateReviewPayload,
  ReviewEligibility,
  ReviewListItem,
  UserReviewsResponse,
} from "@/types/review";

export const getReviewEligibility = async (
  applicationId: string,
  opts?: RequestOptions
): Promise<ReviewEligibility> =>
  toReviewEligibility(
    await reviewsRepository.getEligibility(applicationId, opts)
  );

export const createReview = async (
  payload: CreateReviewPayload
): Promise<ReviewListItem> => reviewsRepository.create(payload);

export const listUserReviews = async (
  userId: string,
  page: number,
  limit: number,
  opts?: RequestOptions
): Promise<UserReviewsResponse> =>
  toUserReviewsResponse(
    await reviewsRepository.listForUser(userId, page, limit, opts)
  );
