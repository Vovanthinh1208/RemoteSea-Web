import { useState } from "react";
import { Flag } from "lucide-react";
import { useReportJob } from "@/features/jobs/job-reports.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { Button } from "@/components/ui/button";
import {
  SELECT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import {
  JOB_REPORT_REASON_LABELS,
  type JobReportReason,
} from "@/types/job-report";

const REASON_OPTIONS = Object.entries(JOB_REPORT_REASON_LABELS) as [
  JobReportReason,
  string,
][];

const ALREADY_REPORTED_STATUS = 409;

interface ReportJobFormProps {
  jobId: string;
}

// Inline expand/collapse, not a modal — no Dialog/Sheet primitive exists
// anywhere in this codebase, and a 2-field form doesn't warrant hand-rolling
// one. Self-contained (owns its own open/submitted state) so JobCompanyCard
// only needs to render this one component.
export const ReportJobForm = ({ jobId }: ReportJobFormProps) => {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState<JobReportReason>("SCAM");
  const [details, setDetails] = useState("");
  const runWithToast = useToastMutation();
  const reportMutation = useReportJob();

  if (submitted) {
    return (
      <p className="mt-3 text-[12px] text-neutral-400">
        Thanks — our team will take a look.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        className="mt-3 inline-flex items-center gap-1 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Flag size={11} /> Report this job
      </button>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runWithToast(
      () =>
        reportMutation.mutateAsync({
          jobId,
          reason,
          details: details || undefined,
        }),
      {
        error: "Couldn't submit report",
        onError: (err) =>
          err instanceof ApiError && err.status === ALREADY_REPORTED_STATUS
            ? "You've already reported this job."
            : undefined,
      }
    );
    if (ok) setSubmitted(true);
  };

  return (
    <form
      className="mt-3 space-y-2 border-t border-neutral-100 pt-3"
      onSubmit={onSubmit}
    >
      <label
        className="block text-[12px] font-medium text-neutral-600"
        htmlFor="report-reason"
      >
        What's wrong with this listing?
      </label>
      <select
        className={SELECT_INPUT_CLASS}
        id="report-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value as JobReportReason)}
      >
        {REASON_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <textarea
        className={TEXTAREA_INPUT_CLASS}
        placeholder="Any details that would help us review this (optional)"
        rows={2}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          disabled={reportMutation.isPending}
          isLoading={reportMutation.isPending}
          size="sm"
          type="submit"
        >
          Submit report
        </Button>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
