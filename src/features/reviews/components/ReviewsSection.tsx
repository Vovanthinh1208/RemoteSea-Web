import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { StarRating } from "@/components/shared/StarRating";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/features/jobs/components/Pagination";
import { useUserReviews } from "@/features/reviews/reviews.queries";
import { timeAgoLong } from "@/utils/time";
import type { ReviewListItem, ReviewRatingBreakdown } from "@/types/review";

const REVIEW_CARD_SKELETON_COUNT = 2;

// Same shape as the loaded content below (title, average-rating row, category
// bars, review rows) rather than one generic block — see ActivityFeed's
// identical reasoning: a shape-matched skeleton reads as "this is loading,"
// a generic bar just flickers.
const ReviewsSectionSkeleton = () => (
  <section className="rounded-20 border border-neutral-100 bg-white p-7">
    <Skeleton className="mb-4 h-5 w-24" />
    <div className="mb-5 flex items-center gap-3">
      <Skeleton className="h-[18px] w-24" />
      <Skeleton className="h-6 w-8" />
    </div>
    <Skeleton className="mb-5 h-20 w-full rounded-12" />
    {Array.from({ length: REVIEW_CARD_SKELETON_COUNT }, (_, i) => (
      <div
        className="space-y-2 border-b border-neutral-50 py-4 last:border-none"
        key={i}
      >
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-28" />
      </div>
    ))}
  </section>
);

const reviewerLabel = (review: ReviewListItem): string =>
  review.reviewer.employer?.companyName ??
  review.reviewer.name ??
  "RemoteSEA member";

const ReviewCard = ({ review }: { review: ReviewListItem }) => (
  <div className="border-b border-neutral-50 py-4 last:border-none">
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <StarRating value={review.overallRating} />
      <span className="text-[11.5px] text-neutral-400">
        {timeAgoLong(review.createdAt)}
      </span>
    </div>
    {review.comment && (
      <p className="text-[13.5px] leading-relaxed text-neutral-700">
        “{review.comment}”
      </p>
    )}
    <div className="mt-2 flex items-center gap-2">
      <CompanyLogo name={reviewerLabel(review)} size={20} />
      <p className="text-[12px] font-medium text-neutral-500">
        {reviewerLabel(review)}
      </p>
    </div>
  </div>
);

interface RatingBarProps {
  label: string;
  value: number | null;
}

const RatingBar = ({ label, value }: RatingBarProps) => (
  <div className="flex items-center gap-3">
    <span className="w-28 flex-shrink-0 text-[12.5px] text-neutral-500">
      {label}
    </span>
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
      <div
        className="h-full rounded-full bg-amber-400"
        style={{ width: `${((value ?? 0) / 5) * 100}%` }}
      />
    </div>
    <span className="w-7 flex-shrink-0 text-right text-[12.5px] font-medium text-neutral-700">
      {value ? value.toFixed(1) : "—"}
    </span>
  </div>
);

interface ReviewsSectionProps {
  userId: string;
  categories: readonly { key: keyof ReviewRatingBreakdown; label: string }[];
}

export const ReviewsSection = ({ userId, categories }: ReviewsSectionProps) => {
  const [page, setPage] = useState(1);
  // Reset to page 1 when viewing a different person's reviews. Both callers
  // (PublicTalentProfilePage, CompanyProfilePage) key this off a route param
  // that React Router re-renders in place rather than remounts, so paging to
  // page 3 on one profile and then navigating to a different one's — with no
  // full remount in between — otherwise carried the stale page number over,
  // requesting a page that may not exist for the new user. Reset-during-render
  // (not an effect), same pattern as navbar.tsx's route-change handling.
  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setPage(1);
  }
  const { data, isLoading, isError, refetch } = useUserReviews(userId, page);

  if (isLoading) {
    return <ReviewsSectionSkeleton />;
  }

  if (isError) {
    return (
      <section className="rounded-20 border border-neutral-100 bg-white p-7">
        <h2 className="mb-4 text-[17px] font-semibold text-neutral-900">
          Reviews
        </h2>
        <div className="flex items-center justify-between text-[12.5px] text-neutral-400">
          Couldn't load reviews.
          <button
            className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      </section>
    );
  }
  if (!data || data.totalReviews === 0) return null;

  return (
    <section className="rounded-20 border border-neutral-100 bg-white p-7">
      <h2 className="mb-4 text-[17px] font-semibold text-neutral-900">
        Reviews
      </h2>

      <div className="mb-5 flex items-center gap-3">
        <StarRating size={18} value={data.averageRating ?? 0} />
        <span className="text-[20px] font-semibold text-neutral-900">
          {data.averageRating?.toFixed(1) ?? "—"}
        </span>
        <span className="text-[13px] text-neutral-400">
          Based on {data.totalReviews}{" "}
          {data.totalReviews === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="mb-5 space-y-2 rounded-12 bg-neutral-50 p-4">
        {categories.map(({ key, label }) => (
          <RatingBar key={key} label={label} value={data.ratings[key]} />
        ))}
      </div>

      <div>
        {data.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <Pagination
        page={data.pagination.page}
        pages={data.pagination.pages}
        onPageChange={setPage}
      />
    </section>
  );
};
