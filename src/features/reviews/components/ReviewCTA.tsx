import { useState } from "react";
import { Check, MessageSquareText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useReviewEligibility } from "@/features/reviews/reviews.queries";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { reviewKeys } from "@/core/query/query-keys";

interface ReviewCTAProps {
  applicationId: string;
  revieweeName: string;
}

export const ReviewCTA = ({ applicationId, revieweeName }: ReviewCTAProps) => {
  const [open, setOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const { data, isLoading, isError } = useReviewEligibility(applicationId);
  const queryClient = useQueryClient();

  if (isLoading) {
    return <Skeleton className="h-14 w-full rounded-16" />;
  }
  if (isError || !data) {
    return null;
  }

  if (data.alreadyReviewed || justSubmitted) {
    return (
      <div className="flex items-center gap-2 rounded-16 border border-neutral-100 bg-neutral-50 px-4 py-3 text-[13px] text-neutral-600">
        <Check className="flex-shrink-0 text-brand-600" size={15} />
        You reviewed this interaction.
      </div>
    );
  }

  if (!data.eligible || !data.direction) {
    return null;
  }

  if (open) {
    return (
      <ReviewForm
        applicationId={applicationId}
        direction={data.direction}
        revieweeName={revieweeName}
        onCancel={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          setJustSubmitted(true);
          if (data.revieweeId) {
            void queryClient.invalidateQueries({
              queryKey: reviewKeys.forUserPrefix(data.revieweeId),
            });
          }
        }}
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-16 border border-brand-100 bg-brand-50/60 p-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <MessageSquareText className="flex-shrink-0 text-brand-600" size={16} />
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-neutral-900">
            Your interview with {revieweeName} is complete.
          </p>
          <p className="text-[12px] text-neutral-500">Share your experience.</p>
        </div>
      </div>
      <Button
        className="flex-shrink-0"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
      >
        Write a review
      </Button>
    </div>
  );
};
