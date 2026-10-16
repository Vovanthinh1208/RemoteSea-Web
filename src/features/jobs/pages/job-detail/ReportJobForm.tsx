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
  JOB_REPORT_REASONS,
  jobReportReasonLabel,
  type JobReportReason,
} from "@/types/job-report";
import { useTranslation } from "@/i18n/useTranslation";

const ALREADY_REPORTED_STATUS = 409;

interface ReportJobFormProps {
  jobId: string;
}

// Inline expand/collapse, not a modal — no Dialog/Sheet primitive exists
// anywhere in this codebase, and a 2-field form doesn't warrant hand-rolling
// one. Self-contained (owns its own open/submitted state) so JobCompanyCard
// only needs to render this one component.
export const ReportJobForm = ({ jobId }: ReportJobFormProps) => {
  const { t } = useTranslation("jobs");
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState<JobReportReason>("SCAM");
  const [details, setDetails] = useState("");
  const runWithToast = useToastMutation();
  const reportMutation = useReportJob();

  if (submitted) {
    return (
      <p className="mt-3 text-[12px] text-neutral-400">{t("report.thanks")}</p>
    );
  }

  if (!open) {
    return (
      <button
        className="mt-3 inline-flex items-center gap-1 rounded-4 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:shadow-focus focus-visible:outline-none"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Flag size={11} /> {t("report.open")}
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
        error: t("report.failedToast"),
        onError: (err) =>
          err instanceof ApiError && err.status === ALREADY_REPORTED_STATUS
            ? t("report.alreadyReported")
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
        {t("report.question")}
      </label>
      <select
        className={SELECT_INPUT_CLASS}
        id="report-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value as JobReportReason)}
      >
        {JOB_REPORT_REASONS.map((value) => (
          <option key={value} value={value}>
            {jobReportReasonLabel(value)}
          </option>
        ))}
      </select>
      <textarea
        className={TEXTAREA_INPUT_CLASS}
        placeholder={t("report.detailsPlaceholder")}
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
          {t("report.submit")}
        </Button>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          {t("common.actions.cancel")}
        </Button>
      </div>
    </form>
  );
};
