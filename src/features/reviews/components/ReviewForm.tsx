import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRatingInput } from "@/components/shared/StarRatingInput";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useCreateReview } from "@/features/reviews/reviews.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import {
  reviewFormSchema,
  type ReviewFormValues,
} from "@/features/reviews/reviews.schemas";
import type { ReviewDirection } from "@/types/review";

type CategoryKey =
  | "communicationRating"
  | "professionalismRating"
  | "interviewProcessRating"
  | "reliabilityRating";

// reviewing a talent never sees "Interview process" (that's the talent's
// experience of the employer's process, not the reverse), and a talent
// reviewing an employer never sees "Reliability" (that's about the talent
// showing up, not the employer). Mirrors the backend's own direction check.
const CATEGORY_FIELDS: Record<
  ReviewDirection,
  { key: CategoryKey; label: string }[]
> = {
  TALENT_TO_EMPLOYER: [
    { key: "communicationRating", label: "Communication" },
    { key: "interviewProcessRating", label: "Interview process" },
    { key: "professionalismRating", label: "Professionalism" },
  ],
  EMPLOYER_TO_TALENT: [
    { key: "communicationRating", label: "Communication" },
    { key: "professionalismRating", label: "Professionalism" },
    { key: "reliabilityRating", label: "Reliability" },
  ],
};

const ALREADY_REVIEWED_STATUS = 409;
const NOT_ELIGIBLE_STATUS = 403;

interface ReviewFormProps {
  applicationId: string;
  direction: ReviewDirection;
  revieweeName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ReviewForm = ({
  applicationId,
  direction,
  revieweeName,
  onCancel,
  onSuccess,
}: ReviewFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
  });
  const createReviewMutation = useCreateReview();
  const runWithToast = useToastMutation();

  const onSubmit = (values: ReviewFormValues) =>
    runWithToast(
      () =>
        createReviewMutation
          .mutateAsync({
            applicationId,
            ...values,
            comment: values.comment || undefined,
          })
          .then(onSuccess),
      {
        success: "Review submitted successfully.",
        error: "Something went wrong. Please try again.",
        onError: (err) => {
          if (!(err instanceof ApiError)) return undefined;
          if (err.status === ALREADY_REVIEWED_STATUS) {
            return "You have already reviewed this interaction.";
          }
          if (err.status === NOT_ELIGIBLE_STATUS) {
            return "You are not eligible to review this interaction.";
          }
          return undefined;
        },
      }
    );

  return (
    <form
      className="space-y-4 rounded-16 border border-neutral-200 bg-white p-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900">
          Review {revieweeName}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-neutral-500">
          Your feedback helps other members of RemoteSEA.
        </p>
      </div>

      <Controller
        control={control}
        name="overallRating"
        render={({ field }) => (
          <StarRatingInput
            label="Overall rating"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {errors.overallRating && (
        <p className="text-[12px] text-red-600">
          {errors.overallRating.message}
        </p>
      )}

      {CATEGORY_FIELDS[direction].map(({ key, label }) => (
        <Controller
          control={control}
          key={key}
          name={key}
          render={({ field }) => (
            <StarRatingInput
              label={label}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      ))}

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="review-comment"
        >
          Comment <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="review-comment"
          maxLength={2000}
          placeholder="Tell us about your experience…"
          rows={4}
          {...register("comment")}
        />
        {errors.comment && (
          <p className="mt-1 text-[12px] text-red-600">
            {errors.comment.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={createReviewMutation.isPending}
          isLoading={createReviewMutation.isPending}
          type="submit"
        >
          Submit review
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
