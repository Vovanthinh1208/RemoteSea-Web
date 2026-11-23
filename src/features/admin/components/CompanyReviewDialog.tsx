import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { CompanyDocumentsPanel } from "@/features/company-documents/CompanyDocumentsPanel";
import type { AdminEmployer } from "@/types/admin";

export const CompanyReviewDialog = ({
  employer,
  onClose,
}: {
  employer: AdminEmployer;
  onClose: () => void;
}) => {
  const dialog = useRef<HTMLDialogElement>(null),
    { t } = useTranslation("employer");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const fields = [
    ["owner", employer.user.email],
    ["country", employer.hqCountry],
    ["industry", employer.industry],
    ["size", employer.size],
    ["founded", employer.founded],
    ["website", employer.websiteUrl],
  ];
  return (
    <dialog
      ref={dialog}
      aria-labelledby="company-review-title"
      onCancel={onClose}
      className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-16 border p-5 shadow-card-lg backdrop:bg-black/40"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2
          id="company-review-title"
          className="min-w-0 break-words text-xl font-semibold"
        >
          {employer.companyName}
        </h2>
        <Button variant="outline" onClick={onClose}>
          {t("common.actions.close")}
        </Button>
      </div>
      <dl className="mb-4 grid gap-3 sm:grid-cols-2">
        {fields.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-neutral-500">
              {t(`verificationDocs.${key}`)}
            </dt>
            <dd className="break-words text-sm">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {employer.description && (
        <p className="mb-4 whitespace-pre-wrap break-words text-sm text-neutral-600">
          {employer.description}
        </p>
      )}
      <Link
        to={"/companies/" + employer.slug}
        className="mb-4 inline-block text-sm text-brand-700 underline"
      >
        {t("verificationDocs.profile")}
      </Link>
      <CompanyDocumentsPanel employerId={employer.id} />
    </dialog>
  );
};
