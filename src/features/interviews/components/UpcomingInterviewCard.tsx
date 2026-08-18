import { Video } from "lucide-react";
import { formatSlot } from "@/features/interviews/interview.utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Interview } from "@/types/interview";

export const UpcomingInterviewCard = ({
  interview,
}: {
  interview: Interview;
}) => (
  <div className="rounded-16 border border-brand-100 bg-brand-50/60 p-5">
    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
      Upcoming interview
    </p>
    <p className="text-[16px] font-semibold text-neutral-900">
      {interview.confirmedSlot && formatSlot(interview.confirmedSlot)}
    </p>
    <p className="mt-1 text-[13px] text-neutral-500">
      {interview.durationMinutes} minutes
    </p>
    {interview.meetingUrl && (
      <a
        className={cn(
          buttonVariants(),
          "mt-4 inline-flex items-center gap-1.5"
        )}
        href={interview.meetingUrl}
        rel="noreferrer"
        target="_blank"
      >
        <Video size={15} /> Join interview
      </a>
    )}
  </div>
);
