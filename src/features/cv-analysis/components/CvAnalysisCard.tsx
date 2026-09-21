import { useState } from "react";
import { Check, Copy, Minus, RefreshCw, Sparkles } from "lucide-react";
import {
  useCvAnalysis,
  useRegenerateCvAnalysis,
} from "@/features/cv-analysis/cv-analysis.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/core/errors/api-error";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";
import type { CvRecommendation } from "@/types/cv-analysis";

const RECOMMENDATION_LABEL: Record<CvRecommendation, string> = {
  ADVANCE: "Suggested: Advance",
  HOLD: "Suggested: Hold",
  REJECT: "Suggested: Reject",
};

// Same "shade, not a new hue, carries the tier" rule as scoreTier below —
// ADVANCE/HOLD stay in this card's existing brand/neutral palette, REJECT is
// the one genuinely different signal worth a distinct (but still muted, not
// alarming-red) color.
const RECOMMENDATION_CLASS: Record<CvRecommendation, string> = {
  ADVANCE: "bg-brand-50 text-brand-700",
  HOLD: "bg-neutral-100 text-neutral-600",
  REJECT: "bg-amber-50 text-amber-700",
};

const COPIED_FEEDBACK_MS = 1500;

const SuggestedQuestion = ({ question }: { question: string }) => {
  const [copied, setCopied] = useState(false);

  return (
    <li className="flex items-start justify-between gap-2 text-[12px] text-neutral-600">
      <span>&ldquo;{question}&rdquo;</span>
      <button
        aria-label="Copy question"
        className="flex-shrink-0 rounded-4 text-neutral-300 transition-colors hover:text-neutral-600 focus-visible:shadow-focus focus-visible:outline-none"
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(question);
          setCopied(true);
          setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
        }}
      >
        {copied ? (
          <Check className="text-brand-600" size={12} />
        ) : (
          <Copy size={12} />
        )}
      </button>
    </li>
  );
};

const NO_RESUME_STATUS = 400;

interface CvAnalysisCardProps {
  applicationId: string;
  talentName: string;
}

// Both real tiers stay in the brand-green family (900 vs 600), not a
// second emerald hue for "Strong fit" — same "shade carries the hierarchy,
// not a new hue" fix as TIER_BADGE_CLASS (src/utils/color.ts) and Badge's
// "success" variant (src/components/ui/badge.tsx).
const scoreTier = (
  score: number
): { text: string; bar: string; label: string } => {
  if (score >= 75) {
    return {
      text: "text-brand-900",
      bar: "bg-brand-900",
      label: "Strong fit",
    };
  }
  if (score >= 50) {
    return {
      text: "text-brand-600",
      bar: "bg-brand-500",
      label: "Moderate fit",
    };
  }
  return { text: "text-neutral-500", bar: "bg-neutral-400", label: "Weak fit" };
};

const CvAnalysisSkeleton = () => (
  <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-16 w-full rounded-10" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <div className="grid grid-cols-2 gap-3 pt-1">
      <Skeleton className="h-16 rounded-10" />
      <Skeleton className="h-16 rounded-10" />
    </div>
  </div>
);

export const CvAnalysisCard = ({
  applicationId,
  talentName,
}: CvAnalysisCardProps) => {
  const { data, isFetching, isError, error, fetchStatus, refetch } =
    useCvAnalysis(applicationId);
  const regenerateMutation = useRegenerateCvAnalysis(applicationId);

  const hasRequested = fetchStatus !== "idle" || !!data;

  if (!hasRequested) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-16 border border-neutral-100 bg-white px-4 py-3.5">
        {/* min-w-0 so a long talent name wraps within this text block
            instead of forcing the button (flex-shrink-0) to get squeezed
            or the row to overflow on a narrow card. */}
        <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-neutral-500">
          <Sparkles className="flex-shrink-0 text-brand-600" size={15} />
          <span>
            See how {talentName}&rsquo;s CV stacks up against this role.
          </span>
        </div>
        <Button
          className="flex-shrink-0"
          size="sm"
          variant="outline"
          onClick={() => refetch()}
        >
          Analyze with AI
        </Button>
      </div>
    );
  }

  if (isFetching) {
    return <CvAnalysisSkeleton />;
  }

  if (isError) {
    const noResume =
      error instanceof ApiError && error.status === NO_RESUME_STATUS;
    return (
      <div className="flex items-center justify-between gap-3 rounded-16 border border-neutral-100 bg-white px-4 py-3.5 text-[12.5px] text-neutral-400">
        <span className="min-w-0">
          {noResume
            ? `${talentName} hasn't uploaded a CV.`
            : "Couldn't analyze this CV."}
        </span>
        {!noResume && (
          <button
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw size={11} /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  const tier = scoreTier(data.fitScore);

  return (
    <div className="animate-fade-up space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-900">
          <Sparkles className="flex-shrink-0 text-brand-600" size={15} />
          AI CV Analysis
        </h3>
        {/* Null for analyses generated before this field existed — no badge
            rather than a misleading default, since there's no real signal
            to show. */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {data.recommendation && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                RECOMMENDATION_CLASS[data.recommendation]
              )}
            >
              {RECOMMENDATION_LABEL[data.recommendation]}
            </span>
          )}
          <button
            aria-label="Regenerate analysis"
            className="rounded-6 grid h-6 w-6 flex-shrink-0 place-items-center text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={regenerateMutation.isPending}
            title="Regenerate — runs the analysis again and replaces this one"
            type="button"
            onClick={() => regenerateMutation.mutate()}
          >
            <RefreshCw
              className={cn(regenerateMutation.isPending && "animate-spin")}
              size={12}
            />
          </button>
        </div>
      </div>

      {regenerateMutation.isError && (
        <p aria-live="polite" className="text-[11.5px] text-red-500">
          Couldn&rsquo;t regenerate — showing the previous analysis.
        </p>
      )}

      {/* Visible text, not just the badge's hover title — the one-sentence
          reason is the actual "what supports this" content a recruiter
          needs, not a decorative detail worth hiding behind a mouseover. */}
      {data.recommendation && data.recommendationReason && (
        <p className="text-[11.5px] text-neutral-400">
          {data.recommendationReason}
        </p>
      )}

      <div className="flex items-center gap-3 rounded-10 bg-neutral-50 p-3">
        <span
          className={cn(
            "flex-shrink-0 text-[26px] font-semibold leading-none",
            tier.text
          )}
        >
          {data.fitScore}%
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn("text-[11.5px] font-medium", tier.text)}>
            {tier.label}
          </p>
          <div
            aria-label={`Fit score: ${data.fitScore} out of 100 — ${tier.label}`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={data.fitScore}
            className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
            role="progressbar"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                tier.bar
              )}
              style={{ width: `${data.fitScore}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-[12.5px] leading-relaxed text-neutral-600">
        {data.summary}
      </p>

      {(data.strengths.length > 0 || data.gaps.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* brand, not emerald — this already sits next to "Gaps" in
              amber below, a real 2-color positive/caution contrast; brand
              is this app's actual "positive" hue, so emerald here was a
              second, unrelated green rather than adding distinction. */}
          {data.strengths.length > 0 && (
            <div className="rounded-10 bg-brand-50/60 p-2.5">
              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-brand-700">
                Strengths
              </p>
              <ul className="space-y-1">
                {data.strengths.map((s, i) => (
                  <li
                    className="flex items-start gap-1 text-[12px] text-neutral-700"
                    key={`${i}-${s}`}
                  >
                    <Check
                      className="mt-0.5 flex-shrink-0 text-brand-600"
                      size={11}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.gaps.length > 0 && (
            <div className="rounded-10 bg-amber-50/60 p-2.5">
              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-700">
                Gaps
              </p>
              <ul className="space-y-1">
                {data.gaps.map((g, i) => (
                  <li
                    className="flex items-start gap-1 text-[12px] text-neutral-700"
                    key={`${i}-${g}`}
                  >
                    <Minus
                      className="mt-0.5 flex-shrink-0 text-amber-600"
                      size={11}
                    />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {data.suggestedQuestions.length > 0 && (
        <div className="border-t border-neutral-100 pt-3">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
            Questions worth asking
          </p>
          <ul className="space-y-1.5">
            {data.suggestedQuestions.map((q, i) => (
              <SuggestedQuestion key={`${i}-${q}`} question={q} />
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10.5px] text-neutral-400">
        AI-generated from the CV and job description (
        {timeAgoLong(data.createdAt)}) — always a starting point, never the
        final word.
      </p>
    </div>
  );
};
