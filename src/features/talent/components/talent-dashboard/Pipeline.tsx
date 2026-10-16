import { useMemo } from "react";
import { cn } from "@/utils/cn";
import {
  STATUS_TO_BUCKET,
  type AppStatusBucket,
} from "@/features/talent/talent-dashboard.utils";
import type { ApplicationWithJob } from "@/types/application";
import { useTranslation } from "@/i18n/useTranslation";

interface PipelineProps {
  applications: ApplicationWithJob[];
}

export const Pipeline = ({ applications }: PipelineProps) => {
  const { t } = useTranslation("talent");
  const counts = useMemo(() => {
    const c: Record<AppStatusBucket, number> = {
      applied: 0,
      review: 0,
      interview: 0,
      offer: 0,
      closed: 0,
    };
    for (const a of applications) c[STATUS_TO_BUCKET[a.status]] += 1;
    return c;
  }, [applications]);

  const stages: { id: string; label: string; n: number; active?: boolean }[] = [
    { id: "applied", label: t("bucket.applied"), n: counts.applied },
    { id: "review", label: t("bucket.review"), n: counts.review },
    {
      id: "interview",
      label: t("bucket.interview"),
      n: counts.interview,
      active: true,
    },
    { id: "offer", label: t("bucket.offers"), n: counts.offer },
    { id: "closed", label: t("bucket.closed"), n: counts.closed },
  ];
  return (
    <div className="flex border-b border-neutral-100 bg-neutral-50/50">
      {stages.map((s, i) => (
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1.5 py-3 text-center sm:px-2",
            i < stages.length - 1 && "border-r border-neutral-100",
            s.active && "border-b-2 border-brand-600 bg-white"
          )}
          key={s.id}
        >
          <span
            className={cn(
              "font-mono text-[20px] font-semibold leading-none tracking-tight",
              s.active ? "text-brand-700" : "text-neutral-900"
            )}
          >
            {s.n.toString().padStart(2, "0")}
          </span>
          {/* Column width is 1/5 of the card and can't grow past that (no
              horizontal scroll on this row), so a single long word like
              "Interviewing" needs to truncate instead of forcing the whole
              row — and the page — wider than the viewport on narrow phones. */}
          <span
            className={cn(
              "w-full truncate text-[11px]",
              s.active ? "font-medium text-brand-600" : "text-neutral-400"
            )}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};
