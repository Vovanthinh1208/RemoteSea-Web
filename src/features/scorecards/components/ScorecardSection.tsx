import { useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScorecards } from "@/features/scorecards/scorecard.queries";
import { ScorecardForm } from "@/features/scorecards/components/ScorecardForm";
import { breakdownByRecommendation } from "@/features/scorecards/scorecard.utils";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { ScorecardRecommendation } from "@/types/scorecard";

const RECOMMENDATION_LABELS: Record<ScorecardRecommendation, string> = {
  STRONG_YES: "Strong yes",
  YES: "Yes",
  NO: "No",
  STRONG_NO: "Strong no",
};

const RECOMMENDATION_VARIANTS: Record<ScorecardRecommendation, BadgeVariant> = {
  STRONG_YES: "success",
  YES: "positive",
  NO: "warning",
  STRONG_NO: "warning",
};

// Matches each badge variant's dot to the same hue used above, so the
// breakdown row and the per-scorecard badges read as the same color
// language rather than two unrelated palettes.
const RECOMMENDATION_DOT_COLOR: Record<ScorecardRecommendation, string> = {
  STRONG_YES: "bg-brand-900",
  YES: "bg-brand-500",
  NO: "bg-amber-500",
  STRONG_NO: "bg-amber-500",
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
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useScorecards(applicationId);

  if (isLoading) {
    return <ScorecardSectionSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-between rounded-16 border border-neutral-100 bg-white px-4 py-3.5 text-[12.5px] text-neutral-400">
        Couldn't load team feedback.
        <button
          className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCw size={11} /> Retry
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
          Team feedback
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
                  Recommend hire
                </p>
              </div>
              <span className="flex-shrink-0 text-[11.5px] text-neutral-500">
                {data.summary.total}/{eligibleReviewerCount} submitted
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-100 pt-2 text-[11.5px] text-neutral-500">
              {(["STRONG_YES", "YES", "NO", "STRONG_NO"] as const).map(
                (recommendation) => (
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
                    {RECOMMENDATION_LABELS[recommendation]}{" "}
                    <span className="font-medium text-neutral-700">
                      {breakdown[recommendation]}
                    </span>
                  </span>
                )
              )}
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-neutral-500">
            {data.summary.hireCount}/{data.summary.total} recommend hire
          </span>
        ))}

      {eligibleReviewerCount !== undefined && myScorecard && (
        <div className="rounded-10 border border-brand-100 bg-brand-50/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-brand-700">
              Your feedback
            </span>
            <Badge
              variant={RECOMMENDATION_VARIANTS[myScorecard.recommendation]}
            >
              {RECOMMENDATION_LABELS[myScorecard.recommendation]}
            </Badge>
          </div>
          {myScorecard.note && (
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-700">
              &ldquo;{myScorecard.note}&rdquo;
            </p>
          )}
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
                  {scorecard.author.name ?? "Team member"}
                </span>
                <Badge
                  className="flex-shrink-0"
                  variant={RECOMMENDATION_VARIANTS[scorecard.recommendation]}
                >
                  {RECOMMENDATION_LABELS[scorecard.recommendation]}
                </Badge>
              </div>
              {scorecard.note && (
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-600">
                  {scorecard.note}
                </p>
              )}
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
              Add feedback
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
