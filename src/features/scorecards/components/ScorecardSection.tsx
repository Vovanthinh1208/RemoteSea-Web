import { useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScorecards } from "@/features/scorecards/scorecard.queries";
import { ScorecardForm } from "@/features/scorecards/components/ScorecardForm";
import {
  breakdownByRecommendation,
  formatAverage,
  SCORECARD_CRITERIA,
  SCORECARD_RECOMMENDATIONS,
} from "@/features/scorecards/scorecard.utils";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { Scorecard, ScorecardRecommendation } from "@/types/scorecard";
import { useTranslation } from "@/i18n/useTranslation";

const RECOMMENDATION_VARIANTS: Record<ScorecardRecommendation, BadgeVariant> = {
  STRONGLY_RECOMMEND: "success",
  RECOMMEND: "positive",
  NEUTRAL: "muted",
  NOT_RECOMMEND: "warning",
  STRONGLY_NOT_RECOMMEND: "warning",
};

// Matches each badge variant's dot to the same hue used above, so the
// breakdown row and the per-scorecard badges read as the same color
// language rather than two unrelated palettes.
const RECOMMENDATION_DOT_COLOR: Record<ScorecardRecommendation, string> = {
  STRONGLY_RECOMMEND: "bg-brand-900",
  RECOMMEND: "bg-brand-500",
  NEUTRAL: "bg-neutral-400",
  NOT_RECOMMEND: "bg-amber-500",
  STRONGLY_NOT_RECOMMEND: "bg-amber-500",
};

// PB65 AC3: each interviewer's per-criterion scores and written feedback.
const ScorecardDetails = ({ scorecard }: { scorecard: Scorecard }) => {
  const { t } = useTranslation("scorecards");
  const hasRatings = SCORECARD_CRITERIA.some(
    ({ field }) => scorecard[field] !== null
  );
  return (
    <div className="mt-1.5 space-y-1.5 text-[12.5px] leading-relaxed text-neutral-600">
      {hasRatings && (
        <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px]">
          {SCORECARD_CRITERIA.map(({ field }) => (
            <div className="flex gap-1" key={field}>
              <dt className="text-neutral-500">{t(`criteria.${field}`)}</dt>
              <dd className="font-medium text-neutral-800">
                {scorecard[field] ?? "–"}/5
              </dd>
            </div>
          ))}
        </dl>
      )}
      {scorecard.strengths && (
        <p>
          <span className="font-medium text-neutral-700">
            {t("section.strengths")}:
          </span>{" "}
          {scorecard.strengths}
        </p>
      )}
      {scorecard.improvements && (
        <p>
          <span className="font-medium text-neutral-700">
            {t("section.improvements")}:
          </span>{" "}
          {scorecard.improvements}
        </p>
      )}
      {scorecard.note && (
        <p>
          <span className="font-medium text-neutral-700">
            {t("section.note")}:
          </span>{" "}
          {scorecard.note}
        </p>
      )}
    </div>
  );
};

const SCORECARD_SKELETON_COUNT = 2;

const ScorecardSectionSkeleton = () => (
  <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3.5 w-24" />
    </div>
    <div className="space-y-2.5">
      {Array.from({ length: SCORECARD_SKELETON_COUNT }, (_, i) => (
        <div
          className="space-y-1.5 rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
          key={i}
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

interface ScorecardSectionProps {
  applicationId: string;
  talentName: string;
  interviewOccurred: boolean;
  eligibleReviewerCount?: number;
}

export const ScorecardSection = ({
  applicationId,
  talentName,
  interviewOccurred,
  eligibleReviewerCount,
}: ScorecardSectionProps) => {
  const { t } = useTranslation("scorecards");
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useScorecards(applicationId);

  if (isLoading) {
    return <ScorecardSectionSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-between rounded-16 border border-neutral-100 bg-white px-4 py-3.5 text-[12.5px] text-neutral-400">
        {t("section.loadError")}
        <button
          className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCw size={11} /> {t("common.actions.retryShort")}
        </button>
      </div>
    );
  }

  const myScorecard = data.scorecards.find(
    (scorecard) => scorecard.authorId === user?.id
  );
  const alreadySubmitted = !!myScorecard;

  if (data.scorecards.length === 0 && !interviewOccurred) {
    return null;
  }

  const breakdown = breakdownByRecommendation(data.scorecards);

  return (
    <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <Users className="flex-shrink-0 text-neutral-400" size={15} />
        <h3 className="text-[13.5px] font-medium text-neutral-900">
          {t("section.title")}
        </h3>
      </div>

      {data.summary.total > 0 &&
        (eligibleReviewerCount !== undefined ? (
          <div className="space-y-2 rounded-10 bg-neutral-50 p-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[22px] font-semibold leading-none text-neutral-900">
                  {data.summary.hireCount}/{data.summary.total}
                </span>
                <p className="mt-1 text-[11.5px] text-neutral-500">
                  {t("section.recommendHire")}
                </p>
              </div>
              <span className="flex-shrink-0 text-[11.5px] text-neutral-500">
                {t("section.submitted", {
                  done: data.summary.total,
                  total: eligibleReviewerCount,
                })}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-neutral-100 pt-2">
              <div>
                <span className="text-[18px] font-semibold leading-none text-neutral-900">
                  {formatAverage(data.summary.averages.overall)}
                </span>
                <span className="text-[11.5px] text-neutral-500">
                  {t("section.averageOf5")}
                </span>
                <p className="mt-1 text-[11.5px] text-neutral-500">
                  {t("section.averageOverall")}
                </p>
              </div>
              <dl
                aria-label={t("section.criteriaAverages")}
                className="space-y-0.5 text-right text-[11.5px]"
              >
                {SCORECARD_CRITERIA.map(({ field, average }) => (
                  <div className="flex justify-end gap-1.5" key={field}>
                    <dt className="text-neutral-500">
                      {t(`criteria.${field}`)}
                    </dt>
                    <dd className="font-medium text-neutral-800">
                      {formatAverage(data.summary.averages[average])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-100 pt-2 text-[11.5px] text-neutral-500">
              {SCORECARD_RECOMMENDATIONS.map((recommendation) => (
                <span
                  className="inline-flex items-center gap-1.5"
                  key={recommendation}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      RECOMMENDATION_DOT_COLOR[recommendation]
                    )}
                  />
                  {t(`rec.${recommendation}`)}{" "}
                  <span className="font-medium text-neutral-700">
                    {breakdown[recommendation]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-neutral-500">
            {t("section.hireLine", {
              hire: data.summary.hireCount,
              total: data.summary.total,
            })}
          </span>
        ))}

      {eligibleReviewerCount !== undefined && myScorecard && (
        <div className="rounded-10 border border-brand-100 bg-brand-50/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-brand-700">
              {t("section.yourFeedback")}
            </span>
            <Badge
              variant={RECOMMENDATION_VARIANTS[myScorecard.recommendation]}
            >
              {t(`rec.${myScorecard.recommendation}`)}
            </Badge>
          </div>
          <ScorecardDetails scorecard={myScorecard} />
        </div>
      )}

      {data.scorecards.length > 0 && (
        <ul className="space-y-2">
          {data.scorecards.map((scorecard) => (
            <li
              className="rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
              key={scorecard.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[12.5px] font-medium text-neutral-800">
                  {scorecard.author.name ?? t("section.member")}
                </span>
                <Badge
                  className="flex-shrink-0"
                  variant={RECOMMENDATION_VARIANTS[scorecard.recommendation]}
                >
                  {t(`rec.${scorecard.recommendation}`)}
                </Badge>
              </div>
              <ScorecardDetails scorecard={scorecard} />
            </li>
          ))}
        </ul>
      )}

      {!alreadySubmitted && interviewOccurred && (
        <div
          className={
            data.scorecards.length > 0
              ? "border-t border-neutral-100 pt-3"
              : undefined
          }
        >
          {open ? (
            <ScorecardForm
              applicationId={applicationId}
              talentName={talentName}
              onCancel={() => setOpen(false)}
              onSuccess={() => setOpen(false)}
            />
          ) : (
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
            >
              {t("section.add")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
