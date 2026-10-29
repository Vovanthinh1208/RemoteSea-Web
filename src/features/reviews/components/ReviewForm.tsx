import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRatingInput } from "@/components/shared/StarRatingInput";
import { Button } from "@/components/ui/button";
import {
  TEXT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { useCreateReview } from "@/features/reviews/reviews.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import {
  reviewFormSchema,
  type ReviewFormValues,
} from "@/features/reviews/reviews.schemas";
import type { ReviewDirection } from "@/types/review";
import { useTranslation } from "@/i18n/useTranslation";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";

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
  { key: CategoryKey; labelKey: string }[]
> = {
  TALENT_TO_EMPLOYER: [
    { key: "communicationRating", labelKey: "form.cat.communication" },
    { key: "interviewProcessRating", labelKey: "form.cat.interviewProcess" },
    { key: "professionalismRating", labelKey: "form.cat.professionalism" },
  ],
  EMPLOYER_TO_TALENT: [
    { key: "communicationRating", labelKey: "form.cat.communication" },
    { key: "professionalismRating", labelKey: "form.cat.professionalism" },
    { key: "reliabilityRating", labelKey: "form.cat.reliability" },
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
  const { t } = useTranslation("reviews");
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  useRevalidateOnLocaleChange(form);
  const createReviewMutation = useCreateReview();
  const runWithToast = useToastMutation();

  const onSubmit = (values: ReviewFormValues) =>
    runWithToast(
      () =>
        createReviewMutation
          .mutateAsync({ applicationId, ...values })
          .then(onSuccess),
      {
        success: t("form.success"),
        error: t("form.failed"),
        onError: (err) => {
          if (!(err instanceof ApiError)) return undefined;
          if (err.status === ALREADY_REVIEWED_STATUS) {
            return t("form.already");
          }
          if (err.status === NOT_ELIGIBLE_STATUS) {
            return t("form.notEligible");
          }
          if (err.code === "REVIEW_CONTENT_REJECTED") {
            return t("form.contentRejected");
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
          {t("form.title", { name: revieweeName })}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-neutral-500">
          {t("form.subtitle")}
        </p>
      </div>

      <Controller
        control={control}
        name="overallRating"
        render={({ field }) => (
          <StarRatingInput
            label={t("form.overall")}
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

      {CATEGORY_FIELDS[direction].map(({ key, labelKey }) => (
        <Controller
          control={control}
          key={key}
          name={key}
          render={({ field }) => (
            <StarRatingInput
              label={t(labelKey)}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      ))}

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="review-title"
        >
          {t("form.reviewTitle")}
        </label>
        <input
          className={TEXT_INPUT_CLASS}
          id="review-title"
          maxLength={120}
          placeholder={t("form.reviewTitlePlaceholder")}
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-[12px] text-red-600">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="review-comment"
        >
          {t("form.comment")}{" "}
          <span className="text-neutral-400">{t("form.commentHint")}</span>
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="review-comment"
          maxLength={2000}
          placeholder={t("form.commentPlaceholder")}
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
          {t("form.submit")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </form>
  );
};
