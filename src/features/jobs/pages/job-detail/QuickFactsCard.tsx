import { Clock, FileText, Globe, Monitor, Repeat } from "lucide-react";
import { JOB_TYPE_LABELS } from "@/features/jobs/jobs.utils";
import type { Job } from "@/types/job";
import { useTranslation } from "@/i18n/useTranslation";

const DEFAULT_INTERVIEW_ROUNDS = "~3";

interface QuickFactsCardProps {
  job: Job;
}

export const QuickFactsCard = ({ job }: QuickFactsCardProps) => {
  const { t } = useTranslation("jobs");
  const country = job.country ?? job.employer.hqCountry ?? t("card.remote");
  const timezone = job.timezone ?? (job.isRemote ? t("card.remote") : country);
  const hasEquipmentBenefit = job.benefits.some((b) =>
    b.toLowerCase().includes("equipment")
  );

  const facts = [
    {
      // Globe, not MapPin — this row is about visa/work-authorization
      // status, not a place; MapPin conventionally signals location.
      icon: <Globe size={13} />,
      k: t("detail.visa"),
      v: t("detail.visaValue"),
    },
    { icon: <Clock size={13} />, k: t("detail.tzOverlap"), v: timezone },
    {
      icon: <FileText size={13} />,
      k: t("detail.contractType"),
      v: JOB_TYPE_LABELS[job.jobType],
    },
    {
      icon: <Monitor size={13} />,
      k: t("detail.equipment"),
      v: hasEquipmentBenefit ? t("detail.provided") : t("detail.selfSupplied"),
    },
    {
      // Repeat, not Users — this row is a count of process steps, not team
      // size; Users conventionally signals people/headcount.
      icon: <Repeat size={13} />,
      k: t("detail.interviewRounds"),
      v: DEFAULT_INTERVIEW_ROUNDS,
    },
  ];

  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <h4 className="mb-3 text-[13px] font-semibold text-neutral-900">
        {t("detail.quickFacts")}
      </h4>
      <div className="space-y-2.5">
        {facts.map((r) => (
          <div
            className="flex items-center justify-between text-[13px]"
            key={r.k}
          >
            <span className="flex items-center gap-1.5 text-neutral-400">
              {r.icon} {r.k}
            </span>
            <span className="font-medium text-neutral-700">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
