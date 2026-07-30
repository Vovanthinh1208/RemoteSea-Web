import { useState } from "react";
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
  const runWithToast = useToastMutation();
  const [indexing, setIndexing] = useState(false);

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
      { error: "Couldn't update visibility" }
    );

  const requestExport = () =>
    runWithToast(
      async () => {
        const result = await exportMutation.mutateAsync();
        downloadJson(result, "remotesea-data-export.json");
      },
      {
        success: "Export downloaded",
        error: "Couldn't export your data",
      }
    );

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="data"
    >
      <SectionHead
        eyebrow="05 · Your data"
        help="Control how visible you are and take your data with you whenever you want."
        title={
          <>
            Privacy &amp;{" "}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              data.
            </em>
          </>
        }
      />
      <div className="mb-5 divide-y divide-neutral-50 overflow-hidden rounded-16 border border-neutral-100">
        {profile && (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
              <Eye size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-neutral-900">
                Profile visibility
              </p>
              <p className="text-[12px] text-neutral-500">
                Currently{" "}
                <strong className="text-neutral-800">
                  {isRestricted
                    ? "Verified employers only"
                    : "Public"}
                </strong>
              </p>
            </div>
            <Toggle on={isRestricted} onChange={toggleVisibility} />
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
            <Download size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-neutral-900">
              Download your data
            </p>
            <p className="text-[12px] text-neutral-400">
              Your profile, applications, and job alerts as a JSON
              export.
            </p>
          </div>
          <button
            className="flex-shrink-0 rounded-8 border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-neutral-700 hover:border-neutral-300 disabled:opacity-60"
            disabled={exportMutation.isPending}
            type="button"
            onClick={requestExport}
          >
            {exportMutation.isPending ? "Preparing…" : "Request"}
          </button>
        </div>
      </div>
      <div className="divide-y divide-neutral-50 rounded-16 border border-neutral-100 bg-white px-4">
        <ToggleRow
          desc="Off by default. When on, your public talent page can appear in Google results."
          on={indexing}
          title="Let search engines index my public profile"
          onChange={setIndexing}
        />
      </div>
    </section>
  );
};
