import { useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useMyCompanyRole } from "@/features/team/team.queries";
import {
  downloadCompanyDocument,
  listCompanyDocuments,
  uploadCompanyDocument,
  type CompanyDocument,
} from "./company-documents.service";

export const CompanyDocumentsPanel = ({
  employerId,
  canUpload = false,
}: {
  employerId?: string;
  canUpload?: boolean;
}) => {
  const { t } = useTranslation("employer"),
    client = useQueryClient(),
    inputId = useId(),
    toast = useToastMutation();
  const [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    inFlight = useRef(false),
    [downloading, setDownloading] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const key = ["company-verification-documents", employerId ?? "own"];
  const query = useQuery({
    queryKey: key,
    queryFn: () => listCompanyDocuments(employerId),
    staleTime: 0,
  });
  const upload = useMutation({
    mutationFn: uploadCompanyDocument,
    networkMode: "always",
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const send = async () => {
    if (!file || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const ok = await toast(
        async () => {
          if (
            file.type !== "application/pdf" ||
            file.size > 5 * 1024 * 1024 ||
            !file.size
          )
            throw Error(t("verificationDocs.invalid"));
          await upload.mutateAsync(file);
        },
        {
          success: t("verificationDocs.uploaded"),
          error: t("verificationDocs.uploadFailed"),
        }
      );
      if (ok) {
        setFile(null);
        if (fileInput.current) fileInput.current.value = "";
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const download = async (doc: CompanyDocument) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setDownloading(doc.id);
    try {
      await toast(() => downloadCompanyDocument(doc), {
        success: t("verificationDocs.downloaded"),
        error: t("verificationDocs.downloadFailed"),
      });
    } finally {
      inFlight.current = false;
      setDownloading(null);
    }
  };
  return (
    <section
      aria-label={t("verificationDocs.title")}
      className="space-y-3 rounded-12 border border-neutral-100 bg-white p-4"
    >
      <h2 className="text-base font-semibold">{t("verificationDocs.title")}</h2>
      <p className="text-xs text-neutral-500">
        {t("verificationDocs.privacy")}
      </p>
      {query.isLoading ? (
        <p role="status">{t("common.a11y.loading")}</p>
      ) : query.isError ? (
        <div role="alert">
          <p>{t("verificationDocs.loadFailed")}</p>
          <Button onClick={() => void query.refetch()}>
            {t("common.actions.retry")}
          </Button>
        </div>
      ) : query.data?.length ? (
        <ul className="space-y-2">
          {query.data.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border p-3"
            >
              <span className="min-w-0 break-all text-sm">
                {doc.filename}{" "}
                <span className="text-xs text-neutral-500">
                  ({Math.ceil(doc.byteLength / 1024)} KB)
                </span>
              </span>
              <Button
                size="sm"
                disabled={busy || !!downloading}
                onClick={() => void download(doc)}
              >
                {downloading === doc.id
                  ? t("verificationDocs.downloading")
                  : t("verificationDocs.download")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">
          {t("verificationDocs.empty")}
        </p>
      )}
      {canUpload && (
        <div className="space-y-2 border-t pt-3">
          <label className="block text-sm" htmlFor={inputId}>
            {t("verificationDocs.attach")}
          </label>
          <input
            className="block max-w-full text-sm"
            id={inputId}
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
            disabled={busy || !!downloading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-neutral-500">
            {t("verificationDocs.limits")}
          </p>
          <Button
            disabled={
              !file || busy || !!downloading || (query.data?.length ?? 0) >= 10
            }
            isLoading={busy}
            onClick={() => void send()}
          >
            {t("verificationDocs.upload")}
          </Button>
        </div>
      )}
    </section>
  );
};

export const OwnerCompanyDocuments = () => {
  const role = useMyCompanyRole();
  return role === "OWNER" ? <CompanyDocumentsPanel canUpload /> : null;
};
