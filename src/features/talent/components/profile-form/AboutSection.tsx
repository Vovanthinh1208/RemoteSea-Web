import type { UseFormRegister } from "react-hook-form";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { FieldError } from "@/components/shared/FieldError";
import {
  SELECT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import {
  NOTICE_PERIOD_OPTIONS,
  PRIMARY_ROLE_OPTIONS,
  RIGHT_TO_WORK_OPTIONS,
  SENIORITY_OPTIONS,
  YEARS_BUCKETS,
} from "@/features/talent/talent.constants";
import type { ProfileFormValues } from "@/features/talent/talent.schemas";
import { optionLabel } from "@/i18n/labels";
import { useTranslation } from "@/i18n/useTranslation";

interface AboutSectionProps {
  register: UseFormRegister<ProfileFormValues>;
  bioError?: string;
  bioLength: number;
}

const MAX_BIO_LENGTH = 320;

export const AboutSection = ({
  register,
  bioError,
  bioLength,
}: AboutSectionProps) => {
  const { t } = useTranslation("talent");
  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="about"
    >
      <SectionHead
        eyebrow={t("about.eyebrow")}
        help={t("about.help")}
        title={
          <>
            {t("about.title")}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              {t("about.titleEm")}
            </em>
          </>
        }
      />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className="text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-bio"
            >
              {t("about.bio")}{" "}
              <span className="font-normal text-neutral-400">
                {t("about.bioHint")}
              </span>
            </label>
            <span className="text-[11px] text-neutral-400">
              {bioLength} / {MAX_BIO_LENGTH}
            </span>
          </div>
          <textarea
            className={TEXTAREA_INPUT_CLASS}
            id="p-bio"
            rows={4}
            {...register("bio")}
          />
          <FieldError message={bioError} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label
              className="block text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-seniority"
            >
              {t("about.seniority")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              id="p-seniority"
              {...register("seniority")}
            >
              {SENIORITY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {optionLabel("talent.opt.seniority", o)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              className="block text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-years"
            >
              {t("about.years")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              id="p-years"
              {...register("yearsBucket")}
            >
              {YEARS_BUCKETS.map((o) => (
                <option key={o} value={o}>
                  {optionLabel("talent.opt.years", o)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              className="block text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-role"
            >
              {t("about.role")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              id="p-role"
              {...register("primaryRole")}
            >
              {PRIMARY_ROLE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {optionLabel("talent.opt.role", o)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="block text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-rtw"
            >
              {t("about.rtw")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              id="p-rtw"
              {...register("rightToWork")}
            >
              {RIGHT_TO_WORK_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {optionLabel("talent.opt.rtw", o)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              className="block text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-notice"
            >
              {t("about.notice")}
            </label>
            <select
              className={SELECT_INPUT_CLASS}
              id="p-notice"
              {...register("noticePeriod")}
            >
              {NOTICE_PERIOD_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {optionLabel("talent.opt.notice", o)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
