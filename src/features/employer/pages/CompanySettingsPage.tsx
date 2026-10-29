import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PresignedFileUpload } from "@/components/shared/PresignedFileUpload";
import {
  Field,
  Input,
  Textarea,
} from "@/features/post-job/components/form-primitives";
import {
  useEmployerProfile,
  useUpdateEmployerProfile,
} from "@/features/employer/employer.queries";
import {
  toCompanySettingsForm,
  toCompanySettingsPayload,
  validateCompanySettings,
  type CompanySettingsForm,
} from "@/features/employer/company-settings.schemas";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/core/errors/localize";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";
import type { EmployerProfile } from "@/types/employer";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
// PB30 AC3: logos are PNG/JPG only (the cover image keeps WebP).
const LOGO_ACCEPT = "image/png,image/jpeg";

// PB31: the OWNER edits the company's introduction, perks, address, social
// links, intro video, logo and cover image. PATCH /employer/profile checks
// the OWNER role server-side (RC1); other roles get its 403 message here.
export const CompanySettingsPage = () => {
  const { t } = useTranslation("employer");
  const { data: profile, isLoading, isError } = useEmployerProfile();
  useDocumentTitle(t("companySettings.docTitle"));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-6 w-48" />
        <Skeleton className="h-[480px] rounded-16" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {t("companySettings.noCompanyTitle")}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t("companySettings.noCompanyDesc")}
        </p>
        <Link className="mt-6" to={ROUTES.postJob}>
          <Button variant="primary">
            {t("companySettings.createCompany")}
          </Button>
        </Link>
      </div>
    );
  }

  return <CompanySettingsEditor profile={profile} />;
};

const CompanySettingsEditor = ({ profile }: { profile: EmployerProfile }) => {
  const { t } = useTranslation("employer");
  const update = useUpdateEmployerProfile();
  const [form, setForm] = useState<CompanySettingsForm>(() =>
    toCompanySettingsForm(profile)
  );
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof CompanySettingsForm>(key: K, value: string) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    const issues = validateCompanySettings(form);
    setErrors(issues);
    setSaved(false);
    if (issues.length > 0) return;
    try {
      await update.mutateAsync({
        ...toCompanySettingsPayload(form),
        ...(logoUrl && { logoUrl }),
        ...(coverImageUrl && { coverImageUrl }),
      });
      setSaved(true);
    } catch (err) {
      setErrors([getErrorMessage(err, t("companySettings.saveFailed"))]);
    }
  };

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      <Link
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        to={ROUTES.employerDashboard}
      >
        <ArrowLeft size={14} /> {t("companySettings.back")}
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold text-neutral-900">
            {t("companySettings.title")}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("companySettings.subtitle")}
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline"
          to={ROUTES.companyProfile(profile.slug)}
        >
          {t("companySettings.viewPublic")} <ExternalLink size={12} />
        </Link>
      </div>

      <div className="space-y-6 rounded-16 border border-neutral-100 bg-white p-5 sm:p-6">
        <section className="space-y-4">
          <h2 className="text-[14px] font-semibold text-neutral-800">
            {t("companySettings.section.images")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PresignedFileUpload
              accept={LOGO_ACCEPT}
              label={t("companySettings.field.logo")}
              type="logo"
              value={logoUrl ?? profile.logoUrl ?? undefined}
              onUploaded={(url) => {
                setSaved(false);
                setLogoUrl(url);
              }}
            />
            <PresignedFileUpload
              accept={IMAGE_ACCEPT}
              label={t("companySettings.field.cover")}
              type="cover"
              value={coverImageUrl ?? profile.coverImageUrl ?? undefined}
              onUploaded={(url) => {
                setSaved(false);
                setCoverImageUrl(url);
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-semibold text-neutral-800">
            {t("companySettings.section.about")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("companySettings.field.name")} required>
              <Input
                value={form.companyName}
                onChange={(v) => set("companyName", v)}
              />
            </Field>
            <Field label={t("companySettings.field.website")}>
              <Input
                placeholder="https://acme.com"
                value={form.websiteUrl}
                onChange={(v) => set("websiteUrl", v)}
              />
            </Field>
          </div>
          <Field label={t("companySettings.field.description")}>
            <Textarea
              rows={5}
              value={form.description}
              onChange={(v) => set("description", v)}
            />
          </Field>
          <Field
            hint={t("companySettings.field.benefitsHint")}
            label={t("companySettings.field.benefits")}
          >
            <Textarea
              rows={4}
              value={form.benefits}
              onChange={(v) => set("benefits", v)}
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-semibold text-neutral-800">
            {t("companySettings.section.location")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("companySettings.field.country")}>
              <Input
                value={form.hqCountry}
                onChange={(v) => set("hqCountry", v)}
              />
            </Field>
            <Field label={t("companySettings.field.city")}>
              <Input value={form.hqCity} onChange={(v) => set("hqCity", v)} />
            </Field>
          </div>
          <Field label={t("companySettings.field.address")}>
            <Input
              value={form.hqAddress}
              onChange={(v) => set("hqAddress", v)}
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-semibold text-neutral-800">
            {t("companySettings.section.links")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("companySettings.field.linkedin")}>
              <Input
                placeholder="https://www.linkedin.com/company/…"
                value={form.linkedinUrl}
                onChange={(v) => set("linkedinUrl", v)}
              />
            </Field>
            <Field label={t("companySettings.field.facebook")}>
              <Input
                placeholder="https://facebook.com/…"
                value={form.facebookUrl}
                onChange={(v) => set("facebookUrl", v)}
              />
            </Field>
          </div>
          <Field
            hint={t("companySettings.field.videoHint")}
            label={t("companySettings.field.video")}
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=…"
              value={form.videoUrl}
              onChange={(v) => set("videoUrl", v)}
            />
          </Field>
        </section>

        {errors.length > 0 && (
          <ul
            className="space-y-1 rounded-12 bg-red-50 p-3 text-[13px] text-red-700"
            role="alert"
          >
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {saved && (
          <p
            className="rounded-12 bg-emerald-50 p-3 text-[13px] text-emerald-800"
            role="status"
          >
            {t("companySettings.saved")}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            disabled={update.isPending}
            isLoading={update.isPending}
            onClick={onSave}
          >
            {t("companySettings.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};
