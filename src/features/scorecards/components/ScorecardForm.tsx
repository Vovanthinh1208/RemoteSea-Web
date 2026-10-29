import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/shared/FieldError";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { useCreateScorecard } from "@/features/scorecards/scorecard.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { cn } from "@/utils/cn";
import {
  scorecardFormSchema,
  type ScorecardFormValues,
} from "@/features/scorecards/scorecard.schemas";
import { SCORECARD_CRITERIA } from "@/features/scorecards/scorecard.utils";
import type { ScorecardRecommendation } from "@/types/scorecard";
import { useTranslation } from "@/i18n/useTranslation";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";

const ALREADY_SUBMITTED_STATUS = 409;
const NOT_ELIGIBLE_STATUS = 403;

const RECOMMENDATION_OPTIONS: {
  value: ScorecardRecommendation;
  icon: typeof ThumbsUp;
  filled: boolean;
}[] = [
  { value: "STRONGLY_RECOMMEND", icon: ThumbsUp, filled: true },
  { value: "RECOMMEND", icon: ThumbsUp, filled: false },
  { value: "NEUTRAL", icon: Minus, filled: false },
  { value: "NOT_RECOMMEND", icon: ThumbsDown, filled: false },
  { value: "STRONGLY_NOT_RECOMMEND", icon: ThumbsDown, filled: true },
];

const SCORES = [1, 2, 3, 4, 5] as const;

interface ScorecardFormProps {
  applicationId: string;
  talentName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ScorecardForm = ({
  applicationId,
  talentName,
  onCancel,
  onSuccess,
}: ScorecardFormProps) => {
  const { t } = useTranslation("scorecards");
  const form = useForm<ScorecardFormValues>({
    resolver: zodResolver(scorecardFormSchema),
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  useRevalidateOnLocaleChange(form);
  const createScorecardMutation = useCreateScorecard(applicationId);
  const runWithToast = useToastMutation();

  const onSubmit = (values: ScorecardFormValues) =>
    runWithToast(
      () =>
        createScorecardMutation
          .mutateAsync({
            technicalRating: values.technicalRating,
            communicationRating: values.communicationRating,
            cultureFitRating: values.cultureFitRating,
            strengths: values.strengths,
            improvements: values.improvements,
            recommendation: values.recommendation,
            note: values.note || undefined,
          })
          .then(onSuccess),
      {
        success: t("form.success"),
        error: t("form.failed"),
        onError: (err) => {
          if (!(err instanceof ApiError)) return undefined;
          if (err.status === ALREADY_SUBMITTED_STATUS) {
            return t("form.already");
          }
          if (err.status === NOT_ELIGIBLE_STATUS) {
            return t("form.notEligible");
          }
          return undefined;
        },
      }
    );

  return (
    // No card frame here — this form only ever renders embedded inside
    // ScorecardSection's own bordered card (single call site), so its own
    // border/bg/padding was just a second frame around the same white
    // background with no visual separation to show for it.
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900">
          {t("form.title", { name: talentName })}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-neutral-500">
          {t("form.hint")}
        </p>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-neutral-700">
          {t("form.ratingsLabel")}
        </legend>
        <div className="space-y-2">
          {SCORECARD_CRITERIA.map(({ field: name }) => (
            <Controller
              control={control}
              key={name}
              name={name}
              render={({ field }) => (
                <div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[12.5px] text-neutral-600">
                      {t(`criteria.${name}`)}
                    </span>
                    <div
                      aria-label={t(`criteria.${name}`)}
                      className="flex gap-1"
                      role="radiogroup"
                    >
                      {SCORES.map((score) => (
                        <button
                          aria-checked={field.value === score}
                          aria-label={t("form.ratingAria", {
                            criterion: t(`criteria.${name}`),
                            score,
                          })}
                          className={cn(
                            "h-8 w-8 rounded-8 border text-[12.5px] font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                            field.value === score
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                          )}
                          key={score}
                          role="radio"
                          type="button"
                          onClick={() => field.onChange(score)}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FieldError message={errors[name]?.message} />
                </div>
              )}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="scorecard-strengths"
        >
          {t("form.strengths")}
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="scorecard-strengths"
          maxLength={2000}
          placeholder={t("form.strengthsPlaceholder")}
          rows={3}
          {...register("strengths")}
        />
        <FieldError message={errors.strengths?.message} />
      </div>

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="scorecard-improvements"
        >
          {t("form.improvements")}
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="scorecard-improvements"
          maxLength={2000}
          placeholder={t("form.improvementsPlaceholder")}
          rows={3}
          {...register("improvements")}
        />
        <FieldError message={errors.improvements?.message} />
      </div>

      <Controller
        control={control}
        name="recommendation"
        render={({ field }) => (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-neutral-700">
              {t("form.recommendation")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {RECOMMENDATION_OPTIONS.map(({ value, icon: Icon, filled }) => (
                <button
                  aria-pressed={field.value === value}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                    field.value === value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  )}
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                >
                  <Icon
                    fill={filled ? "currentColor" : "none"}
                    size={13}
                    strokeWidth={filled ? 1.5 : 2}
                  />
                  {t(`rec.${value}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      />
      <FieldError message={errors.recommendation?.message} />

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="scorecard-note"
        >
          {t("form.note")}{" "}
          <span className="text-neutral-400">{t("form.optional")}</span>
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="scorecard-note"
          maxLength={2000}
          placeholder={t("form.notePlaceholder")}
          rows={2}
          {...register("note")}
        />
        <FieldError message={errors.note?.message} />
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={createScorecardMutation.isPending}
          isLoading={createScorecardMutation.isPending}
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
