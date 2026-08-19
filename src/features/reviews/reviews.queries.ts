import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReview,
  getReviewEligibility,
  listUserReviews,
} from "@/features/reviews/reviews.service";
import { useAuth } from "@/contexts/AuthContext";
import { reviewKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { CreateReviewPayload } from "@/types/review";

export const useReviewEligibility = (applicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: reviewKeys.eligibility(applicationId),
    queryFn: ({ signal }) => getReviewEligibility(applicationId, { signal }),
    enabled: !!user && !!applicationId,
    ...TIER.live,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: (_data, payload) => {
      // Flips alreadyReviewed for this application immediately (the CTA
      // depends on it), and refreshes whatever page(s) of the reviewee's
      // public review list are cached so a new review shows up without a
      // manual refresh.
      queryClient.invalidateQueries({
        queryKey: reviewKeys.eligibility(payload.applicationId),
      });
    },
    // Reviewee isn't known to the caller (it's server-derived) — the
    // eligibility invalidation above covers the CTA state; the reviewee's
    // own profile page will show the new review on its next natural
    // refetch (TIER.live's staleTime, or a revisit), same tradeoff already
    // accepted for cross-session staleness elsewhere in this app (see
    // useUpdateAdminEmployer's identical note).
  });
};

const REVIEWS_PER_PAGE = 20;

export const useUserReviews = (userId: string | undefined, page = 1) => {
  return useQuery({
    queryKey: reviewKeys.forUser(userId ?? "", page),
    queryFn: ({ signal }) =>
      listUserReviews(userId!, page, REVIEWS_PER_PAGE, { signal }),
    enabled: !!userId,
  });
};
