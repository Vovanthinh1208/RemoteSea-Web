import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { timeAgoLong } from "@/utils/time";
import { buildTimelineSteps } from "@/features/talent/talent-dashboard.utils";
import type { Application } from "@/types/application";

interface TimelineRowProps {
  label: string;
  timestamp: string | null;
  reached: boolean;
  negative?: boolean;
  last?: boolean;
}

const TimelineRow = ({
  label,
  timestamp,
  reached,
  negative,
  last,
}: TimelineRowProps) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col items-center self-stretch">
      <span
        className={cn(
          "grid h-4 w-4 flex-shrink-0 place-items-center rounded-full border",
          reached
            ? negative
              ? "border-red-500 bg-red-500"
              : "border-brand-600 bg-brand-600"
            : "border-neutral-300 bg-white"
        )}
      >
        {reached && <Check className="text-white" size={9} strokeWidth={3} />}
      </span>
      {!last && (
        <span
          className={cn(
            "w-px flex-1",
            reached ? "bg-brand-200" : "bg-neutral-200"
          )}
        />
      )}
    </div>
    <div className="min-w-0 flex-1 pb-4">
      <p
        className={cn(
          "text-[12.5px] font-medium",
          reached ? "text-neutral-900" : "text-neutral-400"
        )}
      >
        {label}
      </p>
      <p className="text-[11px] text-neutral-400">
        {timestamp ? timeAgoLong(timestamp) : "Not yet"}
      </p>
    </div>
  </div>
);

interface ApplicationTimelineProps {
  application: Application;
}

/** Application Transparency — the per-application timeline, expanded inline
 * from ApplicationsTable's rows (see plan: no new detail page/route). */
export const ApplicationTimeline = ({
  application,
}: ApplicationTimelineProps) => {
  const steps = buildTimelineSteps(application);
  const isNegative = (status: string) =>
    status === "REJECTED" || status === "WITHDRAWN";

  return (
    <div className="border-t border-neutral-50 bg-neutral-50/40 px-5 py-4">
      <TimelineRow label="Applied" reached timestamp={application.appliedAt} />
      <TimelineRow
        label="Viewed by employer"
        reached={!!application.viewedAt}
        timestamp={application.viewedAt}
      />
      {steps.map((step, i) => (
        <TimelineRow
          key={step.status}
          label={step.label}
          last={i === steps.length - 1}
          negative={isNegative(step.status)}
          reached={step.reached}
          timestamp={step.timestamp}
        />
      ))}
    </div>
  );
};
