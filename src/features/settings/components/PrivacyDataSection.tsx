import { Download, Eye } from "lucide-react";
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
import { useExportMyData } from "@/features/users/users.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useTranslation } from "@/i18n/useTranslation";

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const PrivacyDataSection = () => {
  const { t } = useTranslation("settings");
  const runWithToast = useToastMutation();

  const { data: profile } = useMyTalentProfile();
  const updateProfileMutation = useUpdateMyTalentProfile();
  const exportMutation = useExportMyData();

  const isRestricted = profile?.visibility === "VERIFIED_EMPLOYERS";

  const toggleVisibility = (restricted: boolean) =>
    runWithToast(
      () =>
        updateProfileMutation.mutateAsync({
          visibility: restricted ? "VERIFIED_EMPLOYERS" : "PUBLIC",
        }),
      { error: t("priv2.visFailed") }
    );

  const requestExport = () =>
    runWithToast(
      async () => {
        const result = await exportMutation.mutateAsync();
        downloadJson(result, "remotesea-data-export.json");
      },
      {
        success: t("priv2.exportDone"),
        error: t("priv2.exportFailed"),
      }
    );

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
      {/* No border/bg wrapper here — same reasoning as SecuritySection's
          session list and TwoFactorSection: this already sits inside the
          section's own bordered card, so a second full frame was doubled
          framing, not extra grouping. */}
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
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
            <Download size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-neutral-900">
              {t("priv2.download")}
            </p>
            <p className="text-[12px] text-neutral-400">
              {t("priv2.downloadDesc")}
            </p>
          </div>
          <button
            className="flex-shrink-0 rounded-8 border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-neutral-700 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
            disabled={exportMutation.isPending}
            type="button"
            onClick={requestExport}
          >
            {exportMutation.isPending
              ? t("priv2.preparing")
              : t("priv2.request")}
          </button>
        </div>
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
