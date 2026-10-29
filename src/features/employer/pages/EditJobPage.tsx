import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/shared/rich-text/RichTextEditor";
import {
  Field,
  Input,
  Select,
  Textarea,
} from "@/features/post-job/components/form-primitives";
import { useJobQuery, useUpdateJob } from "@/features/jobs/jobs.queries";
import {
  EDITABLE_JOB_STATUSES,
  toJobEditForm,
  toUpdateJobPayload,
  validateJobEdit,
  type JobEditFormState,
} from "@/features/employer/job-edit/job-edit.schemas";
import { JOB_TYPE_LABELS, LEVEL_LABELS } from "@/utils/labels";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/core/errors/localize";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";
import type { ExperienceLevel, Job, JobType } from "@/types/job";

const JOB_TYPES = Object.keys(JOB_TYPE_LABELS) as JobType[];
const LEVELS = Object.keys(LEVEL_LABELS) as ExperienceLevel[];

// PB42: edit a DRAFT or REJECTED listing. The listing is loaded through the
// member preview of GET /jobs/:id (PB48 RC1); PATCH /jobs/:id enforces the
// status and company checks again server-side (AC4).
export const EditJobPage = () => {
  const { t } = useTranslation("employer");
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError } = useJobQuery(id);
  useDocumentTitle(t("jobEdit.docTitle"));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-6 w-40" />
        <Skeleton className="h-96 rounded-16" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <JobEditNotice
        body={t("jobEdit.notFoundDesc")}
        title={t("jobEdit.notFoundTitle")}
      />
    );
  }

  if (!EDITABLE_JOB_STATUSES.includes(job.status)) {
    return (
      <JobEditNotice
        body={t("jobEdit.notEditableDesc")}
        title={t("jobEdit.notEditableTitle")}
      />
    );
  }

  // Keyed by id so opening another listing starts from its own values.
  return <EditJobForm job={job} key={job.id} />;
};

const EditJobForm = ({ job }: { job: Job }) => {
  const { t } = useTranslation("employer");
  const navigate = useNavigate();
  const updateJob = useUpdateJob();
  const [form, setForm] = useState<JobEditFormState>(() => toJobEditForm(job));
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof JobEditFormState>(
    key: K,
    value: JobEditFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    const issues = validateJobEdit(form);
    setErrors(issues);
    if (issues.length > 0) return;
    try {
      await updateJob.mutateAsync({
        id: job.id,
        payload: toUpdateJobPayload(form),
      });
      // AC5: show the updated listing (the member preview of the detail page).
      navigate(ROUTES.jobDetail(job.id));
    } catch (err) {
      setErrors([getErrorMessage(err, t("jobEdit.saveFailed"))]);
    }
  };

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      <Link
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        to={ROUTES.employerDashboard}
      >
        <ArrowLeft size={14} /> {t("jobEdit.back")}
      </Link>
      <h1 className="text-[22px] font-semibold text-neutral-900">
        {t("jobEdit.title")}
      </h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        {t("jobEdit.subtitle")}
      </p>

      <div className="space-y-4 rounded-16 border border-neutral-100 bg-white p-5 sm:p-6">
        <Field label={t("jobEdit.field.title")} required>
          <Input value={form.title} onChange={(v) => set("title", v)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("jobEdit.field.jobType")} required>
            <Select
              options={JOB_TYPES.map((v) => ({
                value: v,
                label: JOB_TYPE_LABELS[v],
              }))}
              value={form.jobType}
              onChange={(v) => set("jobType", v as JobType)}
            />
          </Field>
          <Field label={t("jobEdit.field.level")} required>
            <Select
              options={LEVELS.map((v) => ({
                value: v,
                label: LEVEL_LABELS[v],
              }))}
              value={form.level}
              onChange={(v) => set("level", v as ExperienceLevel)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("jobEdit.field.salaryMin")} required>
            <Input
              min={1}
              type="number"
              value={form.salaryMin}
              onChange={(v) => set("salaryMin", v)}
            />
          </Field>
          <Field label={t("jobEdit.field.salaryMax")} required>
            <Input
              min={1}
              type="number"
              value={form.salaryMax}
              onChange={(v) => set("salaryMax", v)}
            />
          </Field>
          <Field label={t("jobEdit.field.currency")} required>
            <Input
              value={form.currency}
              onChange={(v) => set("currency", v.toUpperCase())}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("jobEdit.field.timezone")}>
            <Input value={form.timezone} onChange={(v) => set("timezone", v)} />
          </Field>
          <Field label={t("jobEdit.field.country")}>
            <Input value={form.country} onChange={(v) => set("country", v)} />
          </Field>
        </div>
        <Field label={t("jobEdit.field.description")} required>
          <RichTextEditor
            rows={8}
            value={form.description}
            onChange={(v) => set("description", v)}
          />
        </Field>
        <Field label={t("jobEdit.field.requirements")}>
          <Textarea
            rows={4}
            value={form.requirements}
            onChange={(v) => set("requirements", v)}
          />
        </Field>
        <Field
          hint={t("jobEdit.field.benefitsHint")}
          label={t("jobEdit.field.benefits")}
        >
          <Textarea
            rows={3}
            value={form.benefits}
            onChange={(v) => set("benefits", v)}
          />
        </Field>

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

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Link to={ROUTES.employerDashboard}>
            <Button className="w-full sm:w-auto" variant="soft">
              {t("jobEdit.cancel")}
            </Button>
          </Link>
          <Button
            disabled={updateJob.isPending}
            isLoading={updateJob.isPending}
            onClick={onSave}
          >
            {t("jobEdit.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const JobEditNotice = ({ title, body }: { title: string; body: string }) => {
  const { t } = useTranslation("employer");
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="mt-2 text-sm text-neutral-500">{body}</p>
      <Link className="mt-6" to={ROUTES.employerDashboard}>
        <Button variant="primary">{t("jobEdit.back")}</Button>
      </Link>
    </div>
  );
};
