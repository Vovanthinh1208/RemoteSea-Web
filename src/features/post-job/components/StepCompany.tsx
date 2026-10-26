import {
  Field,
  Input,
  Select,
  Textarea,
} from "@/features/post-job/components/form-primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { optionLabel } from "@/i18n/labels";
import {
  COMPANY_SIZE_OPTIONS,
  HQ_OPTIONS,
  type PostJobStepProps,
} from "@/features/post-job/post-job.schemas";

export const StepCompany = ({ form, set }: PostJobStepProps) => {
  const { t } = useTranslation("postjob");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-semibold text-neutral-900">
          {t("company.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{t("company.subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("company.name")} required>
          <Input
            placeholder={t("company.namePlaceholder")}
            value={form.coName}
            onChange={(v) => set("coName", v)}
          />
        </Field>
        <Field label={t("company.website")} required>
          <Input
            placeholder="https://acme.com"
            value={form.coWeb}
            onChange={(v) => set("coWeb", v)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("company.size")} required>
          <Select
            options={COMPANY_SIZE_OPTIONS.map((o) => ({
              value: o,
              label: optionLabel("postjob.opt.size", o),
            }))}
            value={form.coSize}
            onChange={(v) => set("coSize", v)}
          />
        </Field>
        <Field label={t("company.hq")} required>
          <Select
            options={HQ_OPTIONS.map((o) => ({
              value: o,
              label: optionLabel("postjob.opt.hq", o),
            }))}
            value={form.coHq}
            onChange={(v) => set("coHq", v)}
          />
        </Field>
      </div>
      <Field hint={t("company.taglineHint")} label={t("company.tagline")}>
        <Input
          placeholder={t("company.taglinePlaceholder")}
          value={form.coTag}
          onChange={(v) => set("coTag", v)}
        />
      </Field>
      <Field
        hint={t("company.overviewHint")}
        label={t("company.overview")}
        required
      >
        <Textarea
          placeholder={t("company.overviewPlaceholder")}
          rows={4}
          value={form.coAbout}
          onChange={(v) => set("coAbout", v)}
        />
      </Field>

      <div className="border-t border-neutral-100 pt-5">
        <h3 className="mb-4 text-[14px] font-semibold text-neutral-800">
          {t("company.recruiter")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("company.fullName")} required>
            <Input
              placeholder={t("company.fullNamePlaceholder")}
              value={form.recName}
              onChange={(v) => set("recName", v)}
            />
          </Field>
          <Field label={t("company.role")}>
            <Input
              placeholder={t("company.rolePlaceholder")}
              value={form.recRole}
              onChange={(v) => set("recRole", v)}
            />
          </Field>
          <Field label={t("company.workEmail")} required>
            <Input
              placeholder="alex@acme.com"
              type="email"
              value={form.recEmail}
              onChange={(v) => set("recEmail", v)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
};
