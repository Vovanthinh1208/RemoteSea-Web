import { Clock, Globe, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import type { PostJobFormState } from "@/features/post-job/post-job.schemas";
import { formatSalaryRange } from "@/utils/format";
import { useTranslation } from "@/i18n/useTranslation";
import { optionLabel } from "@/i18n/labels";

interface PreviewCardProps {
  form: PostJobFormState;
}

const PREVIEW_SKILLS_DISPLAY_COUNT = 4;

export const PreviewCard = ({ form }: PreviewCardProps) => {
  const { t } = useTranslation("postjob");
  return (
    <div className="rounded-16 border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <CompanyLogo
          name={form.coName || t("preview.defaultCompany")}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-neutral-900">
            {form.jobTitle || t("preview.defaultTitle")}
          </p>
          <p className="truncate text-[12px] text-neutral-500">
            {form.coName || t("preview.defaultCompany")} ·{" "}
            {optionLabel("postjob.opt.hq", form.coHq)}
          </p>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[
          { icon: MapPin, label: optionLabel("postjob.opt.loc", form.jobLoc) },
          {
            icon: Globe,
            label: optionLabel("postjob.opt.seniority", form.jobSeniority),
          },
          {
            icon: Clock,
            label: optionLabel("postjob.opt.tz", form.jobTz)
              .split("·")[0]
              .trim(),
          },
        ].map(({ icon: Icon, label }) => (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500"
            key={label}
          >
            <Icon size={9} />
            {label}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {form.jobSkills.slice(0, PREVIEW_SKILLS_DISPLAY_COUNT).map((s) => (
          <span
            className="rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-medium text-brand-700"
            key={s}
          >
            {s}
          </span>
        ))}
        {form.jobSkills.length > PREVIEW_SKILLS_DISPLAY_COUNT && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10.5px] text-neutral-400">
            +{form.jobSkills.length - PREVIEW_SKILLS_DISPLAY_COUNT}
          </span>
        )}
      </div>
      <div className="mt-3 border-t border-neutral-50 pt-3 text-[12px]">
        <span className="font-semibold text-neutral-900">
          {formatSalaryRange(form.salMin, form.salMax)}
        </span>
        <span className="text-neutral-400">
          {" "}
          {form.salCur} {optionLabel("postjob.opt.period", form.salPer)}
        </span>
      </div>
    </div>
  );
};
