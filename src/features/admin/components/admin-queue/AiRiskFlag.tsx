import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  useJobModerationFlag,
  useRegenerateJobModerationFlag,
} from "@/features/admin/admin.queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";
import type { AdminJob, AdminJobModerationRiskLevel } from "@/types/admin";

const RISK_LABEL: Record<AdminJobModerationRiskLevel, string> = {
  LOW: "Low risk",
  MEDIUM: "Medium risk",
  HIGH: "High risk",
};

// Amber/red only for the two tiers that actually warrant a second look —
// LOW stays the same neutral brand-green "clean" color AutomatedChecks uses
// for a passing check, so this reads as one consistent color language with
// the section right above it, not a second unrelated palette.
const RISK_BADGE_CLASS: Record<AdminJobModerationRiskLevel, string> = {
  LOW: "bg-brand-100 text-brand-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

const RISK_ICON: Record<AdminJobModerationRiskLevel, React.ReactNode> = {
  LOW: <ShieldCheck size={12} />,
  MEDIUM: <AlertTriangle size={12} />,
  HIGH: <ShieldAlert size={12} />,
};

interface AiRiskFlagProps {
  job: AdminJob;
}

// Sits directly below AutomatedChecks in the review pane — same "Zap"-style
// section eyebrow, same card-less inline layout — but this signal is AI
// generated and lazily triggered, not computed for free from fields already
// on the job, so it gets its own idle/loading/error states instead of
// rendering inline in that list.
export const AiRiskFlag = ({ job }: AiRiskFlagProps) => {
  const { data, isFetching, isError, fetchStatus, refetch } =
    useJobModerationFlag(job.id);
  const regenerateMutation = useRegenerateJobModerationFlag(job.id);
  const flag = data ?? job.moderationFlag;
  const hasRequested = fetchStatus !== "idle" || !!data;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          <ShieldAlert size={12} /> AI risk check
        </span>
        <span className="text-[10.5px] text-neutral-300">
          Advisory only — you still decide
        </span>
      </div>

      {!flag && !hasRequested && (
        <div className="flex items-center justify-between gap-3 rounded-10 bg-neutral-50 px-3 py-2.5">
          <p className="text-[12px] text-neutral-500">
            Ask AI to scan this posting for scam or quality red flags.
          </p>
          <Button
            className="flex-shrink-0"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            Run AI risk check
          </Button>
        </div>
      )}

      {!flag && isFetching && (
        <div className="flex items-center gap-2.5 rounded-10 bg-neutral-50 px-3 py-2.5">
          <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      )}

      {!flag && !isFetching && isError && (
        <div
          aria-live="polite"
          className="flex items-center justify-between gap-3 rounded-10 bg-neutral-50 px-3 py-2.5 text-[12px] text-neutral-400"
        >
          <span>Couldn&rsquo;t run the risk check.</span>
          <button
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-8 font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {flag && (
        <div
          aria-live="polite"
          className={cn(
            "animate-fade-up space-y-2 rounded-10 py-1",
            // Severity-aware weight, not a second color language — a HIGH
            // flag is the one result an admin genuinely shouldn't skim past,
            // so it gets a border accent; LOW/MEDIUM stay exactly as
            // understated as AutomatedChecks' own rows above.
            flag.riskLevel === "HIGH" &&
              "border-l-2 border-red-300 bg-red-50/40 pl-2.5"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${RISK_BADGE_CLASS[flag.riskLevel]}`}
              >
                {RISK_ICON[flag.riskLevel]}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${RISK_BADGE_CLASS[flag.riskLevel]}`}
                  >
                    {RISK_LABEL[flag.riskLevel]}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">
                  {flag.summary}
                </p>
              </div>
            </div>
            <button
              aria-label="Re-check — runs the analysis again and replaces this one"
              className="rounded-6 grid h-6 w-6 flex-shrink-0 place-items-center text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={regenerateMutation.isPending}
              title="Re-check — runs the analysis again and replaces this one"
              type="button"
              onClick={() => regenerateMutation.mutate()}
            >
              <RefreshCw
                className={cn(regenerateMutation.isPending && "animate-spin")}
                size={12}
              />
            </button>
          </div>

          {flag.reasons.length > 0 && (
            <ul className="ml-7 list-inside list-disc space-y-1">
              {flag.reasons.map((reason, i) => (
                <li
                  className="text-[12px] text-neutral-500 marker:text-neutral-300"
                  key={`${i}-${reason}`}
                >
                  {reason}
                </li>
              ))}
            </ul>
          )}

          <p className="ml-7 text-[10.5px] text-neutral-300">
            Checked {timeAgoLong(flag.createdAt)}
          </p>

          {regenerateMutation.isError && (
            <p className="ml-7 text-[11px] text-red-500">
              Couldn&rsquo;t re-check — showing the previous result.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
