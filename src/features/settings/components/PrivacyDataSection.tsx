import { useRef, useState } from "react";
import { Download, Eye, FileText } from "lucide-react";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { ToggleRow } from "@/features/settings/components/ToggleRow";
import { Toggle } from "@/features/talent/components/profile-form/Toggle";
import {
  useMyTalentProfile,
  useUpdateMyTalentProfile,
} from "@/features/talent/talent.queries";
import { useExportMyDataBlob } from "@/features/users/users.queries";
import { downloadPersonalData } from "@/features/users/personal-data-download";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useI18n } from "@/i18n/useI18n";
import { useTranslation } from "@/i18n/useTranslation";

export const PrivacyDataSection = () => {
  const { t } = useTranslation("settings");
  const { locale } = useI18n();
  const runWithToast = useToastMutation();

  const [format, setFormat] = useState<"pdf" | "json">("pdf");

  const { data: profile } = useMyTalentProfile();
  const updateProfileMutation = useUpdateMyTalentProfile();
  const exportBlobMutation = useExportMyDataBlob();
  const inFlight = useRef(false);
  const [exporting, setExporting] = useState(false);

  const isRestricted = profile?.visibility === "VERIFIED_EMPLOYERS";
  const isExporting = exportBlobMutation.isPending || exporting;

  const toggleVisibility = (restricted: boolean) =>
    runWithToast(
      () =>
        updateProfileMutation.mutateAsync({
          visibility: restricted ? "VERIFIED_EMPLOYERS" : "PUBLIC",
        }),
      { error: t("priv2.visFailed") }
    );

  const requestDownload = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setExporting(true);
    try {
      await runWithToast(
        async () => {
          const blob = await exportBlobMutation.mutateAsync({ format, locale });
          await downloadPersonalData(blob, format);
        },
        {
          success:
            format === "pdf" ? t("priv2.exportPdfDone") : t("priv2.exportDone"),
          error: t("priv2.exportFailed"),
        }
      );
    } finally {
      inFlight.current = false;
      setExporting(false);
    }
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="data"
    >
      <SectionHead
        eyebrow={t("priv2.eyebrow")}
        help={t("priv2.help")}
        title={
          <>
            {t("priv2.title")}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              {t("priv2.titleEm")}
            </em>
          </>
        }
      />
      <div className="mb-5 divide-y divide-neutral-50">
        {profile && (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
              <Eye size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-neutral-900">
                {t("priv2.visibility")}
              </p>
              <p className="text-[12px] text-neutral-500">
                {t("priv2.currently")}
                <strong className="text-neutral-800">
                  {isRestricted ? t("priv2.restricted") : t("priv2.public")}
                </strong>
              </p>
            </div>
            <Toggle
              aria-label={t("priv2.visibility")}
              on={isRestricted}
              onChange={toggleVisibility}
            />
          </div>
        )}

        {/* PB17 Personal Data Export Box */}
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-brand-50 text-brand-600">
              <FileText size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-neutral-900">
                {t("priv2.download")}
              </p>
              <p className="text-[12px] text-neutral-400">
                {t("priv2.downloadDesc")}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Format Selector Pills (PDF default) */}
            <div
              role="group"
              aria-label={t("priv2.format")}
              className="inline-flex rounded-8 border border-neutral-200 bg-neutral-50 p-0.5 text-[11px] font-medium"
            >
              <button
                type="button"
                aria-pressed={format === "pdf"}
                disabled={isExporting}
                className={`rounded-6 px-2.5 py-1 transition ${
                  format === "pdf"
                    ? "bg-white font-semibold text-brand-700 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setFormat("pdf")}
              >
                PDF
              </button>
              <button
                type="button"
                aria-pressed={format === "json"}
                disabled={isExporting}
                className={`rounded-6 px-2.5 py-1 transition ${
                  format === "json"
                    ? "bg-white font-semibold text-brand-700 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setFormat("json")}
              >
                JSON
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              className="flex min-w-32 items-center justify-center gap-1.5 rounded-8 bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
              disabled={isExporting}
              aria-busy={isExporting}
              type="button"
              onClick={requestDownload}
            >
              <Download size={13} />
              {isExporting ? t("priv2.preparing") : t("priv2.exportAction")}
            </button>
          </div>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="min-h-5 px-4 text-xs text-neutral-500"
        >
          {isExporting ? t("priv2.preparing") : ""}
        </p>
      </div>

      <ToggleRow
        disabled
        desc={t("priv2.seoDesc")}
        on={false}
        title={t("priv2.seo")}
        onChange={() => {}}
      />
    </section>
  );
};
