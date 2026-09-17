import { CalendarPlus, User, Video } from "lucide-react";
import { formatSlot } from "@/features/interviews/interview.utils";
import { useDownloadInterviewIcs } from "@/features/interviews/interview.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Interview } from "@/types/interview";

export const UpcomingInterviewCard = ({
  applicationId,
  interview,
}: {
  applicationId: string;
  interview: Interview;
}) => {
  const downloadIcsMutation = useDownloadInterviewIcs(applicationId);
  const runWithToast = useToastMutation();

  const handleAddToCalendar = async (): Promise<void> => {
    await runWithToast(() => downloadIcsMutation.mutateAsync(), {
      error: "Couldn't download the calendar file. Please try again.",
    });
  };

  return (
    <div className="rounded-16 border border-brand-100 bg-brand-50/60 p-5">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
        Upcoming interview
      </p>
      <p className="text-[16px] font-semibold text-neutral-900">
        {interview.confirmedSlot && formatSlot(interview.confirmedSlot)}
      </p>
      <p className="mt-1 text-[13px] text-neutral-500">
        {interview.durationMinutes} minutes · your local time
      </p>
      {interview.interviewer?.name && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-neutral-600">
          <User className="flex-shrink-0 text-neutral-400" size={14} />
          With {interview.interviewer.name}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {interview.meetingUrl && (
          <a
            className={cn(buttonVariants(), "inline-flex items-center gap-1.5")}
            href={interview.meetingUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Video size={15} /> Join interview
          </a>
        )}
        <Button
          disabled={downloadIcsMutation.isPending}
          isLoading={downloadIcsMutation.isPending}
          type="button"
          variant="outline"
          onClick={handleAddToCalendar}
        >
          <CalendarPlus size={15} /> Add to calendar
        </Button>
      </div>
    </div>
  );
};
