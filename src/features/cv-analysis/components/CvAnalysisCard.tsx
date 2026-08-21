import { Check, Minus, RefreshCw, Sparkles } from "lucide-react";
import { useCvAnalysis } from "@/features/cv-analysis/cv-analysis.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/core/errors/api-error";
import { cn } from "@/utils/cn";

const NO_RESUME_STATUS = 400;

interface CvAnalysisCardProps {
  applicationId: string;
  talentName: string;
}

const scoreColor = (score: number): string => {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-brand-600";
  return "text-neutral-500";
};

const CvAnalysisSkeleton = () => (
  <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-6 w-12" />
    </div>
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

  // enabled: false on the query itself (see cv-analysis.queries.ts) — this
  // is the one place that actually kicks off the (billed) LLM call, and only
  // on an explicit click, never automatically on page load.
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
            className="inline-flex items-center gap-1 font-medium text-brand-600 transition-colors hover:text-brand-700"
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

  return (
    <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-900">
          <Sparkles className="flex-shrink-0 text-brand-600" size={15} />
          AI CV Analysis
        </h3>
        <span
          className={cn(
            "text-[17px] font-semibold leading-none",
            scoreColor(data.fitScore)
          )}
        >
          {data.fitScore}%
        </span>
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
          <ul className="space-y-1">
            {data.suggestedQuestions.map((q) => (
              <li className="text-[12px] text-neutral-600" key={q}>
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10.5px] text-neutral-300">
        AI-generated from the CV and job description — always a starting point,
        never the final word.
      </p>
    </div>
  );
};
