import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThumbsDown, ThumbsUp } from "lucide-react";
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
  { value: "STRONG_YES", icon: ThumbsUp, filled: true },
  { value: "YES", icon: ThumbsUp, filled: false },
  { value: "NO", icon: ThumbsDown, filled: false },
  { value: "STRONG_NO", icon: ThumbsDown, filled: true },
];

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
          rows={4}
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
