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
          const blob = await exportBlobMutation.mutateAsync({
            format: "pdf",
            locale,
          });
          await downloadPersonalData(blob, "pdf");
        },
        {
          success: t("priv2.exportPdfDone"),
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

          <div className="flex flex-shrink-0 items-center self-start sm:self-auto">
            {/* Primary Action Button (PB17 - PDF export only) */}
            <button
              className="flex min-w-36 items-center justify-center gap-1.5 rounded-8 bg-brand-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
              disabled={isExporting}
              aria-busy={isExporting}
              type="button"
              onClick={requestDownload}
            >
              <Download size={14} />
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
