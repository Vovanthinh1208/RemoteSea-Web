import { cn } from "@/utils/cn";
import { TIER_BADGE_CLASS } from "@/utils/color";
import type { NoticePeriod } from "@/types/talent";

interface AvailabilityBadgeProps {
  isOpenToWork: boolean;
  noticePeriod: NoticePeriod | null;
  className?: string;
}

const NOTICE_PERIOD_LABEL: Record<NoticePeriod, string> = {
  Immediate: "Available now",
  "2 weeks": "Available in 2 weeks",
  "1 month": "Available in 1 month",
  "2+ months": "Available in 2+ months",
};

const NOTICE_PERIOD_TIER: Record<NoticePeriod, keyof typeof TIER_BADGE_CLASS> =
  {
    Immediate: "high",
    "2 weeks": "mid",
    "1 month": "low",
    "2+ months": "low",
  };

export const AvailabilityBadge = ({
  isOpenToWork,
  noticePeriod,
  className,
}: AvailabilityBadgeProps) => {
  if (!isOpenToWork) return null;

  const label = noticePeriod
    ? NOTICE_PERIOD_LABEL[noticePeriod]
    : "Open to work";
  const tier = noticePeriod
    ? TIER_BADGE_CLASS[NOTICE_PERIOD_TIER[noticePeriod]]
    : TIER_BADGE_CLASS.mid;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
        tier,
        className
      )}
    >
      {label}
    </span>
  );
};
