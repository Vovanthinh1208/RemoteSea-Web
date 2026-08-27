import { useState } from "react";
import { Check, Copy, Minus, RefreshCw, Sparkles } from "lucide-react";
import { useCvAnalysis } from "@/features/cv-analysis/cv-analysis.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/core/errors/api-error";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";

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

const scoreTier = (
  score: number
): { text: string; bar: string; label: string } => {
  if (score >= 75) {
    return {
      text: "text-emerald-600",
      bar: "bg-emerald-500",
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

  const hasRequested = fetchStatus !== "idle" || !!data;

  if (!hasRequested) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-16 border border-neutral-100 bg-white px-4 py-3.5">
        <div className="flex items-center gap-2 text-[12.5px] text-neutral-500">
          <Sparkles className="flex-shrink-0 text-brand-600" size={15} />
          See how {talentName}&rsquo;s CV stacks up against this role.
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
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
        {noResume
          ? `${talentName} hasn't uploaded a CV.`
          : "Couldn't analyze this CV."}
        {!noResume && (
          <button
            className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
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
    <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
      <h3 className="flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-900">
        <Sparkles className="flex-shrink-0 text-brand-600" size={15} />
        AI CV Analysis
      </h3>

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
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className={cn("h-full rounded-full", tier.bar)}
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
          {data.strengths.length > 0 && (
            <div className="rounded-10 bg-emerald-50/60 p-2.5">
              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">
                Strengths
              </p>
              <ul className="space-y-1">
                {data.strengths.map((s) => (
                  <li
                    className="flex items-start gap-1 text-[12px] text-neutral-700"
                    key={s}
                  >
                    <Check
                      className="mt-0.5 flex-shrink-0 text-emerald-600"
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
                {data.gaps.map((g) => (
                  <li
                    className="flex items-start gap-1 text-[12px] text-neutral-700"
                    key={g}
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
            {data.suggestedQuestions.map((q) => (
              <SuggestedQuestion key={q} question={q} />
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
