import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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

const ALREADY_SUBMITTED_STATUS = 409;
const NOT_ELIGIBLE_STATUS = 403;

const RECOMMENDATION_OPTIONS: {
  value: ScorecardRecommendation;
  label: string;
}[] = [
  { value: "STRONG_YES", label: "Strong yes" },
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "STRONG_NO", label: "Strong no" },
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
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScorecardFormValues>({
    resolver: zodResolver(scorecardFormSchema),
  });
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
        success: "Feedback submitted.",
        error: "Something went wrong. Please try again.",
        onError: (err) => {
          if (!(err instanceof ApiError)) return undefined;
          if (err.status === ALREADY_SUBMITTED_STATUS) {
            return "You already submitted feedback for this interview.";
          }
          if (err.status === NOT_ELIGIBLE_STATUS) {
            return "Not eligible to submit feedback for this interview yet.";
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
          Your read on {talentName}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-neutral-500">
          Only visible to your team, never to the candidate.
        </p>
      </div>

      <Controller
        control={control}
        name="recommendation"
        render={({ field }) => (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-neutral-700">
              Recommendation
            </p>
            <div className="flex flex-wrap gap-1.5">
              {RECOMMENDATION_OPTIONS.map(({ value, label }) => (
                <button
                  aria-pressed={field.value === value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    field.value === value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  )}
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      />
      {errors.recommendation && (
        <p className="text-[12px] text-red-600">
          {errors.recommendation.message}
        </p>
      )}

      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="scorecard-note"
        >
          Note <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="scorecard-note"
          maxLength={2000}
          placeholder="Sharp on system design, weak on the behavioral round…"
          rows={4}
          {...register("note")}
        />
        {errors.note && (
          <p className="mt-1 text-[12px] text-red-600">{errors.note.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={createScorecardMutation.isPending}
          isLoading={createScorecardMutation.isPending}
          type="submit"
        >
          Submit feedback
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
