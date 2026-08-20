import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { timeAgoLong } from "@/utils/time";
import { buildTimelineSteps } from "@/features/talent/talent-dashboard.utils";
import type { Application } from "@/types/application";

interface TimelineItem {
  label: string;
  timestamp: string | null;
  reached: boolean;
  negative?: boolean;
}

interface TimelineStepProps extends TimelineItem {
  first: boolean;
  connectorFilled: boolean;
}

const TimelineStep = ({
  label,
  timestamp,
  reached,
  negative,
  first,
  connectorFilled,
}: TimelineStepProps) => (
  <>
    {!first && (
      <span
        className={cn(
          "mt-[9px] h-px w-8 flex-shrink-0 sm:w-12",
          connectorFilled ? "bg-brand-300" : "bg-neutral-200"
        )}
      />
    )}
    <div className="flex w-[96px] flex-shrink-0 flex-col items-center text-center sm:w-[112px]">
      <span
        className={cn(
          "grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border",
          reached
            ? negative
              ? "border-red-500 bg-red-500"
              : "border-brand-600 bg-brand-600"
            : "border-neutral-300 bg-white"
        )}
      >
        {reached && <Check className="text-white" size={10} strokeWidth={3} />}
      </span>
      <p
        className={cn(
          "mt-2 text-[11.5px] font-medium leading-tight",
          reached ? "text-neutral-900" : "text-neutral-400"
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 text-[10.5px] text-neutral-400">
        {timestamp ? timeAgoLong(timestamp) : "Not yet"}
      </p>
    </div>
  </>
);

interface ApplicationTimelineProps {
  application: Application;
}

export const ApplicationTimeline = ({
  application,
}: ApplicationTimelineProps) => {
  const steps = buildTimelineSteps(application);
  const isNegative = (status: string) =>
    status === "REJECTED" || status === "WITHDRAWN";

  const items: TimelineItem[] = [
    { label: "Applied", timestamp: application.appliedAt, reached: true },
    {
      label: "Viewed by employer",
      timestamp: application.viewedAt,
      reached: !!application.viewedAt,
    },
    ...steps.map((step) => ({
      label: step.label,
      timestamp: step.timestamp,
      reached: step.reached,
      negative: isNegative(step.status),
    })),
  ];

  return (
    <div className="overflow-x-auto border-t border-neutral-50 bg-neutral-50/40 px-5 py-5">
      <div className="flex w-max items-start">
        {items.map((item, i) => (
          <TimelineStep
            connectorFilled={i > 0 && items[i - 1].reached}
            first={i === 0}
            key={`${item.label}-${i}`}
            label={item.label}
            negative={item.negative}
            reached={item.reached}
            timestamp={item.timestamp}
          />
        ))}
      </div>
    </div>
  );
};
